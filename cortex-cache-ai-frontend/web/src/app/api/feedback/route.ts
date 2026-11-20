import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { type, content, mediaUrl } = body

        // Validate required fields
        if (!content || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate feedback type
        if (!['BUG', 'FEEDBACK'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid feedback type' },
                { status: 400 }
            )
        }

        // Create feedback
        const feedback = await prisma.feedback.create({
            data: {
                type,
                content,
                mediaUrl: mediaUrl || null,
                userId: session!.user!.id!,
                id: uuid()
            }
        })

        // todo: email by publishing to redis event

        return NextResponse.json(
            { message: 'Feedback submitted successfully', feedback },
            { status: 201 }
        )
    } catch (error) {
        console.error('Feedback submission error:', error)
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        )
    }
}