import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { conversationId } = await req.json();
    const INFERENCE_URL = process.env.INFERENCE_SERVER_URL;
    console.log(`${INFERENCE_URL}/convo/summary/${conversationId}`);
    const res = await fetch(`${INFERENCE_URL}/convo/summary/${conversationId}`, {
        method: 'GET',
    });
    const response = await res.json();
    // if (!response.ok) {
    //     return NextResponse.json({ status: response.status, body: { error: 'An error occurred' } });
    // }
    const { summary } = response;
    console.log('Summary:', summary);
    return NextResponse.json({ status: 200, body: { summary } });
}