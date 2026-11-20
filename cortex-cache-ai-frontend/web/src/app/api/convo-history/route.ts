import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const session = await auth();

        console.log("Session" + session);
        // console.log(session);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user!.id!
        console.log("userId", userId)

        const conversations = await prisma.conversation.findMany({
            where: {
                userId: userId
            }, include: {
                Message: true
            }
        })
        // console.log(conversations[0].Message)
        return NextResponse.json({
            status: 200,
            data: conversations.sort((a, b) => {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            })
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'An error occurred', status: 500 });
    }
}