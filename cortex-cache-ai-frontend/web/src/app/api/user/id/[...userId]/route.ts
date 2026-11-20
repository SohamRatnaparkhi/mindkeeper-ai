import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const id = request.nextUrl.pathname.split('/').pop()
    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })
        if (!user) {
            return NextResponse.json({
                status: 404,
                body: {
                    error: 'User not found'
                }
            })
        }
        return NextResponse.json({
            status: 200,
            body: user
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