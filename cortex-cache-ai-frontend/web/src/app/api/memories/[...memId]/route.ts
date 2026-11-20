import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const url = new URL(req.url)
        const memId = url.pathname.split('/').pop()

        if (!memId) {
            return NextResponse.json({ error: 'Invalid memory ID' }, { status: 400 });
        }
        // Fetch the memory
        const memory = await prisma.memory.findMany({
            where: {
                memId: memId
            }
        });

        if (!memory) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
        }

        return NextResponse.json({ body: memory[0] });
    }
    catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

export const DELETE = async (req: NextRequest) => {
    try {
        const url = new URL(req.url);
        const memId = url.pathname.split('/').pop();
        if (!memId) {
            return NextResponse.json({ error: 'Invalid memory ID' }, { status: 400 });
        }

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // First check if memory exists and belongs to user
            const memories = await tx.memory.findMany({
                where: {
                    memId: memId,
                    userId: session!.user!.id
                },
                include: {
                    MindMap: true // Include MindMap relation
                }
            });

            if (memories.length === 0) {
                throw new Error('Memory not found or unauthorized');
            }

            // Get all unique mindMapIds that this memory is part of
            const mindMapIds = Array.from(new Set(memories
                .map(mem => mem.mindMapId)
                .filter((id): id is string => id !== null)));

            // If there are associated mindmaps, update them
            if (mindMapIds.length > 0) {
                // Verify user has access to these mindmaps
                const accessibleMindMaps = await tx.mindMap.findMany({
                    where: {
                        id: {
                            in: mindMapIds
                        },
                        OR: [
                            { userId: session!.user!.id }, // User owns the mindmap
                            {
                                SharedMindMap: {
                                    some: {
                                        toUserId: session!.user!.id,
                                        permission: 'EDIT'
                                    }
                                }
                            } // User has edit permission through sharing
                        ]
                    }
                });

                // Check if user has permission for all mindmaps
                if (accessibleMindMaps.length !== mindMapIds.length) {
                    throw new Error('Unauthorized: Cannot delete memory from some mindmaps');
                }
            }

            // Delete the memory chunks
            await tx.memory.deleteMany({
                where: {
                    memId: memId,
                    userId: session!.user!.id
                }
            });

            // Delete memory vector search records if they exist
            await tx.memory_search_vector.deleteMany({
                where: {
                    memid: memId
                }
            });

            try {
                if (memories[0].memType === 'drive') {
                    const metadata = memories[0].metadata;
                    const fileId = metadata && typeof metadata === 'object'
                        && 'specific_desc' in metadata
                        && typeof metadata.specific_desc === 'object'
                        && metadata.specific_desc
                        && 'file_id' in metadata.specific_desc
                        ? metadata.specific_desc.file_id
                        : null;
                    if (fileId) {
                        console.log(
                            'Deleting connected GDrive file entry for file ID:',
                            fileId
                        )
                        await tx.connectedGDriveFiles.delete({
                            where: {
                                userId_fileId: {
                                    userId: session!.user!.id!,
                                    fileId: fileId as unknown as string
                                }
                            }
                        });
                    }
                }
                if (memories[0].memType === 'notion') {
                    const metadata = memories[0].metadata;
                    const notionPageId = metadata && typeof metadata === 'object'
                        && 'specific_desc' in metadata
                        && typeof metadata.specific_desc === 'object'
                        && metadata.specific_desc
                        && 'page_id' in metadata.specific_desc
                        ? metadata.specific_desc.page_id
                        : null;
                    if (notionPageId) {
                        await tx.connectedNotionPages.delete({
                            where: {
                                userId_pageId: {
                                    userId: session!.user!.id!,
                                    pageId: notionPageId as unknown as string
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error deleting connected Notion page:', error);
            }
            finally {
                return {
                    deletedMemories: memories,
                    mindMapIds
                };
            }

        }, {
            maxWait: 10000,
            timeout: 15000
        });

        // After successful DB transaction, delete from Pinecone
        const index = pc.index(process.env.PINECONE_INDEX!);
        await index.deleteMany(
            result.deletedMemories.map(memory => `${memory.memId}_${memory.chunkId}`)
        );

        // Return success response with additional info about mindmap updates
        return NextResponse.json({
            body: {
                memory: result.deletedMemories[0],
                updatedMindMaps: result.mindMapIds
            }
        });

    } catch (error) {
        console.error('Delete memory error:', error);
        if (error instanceof Error) {
            if (error.message === 'Memory not found or unauthorized') {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            if (error.message.includes('Unauthorized')) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
        }
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}