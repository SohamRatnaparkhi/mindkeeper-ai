import { checkAccessToSharedConvo } from "@/actions/userCrud";
import { ICitationType } from "@/components/conversation/Citations";
import { Query } from "@/components/conversation/ConversationBot";
import { auth } from "@/lib/auth";
import { formatCitation } from "@/lib/citation-formatter";
import { prisma } from "@/lib/prisma";
import { WebSearchCitations } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const url = new URL(req.url)
        const convoId = url.pathname.split('/').pop()

        const session = await auth()
        if (!session) {
            return NextResponse.json({
                status: 401,
                error: 'Unauthorized'
            });
        }

        if (!convoId) {
            return NextResponse.json({
                status: 400,
                error: 'Invalid conversation ID'
            });
        }

        // Fetch messages and conversation in parallel for better performance
        const [messages, conversation] = await Promise.all([
            prisma.message.findMany({
                where: {
                    conversationId: convoId
                },
                orderBy: {
                    createdAt: 'asc'  // Ensure messages are ordered by creation time
                },
                include: {
                    WebSearchCitations: true
                }
            }),
            prisma.conversation.findUnique({
                where: {
                    id: convoId
                }, include: {
                    User: true
                }
            })
        ]);

        if (!messages || !conversation) {
            return NextResponse.json({
                error: 'Conversation not found'
            }, {
                status: 404
            });
        }

        const checkSharedConvo = await checkAccessToSharedConvo(conversation.id, session.user!.id!);

        if ((conversation.userId !== session.user?.id)) {
            if (!checkSharedConvo) {
                return NextResponse.json({
                    error: 'Forbidden'
                }, {
                    status: 403
                });
            }
        }

        // Initialize data structures
        const allChunks = new Set<string>();
        const queryPairs: Record<string, {
            content: string,
            chunkIds: string[],
            createdAt: Date  // Add createdAt to track when queries were created
        }> = {};
        const citationMap: Record<string, string[]> = {};

        // First pass: Build queryPairs and collect chunks
        messages.forEach(message => {
            if (message.sender !== 'ai') {
                queryPairs[message.id] = {
                    content: message.content,
                    chunkIds: message.chunkIds || [],
                    createdAt: message.createdAt  // Store creation time
                };

                message.chunkIds?.forEach(chunkId => {
                    allChunks.add(chunkId);
                    if (!citationMap[chunkId]) {
                        citationMap[chunkId] = [];
                    }
                    citationMap[chunkId].push(message.id);
                });
            }
        });

        // Initialize queries structure with ordering information
        const queriesArray: Array<{
            id: string,
            createdAt: Date,
            data: Query
        }> = [];

        const answerToQueryIdsMap: Record<string, string> = {};

        // Second pass: Build queries structure
        messages.forEach(message => {
            if (message.questionId) {
                if (!queriesArray.some(q => q.id === message.questionId)) {
                    queriesArray.push({
                        id: message.questionId,
                        createdAt: queryPairs[message.questionId]?.createdAt || new Date(),
                        data: {
                            aiAnswers: [],
                            citations: [],
                            queryId: message.questionId,
                            userMessage: queryPairs[message.questionId]?.content || ''
                        }
                    });
                }

                if (message.sender === 'ai') {
                    const queryIndex = queriesArray.findIndex(q => q.id === message.questionId);
                    if (queryIndex !== -1) {
                        queriesArray[queryIndex].data.aiAnswers.push(message.content);
                        answerToQueryIdsMap[message.id] = message.questionId;
                    }
                }
            }
        });

        // Sort queries by creation time
        queriesArray.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        // Fetch all relevant memories
        const memories = await prisma.memory.findMany({
            where: {
                chunkId: {
                    in: Array.from(allChunks)
                }
            },
        });

        type MessageWithCitations = typeof messages[0]

        // Message IDs to message web citation map
        const messageToWebCitationsMap: Record<string, WebSearchCitations[]> = {};
        for (const message of messages as MessageWithCitations[]) {
            for (const webCitation of message.WebSearchCitations || []) {
                if (!messageToWebCitationsMap[answerToQueryIdsMap[message.id]]) {
                    messageToWebCitationsMap[answerToQueryIdsMap[message.id]] = [];
                }
                messageToWebCitationsMap[answerToQueryIdsMap[message.id]].push(webCitation);
            }
        }

        // Assign memories to appropriate queries
        let i = 0;
        memories.forEach(memory => {
            const messageIds = citationMap[memory.chunkId];
            messageIds.forEach(messageId => {
                const queryIndex = queriesArray.findIndex(q => q.id === messageId);
                if (queryIndex !== -1) {
                    const memoryCitation: MemoryCitation = {
                        id: memory.memId,
                        content: memory.memData,
                        type: 'memory',
                        chunkId: memory.chunkId,
                        metadata: memory.metadata,
                        memId: memory.memId,
                        memType: memory.memType,
                        memData: memory.memData,
                        title: memory.title
                    }
                    queriesArray[queryIndex].data.citations.push(formatCitation(memoryCitation, i) as unknown as ICitationType);
                }
                i++;
            });
        });

        // Assign web citations to appropriate queries
        for (const key in messageToWebCitationsMap) {
            const queryIndex = queriesArray.findIndex(q => q.id === key);
            if (queryIndex !== -1) {
                for (const citation of messageToWebCitationsMap[key]) {
                    const webCitation: WebCitation = {
                        id: citation.id,
                        content: citation.content,
                        type: 'web',
                        url: citation.url,
                        title: citation.title,
                        source: citation.source
                    }
                    queriesArray[queryIndex].data.citations.push(formatCitation(webCitation, i) as unknown as ICitationType);
                    i++;
                }
            }
        }

        // Convert sorted array back to record
        const orderedQueries: Record<string, Query> = {};
        queriesArray.forEach(query => {
            orderedQueries[query.id] = query.data;
        });

        return NextResponse.json({
            status: 200,
            data: {
                queries: orderedQueries,
                title: conversation?.title,
                summary: conversation?.summary,
                isShared: checkSharedConvo,
                isOwner: conversation.userId === session.user?.id
            }
        });
    } catch (error) {
        console.error('Error processing conversation:', error);
        return NextResponse.json({
            status: 500,
            error: 'Failed to process conversation'
        });
    }
}

export const PATCH = async (req: NextRequest) => {
    //  UPDATE state of convo
    try {

        const url = new URL(req.url)
        const convoId = url.pathname.split('/').pop()

        const body = await req.json();

        if (!convoId) {
            return NextResponse.json({
                status: 400,
                error: 'Invalid conversation ID'
            });
        }

        if (!body.status) {
            return NextResponse.json({
                status: 400,
                error: 'Status is required'
            });
        }

        const conversation = await prisma.conversation.update({
            where: {
                id: convoId
            },
            data: {
                status: body.status.toUpperCase()
            }
        });

        return NextResponse.json({
            status: 200,
            data: conversation
        });
    } catch (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json({
            status: 500,
            error: 'Failed to update conversation'
        });
    }
}

export const DELETE = async (req: NextRequest) => {
    try {
        const url = new URL(req.url);
        const convoId = url.pathname.split('/').pop();
        const session = await auth();

        if (!session) {
            return NextResponse.json({
                status: 401,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        if (!convoId) {
            return NextResponse.json({
                status: 400,
                error: 'Invalid conversation ID'
            }, { status: 400 });
        }

        // Check if conversation exists and belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: convoId,
                userId: session.user!.id!
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

        if (!conversation) {
            return NextResponse.json({
                status: 404,
                error: 'Conversation not found or unauthorized'
            }, { status: 404 });
        }

        // Delete conversation and related records in a transaction
        await prisma.$transaction(async (tx) => {
            // First, delete all WebSearchCitations for each message
            for (const message of conversation.Message) {
                if (message.WebSearchCitations.length > 0) {
                    await tx.webSearchCitations.deleteMany({
                        where: {
                            messageId: message.id
                        }
                    });
                }
            }

            // Delete all messages
            await tx.message.deleteMany({
                where: {
                    conversationId: convoId
                }
            });

            // Delete all shared conversation records
            if (conversation.SharedConversation.length > 0) {
                await tx.sharedConversation.deleteMany({
                    where: {
                        conversationId: convoId
                    }
                });
            }

            // Finally delete the conversation itself
            await tx.conversation.delete({
                where: {
                    id: convoId
                }
            });
        });

        return NextResponse.json({
            status: 200,
            message: 'Conversation successfully deleted'
        });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        return NextResponse.json({
            status: 500,
            error: 'Failed to delete conversation: ' + error
        }, { status: 500 });
    }
};