import { auth } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { ProcessingStatus } from '@/types/status';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Get all keys for this user
        const session = await auth();

        console.log("Session")
        // console.log(session);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const keys = await redis.keys(`doc_status:${user!.id}:*`);

        console.log('Keys:');
        console.log(keys);

        if (keys.length === 0) {
            return NextResponse.json([]);
        }

        // Get all statuses in a single pipeline
        const pipeline = redis.pipeline();
        keys.forEach(key => pipeline.get(key));

        const statuses: ProcessingStatus[] = await pipeline.exec();

        console.log('Statuses:');
        console.log(statuses);

        return NextResponse.json(statuses);
    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json(
            { error: "Failed to fetch status" },
            { status: 500 }
        );
    }
}