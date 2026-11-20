import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const DELETE = async (req: NextRequest) => {
    try {
        const EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days
        const expiredConvos = await prisma.conversation.findMany({
            where: {
                updatedAt: {
                    lt: new Date(Date.now() - EXPIRY_TIME)
                },
                status: 'DELETED'
            },
            include: {
                Message: {
                    include: {
                        WebSearchCitations: true
                    }
                },
                SharedConversation: true
            }
        });

        if (expiredConvos.length === 0) {
            return NextResponse.json({
                status: 200,
                message: 'No expired conversations found'
            });
        }

        // Begin transaction to ensure all related records are deleted atomically
        const result = await prisma.$transaction(async (tx) => {
            for (const convo of expiredConvos) {
                // First, delete all WebSearchCitations for each message
                for (const message of convo.Message) {
                    if (message.WebSearchCitations.length > 0) {
                        await tx.webSearchCitations.deleteMany({
                            where: {
                                messageId: message.id
                            }
                        });
                    }
                }

                // Then delete all messages
                await tx.message.deleteMany({
                    where: {
                        conversationId: convo.id
                    }
                });

                // Delete all shared conversation records
                if (convo.SharedConversation.length > 0) {
                    await tx.sharedConversation.deleteMany({
                        where: {
                            conversationId: convo.id
                        }
                    });
                }

                // Finally delete the conversation itself
                await tx.conversation.delete({
                    where: {
                        id: convo.id
                    }
                });
            }

            return expiredConvos.length;
        }, {
            maxWait: 500000,
            timeout: 1000000
        });

        return NextResponse.json({
            status: 200,
            message: `Successfully deleted ${result} expired conversations and their related records`,
            data: {
                deletedCount: result
            }
        });
    } catch (error) {
        console.error('Error deleting conversations:', error);
        return NextResponse.json({
            status: 500,
            error: 'Failed to delete conversations: ' + error
        }, { status: 500 });
    }
};