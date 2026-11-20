"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { alphaEmail, betaEmail } from "@/lib/programTemplates";
import { redis } from "@/lib/redis";
import { Pinecone } from '@pinecone-database/pinecone';
import { $Enums } from "@prisma/client";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { handleSignOut } from "./auth";

export const insertUser = async (username: string, email: string, password: string) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name: username,
                password: hashedPassword,
                id: uuidv4(),
                updatedAt: new Date(),
            }
        });
        await insertUserIdInRedis(user.id);
        return {
            status: 200,
            body: {
                message: "User created successfully",
                user,
            },
        };
    } catch (error) {
        console.error("INSERT USER ERROR", error);
        return {
            status: 500,
            body: {
                error: "An error occurred",
            },
        };
    }
}

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
})

const index = pc.index(process.env.PINECONE_INDEX!);

export const deleteUserAndRelatedData = async (userId: string) => {
    const p = prisma;
    return await p.$transaction(async (tx) => {
        // 1. Get all memory IDs and chunk IDs before deletion for cleanup
        const memories = await tx.memory.findMany({
            where: { userId },
            select: { memId: true, chunkId: true }
        });

        // 2. Delete all related records in order of dependencies
        await Promise.all([
            // Delete API keys
            tx.apiKeys.deleteMany({ where: { userId } }),

            // Delete social connections
            tx.socialUser.deleteMany({ where: { userId } }),

            // Delete sessions and tokens
            tx.session.deleteMany({ where: { userId } }),
            tx.accessTokens.deleteMany({ where: { userId } }),

            // Delete connected external services
            tx.connectedNotionPages.deleteMany({ where: { userId } }),
            tx.connectedGDriveFiles.deleteMany({ where: { userId } }),

            // Delete shared resources
            tx.sharedMemory.deleteMany({
                where: {
                    OR: [
                        { fromUserId: userId },
                        { toUserId: userId }
                    ]
                }
            }),
            tx.sharedMindMap.deleteMany({
                where: {
                    OR: [
                        { fromUserId: userId },
                        { toUserId: userId }
                    ]
                }
            }),

            // Delete shared conversations
            tx.sharedConversation.deleteMany({
                where: {
                    OR: [
                        { fromUserId: userId },
                        { toUserId: userId },
                        { userId: userId }
                    ]
                }
            }),

            // Delete web search citations related to user's messages
            tx.webSearchCitations.deleteMany({
                where: {
                    Message: {
                        Conversation: {
                            userId
                        }
                    }
                }
            }),

            // Delete messages
            tx.message.deleteMany({
                where: {
                    Conversation: {
                        userId
                    }
                }
            }),

            // Delete conversations
            tx.conversation.deleteMany({ where: { userId } }),

            // Delete mind maps
            tx.mindMap.deleteMany({ where: { userId } }),

            // Delete memories
            tx.memory.deleteMany({ where: { userId } }),

            // Delete feedback
            tx.feedback.deleteMany({ where: { userId } }),
        ]);

        // 3. Delete the user
        const deletedUser = await tx.user.delete({
            where: { id: userId }
        });

        // 4. Delete from memory_search_vector
        if (memories.length > 0) {
            const memoryPairs = memories.map(m => `('${m.memId}', '${m.chunkId}')`).join(',');
            await tx.$executeRawUnsafe(`
                DELETE FROM memory_search_vector 
                WHERE (memId, chunkId) IN (${memoryPairs})
            `);
        }

        // 5. Return the complete data for external cleanup
        return {
            deletedUser,
            memoriesForPinecone: memories.map(m => `${m.memId}_${m.chunkId}`)
        };
    }, {
        timeout: 50000,
        maxWait: 50000
    })
        .then(async ({ deletedUser, memoriesForPinecone }) => {
            // 6. Clean up Pinecone vectors outside the transaction
            if (memoriesForPinecone.length > 0) {
                try {
                    await index.deleteMany(memoriesForPinecone);
                } catch (e) {
                    console.error('Error deleting vectors from Pinecone:', e);
                    // Consider your error handling strategy here
                }
            }
            await handleSignOut();
            return deletedUser;
        });
};

export const getFullUser = async () => {
    try {
        const session = await auth();
        if (!session) {
            return {
                status: 401,
                body: {
                    error: "Unauthorized",
                },
            };
        }
        const { user: sessionUser } = session
        if (!sessionUser) {
            return {
                status: 401,
                body: {
                    error: "Unauthorized",
                },
            };
        }

        const user = await prisma.user.findUnique({
            where: {
                id: sessionUser.id
            },
            include: {
                ApiKeys: true,
                // ConnectedGDriveFiles: true,
                // ConnectedNotionPages: true,
                // Conversation: true,
                // Memory: true,
                // MindMap: true,
                SocialUser: true,
            }
        });

        return {
            status: 200,
            body: user,
        };
    } catch (error) {
        return {
            status: 500,
            body: {
                error: "Internal server error",
            },
        }
    }
}

export const addUserToWaitlist = async (email: string, type: 'alpha' | 'beta') => {
    try {

        console.log(email, type)
        let accountType: $Enums.AccountType = $Enums.AccountType.FREE;
        if (type === 'alpha') {
            accountType = $Enums.AccountType.ALPHA_FREE;
        } else if (type === 'beta') {
            accountType = $Enums.AccountType.BETA_FREE;
        }
        const waitlistUser = await prisma.waitlist.upsert({
            where: {
                email
            },
            update: {
                type: accountType
            },
            create: {
                email,
                type: accountType
            }
        })

        if (waitlistUser) {
            const content = type === 'alpha' ? alphaEmail : betaEmail;
            const message = {
                to: email,
                from: "info@mindkeeperai.com",
                subject: "Welcome to MindKeeper AI's alpha program",
                content: content,
                is_html: true
            }
            await redis.lpush("email:queue", JSON.stringify(message))
        }

        return {
            status: 200,
            body: {
                message: "User added to waitlist",
                waitlistUser
            }
        }
    } catch (error) {
        return {
            status: 500,
            body: {
                error: "Internal server error"
            }
        }
    }
}

export const checkUserIdInRedis = async (userId: string) => {
    try {
        const exists = await redis.exists(userId);
        console.log("REDIS EXISTS", exists);
        await unsetUserIdInRedis(userId);
        return exists === 1;
    } catch (error) {
        console.error("REDIS ERROR", error);
        return false;
    }
}

export const insertUserIdInRedis = async (userId: string) => {
    try {
        await redis.set(userId, '1');
    } catch (error) {
        console.error("REDIS ERROR", error);
    }
}

const unsetUserIdInRedis = async (userId: string) => {
    try {
        await redis.del(userId);
    } catch (error) {
        console.error("REDIS ERROR", error);
    }
}

export const updateUserNameByEmail = async (email: string, name: string) => {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { name }
        });
        return {
            status: 200,
            body: {
                message: "User name updated successfully",
                user
            }
        }
    } catch (error) {
        return {
            status: 500,
            body: {
                error: "Internal server error"
            }
        }
    }
}

export async function checkAccessToSharedConvo(conversationId: string, userId: string) {
    const access = await prisma.sharedConversation.findFirst({
        where: {
            conversationId,
            OR: [
                { toUserId: userId },
                { toUserId: 'public-access' }
            ]
        }
    });

    return !!access;
}

export async function isConversationPublic(conversationId: string) {
    const publicShare = await prisma.sharedConversation.findFirst({
        where: {
            conversationId,
            toUserId: 'public-access'
        }
    });
    return !!publicShare;
}

export async function getUserNotificationPreference(email: string) {
    try {
        const pref = await prisma.notificationPreferenceUnSubscribed.findMany({
            where: {
                emailId: email
            }
        });
        return pref;
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return [];
    }
}