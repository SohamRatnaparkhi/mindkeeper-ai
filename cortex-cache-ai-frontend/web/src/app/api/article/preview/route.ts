// app/api/article/preview/route.ts
import { load } from 'cheerio';
import { NextResponse } from 'next/server';

interface MetaData {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    author?: string;
    url?: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Fetch the webpage
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ArticleBot/1.0;)'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch article' }, { status: 400 });
        }

        const html = await response.text();
        const $ = load(html);
        const metadata: MetaData = {};

        // Extract Open Graph and regular meta tags
        metadata.title =
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text();

        metadata.description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('meta[name="description"]').attr('content');

        metadata.image =
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');

        metadata.siteName =
            $('meta[property="og:site_name"]').attr('content') ||
            new URL(url).hostname;

        metadata.author =
            $('meta[name="author"]').attr('content') ||
            $('meta[property="article:author"]').attr('content');

        metadata.url = url;

        // Clean up the data
        Object.keys(metadata).forEach(key => {
            const typedKey = key as keyof MetaData;
            if (!metadata[typedKey]) {
                delete metadata[typedKey];
            }
        });

        return NextResponse.json(metadata);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch article metadata' },
            { status: 500 }
        );
    }
}