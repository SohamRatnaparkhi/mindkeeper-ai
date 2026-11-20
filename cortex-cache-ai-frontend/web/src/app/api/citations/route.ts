import { formatCitation } from "@/lib/citation-formatter";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const { messageId, title, conversationId } = await req.json();
        const INFERENCE_URL = process.env.INFERENCE_SERVER_URL;

        const response = await fetch(`${INFERENCE_URL}/convo/citations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messageId,
                title,
                conversationId
            })
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch citations' },
                { status: response.status }
            );
        }

        const { citations, memoryIds } = await response.json();
        const formattedCitations = citations?.map((citation: Citation, index: number) =>
            formatCitation(citation, index + 1)
        );


        return NextResponse.json({
            citations: formattedCitations,
            memoryIds
        });
    } catch (error) {
        console.error('Citation processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process citations' },
            { status: 500 }
        );
    }
}
