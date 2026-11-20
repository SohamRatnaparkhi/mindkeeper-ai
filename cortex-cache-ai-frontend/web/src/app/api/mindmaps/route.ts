import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({
                status: 401,
                error: 'Unauthorized'
            })
        }
        const { user } = session

        if (!user) {
            return NextResponse.json({
                status: 401,
                error: 'Unauthorized'
            })
        }

        const mindmaps = await prisma.mindMap.findMany({
            where: {
                userId: user.id
            }
        })

        return NextResponse.json({
            status: 200,
            body: mindmaps as any[]
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            status: 500,
            error: error
        })
    }
}

export const POST = async (req: NextRequest) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({
                status: 401,
                error: 'Unauthorized'
            })
        }
        const { user } = session

        if (!user) {
            return NextResponse.json({
                status: 401,
                error: 'Unauthorized'
            })
        }

        const toUpsertMindmap = await req.json()


        const { id, title, description, memories }: {
            id: string
            title: string
            description: string
            memories: string[]
        } = toUpsertMindmap

        try {
            if (!id) {
                return NextResponse.json({
                    status: 400,
                    body: { error: 'Mindmap id is required' }
                })
            }

            if (!title) {
                return NextResponse.json({
                    status: 400,
                    body: { error: 'Mindmap title is required' }
                })
            }

            if (!memories) {
                return NextResponse.json({
                    status: 400,
                    body: { error: 'Mindmap memories are required' }
                })
            }

            const mindmap = await prisma.$transaction(async (prisma) => {
                const mindmap = await prisma.mindMap.upsert({
                    where: { id },
                    update: {
                        title,
                        description,
                        updatedAt: new Date(),
                    },
                    create: {
                        id,
                        title,
                        description,
                        userId: user.id!,
                        updatedAt: new Date(),
                    },
                });

                if (memories.length > 0) {
                    const count = await prisma.memory.updateMany({
                        where: {
                            memId: { in: memories },
                        },
                        data: {
                            mindMapId: mindmap.id,
                        },
                    });
                    console.log(`Updated ${count.count} memories`);
                } else {
                    console.log('No memories to update');
                }

                return mindmap;
            });

            console.log(mindmap);

            return NextResponse.json({
                status: 201,
                body: mindmap,
            });
        } catch (error) {
            console.error(error);
            return NextResponse.json({
                status: 500,
                body: { error: error },
            });
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            status: 500,
            body: { error: error }
        })
    }
}