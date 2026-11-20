import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


type ShareRequestBody = {
    conversationId: string;
    isPublic: boolean;
    sharedEmails?: string[];
    permission: 'VIEW' | 'EDIT';
};

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: ShareRequestBody = await req.json();
        const { conversationId, isPublic, sharedEmails, permission } = body;

        // Check if conversation exists and belongs to current user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: session.user.id,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found or access denied' },
                { status: 404 }
            );
        }

        if (isPublic) {
            // For public sharing, create a special record in SharedConversation
            // We'll use a system user ID (you'll need to create this) or handle it differently
            const PUBLIC_ACCESS_USER_ID = 'public-access'; // You should create this user in your database

            await prisma.sharedConversation.upsert({
                where: {
                    fromUserId_toUserId_conversationId: {
                        fromUserId: session.user.id,
                        toUserId: PUBLIC_ACCESS_USER_ID,
                        conversationId
                    }
                },
                update: {
                    permission: 'VIEW'
                },
                create: {
                    id: `${conversationId}_public`,
                    fromUserId: session.user.id,
                    toUserId: PUBLIC_ACCESS_USER_ID,
                    conversationId,
                    permission: 'VIEW'
                }
            });

            return NextResponse.json({
                message: 'Conversation made public successfully'
            });
        }

        // Handle private sharing
        if (sharedEmails && sharedEmails.length > 0) {
            // Find users by their emails
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        in: sharedEmails
                    }
                },
                select: {
                    id: true,
                    email: true
                }
            });

            // Create shared conversation records for each user
            const sharePromises = users.map(user =>
                prisma.sharedConversation.upsert({
                    where: {
                        fromUserId_toUserId_conversationId: {
                            fromUserId: session.user!.id!,
                            toUserId: user.id,
                            conversationId
                        }
                    },
                    update: {
                        permission: 'VIEW'
                    },
                    create: {
                        id: `${conversationId}_${user.id}`,
                        fromUserId: session.user!.id!,
                        toUserId: user.id,
                        conversationId,
                        permission: 'VIEW'
                    }
                })
            );

            await Promise.all(sharePromises);
        }

        return NextResponse.json({
            message: 'Sharing updated successfully'
        });

    } catch (error) {
        console.error('Error sharing conversation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        const shares = await prisma.sharedConversation.findMany({
            where: {
                conversationId: conversationId,
                fromUserId: session.user.id,  // Get shares created by the current user
            },
            include: {
                User_SharedConversation_toUserIdToUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json({ shares });

    } catch (error) {
        console.error('Error fetching shares:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');
        const targetUserId = searchParams.get('userId');
        const removeAll = searchParams.get('removeAll');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        // Validate conversation ownership
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: session.user.id
            }
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found or unauthorized' },
                { status: 404 }
            );
        }

        if (removeAll === 'true') {
            // Remove all shares
            await prisma.sharedConversation.deleteMany({
                where: {
                    conversationId,
                    fromUserId: session.user.id
                }
            });
            return NextResponse.json({ message: 'All shares removed successfully' });
        }

        if (targetUserId) {
            // Remove specific share
            const user = await prisma.user.findFirst({
                where: { email: targetUserId }
            });
            console.log('Deleting share:', conversationId, user?.id);
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }
            const re = await prisma.sharedConversation.deleteMany({
                where: {
                    conversationId,
                    fromUserId: session.user.id,
                    toUserId: user?.id
                }
            });
            console.log(re)
            return NextResponse.json({ message: 'Share removed successfully' });
        }

        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error in DELETE /api/share/convo:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}