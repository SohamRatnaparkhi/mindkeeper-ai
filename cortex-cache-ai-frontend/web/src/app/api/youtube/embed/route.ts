import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: 'No preview or Invalid YouTube URL' }, { status: 400 });
        }

        return NextResponse.json({
            title: data.title,
            author_name: data.author_name,
            thumbnail_url: data.thumbnail_url,
            html: data.html // Contains the embed iframe code
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
    }
}