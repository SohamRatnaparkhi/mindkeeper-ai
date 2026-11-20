import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
        return NextResponse.json({
            status: 400,
            body: {
                error: 'Missing session token'
            }
        })
    }

    try {
        const userAndSession = await prisma.session.findUnique({
            where: { sessionToken },
            include: { user: true },
        })
        if (!userAndSession) return NextResponse.json({
            status: 404,
            body: {
                error: 'Session not found'
            }
        })
        const { user, ...session } = userAndSession
        // const returnUser = {
        //     email: user.email,
        //     name: user.name,
        //     image: user.pfp,
        //     emailVerified: null,
        //     id: user.id,
        //     apiKey: user.currentBalance,
        // }
        return NextResponse.json({
            status: 200,
            body: {
                user: user,
                session
            }
        })
    } catch (error) {
        return NextResponse.json({
            status: 500,
            body: {
                error: 'Internal server error'
            }
        })
    }
}