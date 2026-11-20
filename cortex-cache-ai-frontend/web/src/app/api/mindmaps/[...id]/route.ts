import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const url = new URL(req.url)
        const id = url.pathname.split('/').pop()

        if (!id) {
            return NextResponse.json({ error: 'Invalid mindmap ID' }, { status: 400 });
        }
        // Fetch the mindmap
        const mindmap = await prisma.mindMap.findUnique({
            where: {
                id: id
            },
            include: {
                Memory: true
            }
        });

        if (!mindmap) {
            return NextResponse.json({ error: 'mindmap not found' }, { status: 404 });
        }

        console.log(await prisma.mindMap.findMany())

        return NextResponse.json({ body: mindmap });
    }
    catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'An error occurred', status: 500 });
    }
}


export const DELETE = async (req: NextRequest) => {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();
        if (!id) {
            return NextResponse.json({ error: 'Invalid mindmap ID' }, { status: 400 });
        }

        console.log('Deleting mindmap with id:', id);

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // First check if mindmap exists
            const mindmap = await tx.mindMap.findUnique({
                where: {
                    id: id
                }
            });

            if (!mindmap) {
                return NextResponse.json({ error: 'mindmap not found' }, { status: 404 });
            }

            console.log('Deleting mindmap:', mindmap);

            // Delete the mindmap
            await tx.mindMap.delete({
                where: {
                    id: id
                }
            });

            return NextResponse.json({ body: mindmap });
        });

        return result;
    }
    catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}