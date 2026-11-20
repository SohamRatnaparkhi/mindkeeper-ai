import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({
                status: 403,
                body: {
                    error: 'Unauthorized'
                }
            })
        }

        const { user } = session;

        if (!user) {
            return NextResponse.json({
                status: 403,
                body: {
                    error: 'Unauthorized'
                }
            })
        }

        const userId = user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                userId: userId
            },
        });

        const url = new URL(req.url);
        const memId = url.pathname.split('/').pop();

        if (!memId) {
            return NextResponse.json({
                status: 400,
                body: {
                    error: 'Bad Request'
                }
            })
        }

        const memoryIdConversations = conversations.filter((conversation) => {
            return conversation.memoryIds.includes(memId);
        });

        if (!memoryIdConversations) {
            return NextResponse.json({
                status: 404,
                body: {
                    error: 'Not Found'
                }
            })
        }

        return NextResponse.json({
            status: 200,
            body: memoryIdConversations.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
        })

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            status: 500,
            body: {
                error: 'An error occurred'
            }
        })
    }
}