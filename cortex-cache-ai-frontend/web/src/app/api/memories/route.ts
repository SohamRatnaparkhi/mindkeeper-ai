/* eslint-disable @typescript-eslint/no-explicit-any */
import { sign } from "@/hooks/jwt";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const url = process.env.INFERENCE_SERVER_URL + '/memory/all';
        const session = await auth();

        console.log("Session")

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const credentials = {
            userId: user!.id!,
            email: user!.email!,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiKey: (user as any).apiKey || "123" as string,
        }

        const jwt = sign(credentials);


        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            }
        });


        if (!response.ok) {
            return NextResponse.json({ error: 'An error occurred' }, { status: response.status });
        }

        const { body } = await response.json();


        const memories: any[] = []

        Object.values(body)?.forEach((memory: any) => {
            memories.push(beautifyMemory(memory));
        })

        // sort newest to oldest
        memories.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json({
            status: 200,
            body: memories as any[]
        });

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            status: 500,
            body: {
                error: 'Internal server error'
            }
        });
    }
};

export const POST = async (req: Request) => {
    try {
        const url = process.env.INFERENCE_SERVER_URL + '/memory/search';
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const credentials = {
            userId: user!.id!,
            email: user!.email!,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiKey: (user as any).apiKey || "" as string,
        }

        const jwt = sign(credentials);
        // eslint-disable-next-line no-unused-vars
        const { query } = await req.json();
        console.log(query)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                query, metadata: {
                    user_id: user.id
                },
                number: 10,
                is_pro: false,
                query_id: "123",
            }),
        });
        const { body } = await response.json();

        const memories: any[] = []


        Object.values(body)?.forEach((memory: any) => {
            memories.push(beautifyMemory(memory));
        })

        return NextResponse.json({
            status: 200,
            body: memories as any[]
        });
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            status: 500,
            body: {
                error: 'Internal server error'
            }
        });
    }
}

const beautifyMemory = (memory: any) => {
    const newMemory = {
        id: memory.mem_id,
        type: memory.mem_type,
        createdAt: memory.created_at,
        updatedAt: memory.updated_at,
        title: memory.metadata?.title,
        description: memory.metadata?.description,
        content: "",
    }
    const { chunks } = memory;
    let content = "";
    chunks.forEach((chunk: any) => {
        content += chunk.contents;
    });
    newMemory.content = content;
    return newMemory;
}