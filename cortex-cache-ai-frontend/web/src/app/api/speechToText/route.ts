import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const base64Audio = body.audio;

        if (!base64Audio) {
            return NextResponse.json(
                { error: "No audio data provided" },
                { status: 400 }
            );
        }

        // Convert base64 to Buffer
        const audioBuffer = Buffer.from(base64Audio, "base64");

        // Create a File object that OpenAI's API can handle
        const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav', lastModified: Date.now() });

        // Use OpenAI Whisper API for transcription
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "en",
        });

        return NextResponse.json({ text: transcription.text });
    } catch (error) {
        console.error("Error processing audio:", error);
        return NextResponse.json(
            { error: "Failed to process audio" },
            { status: 500 }
        );
    }
}