// app/api/github/repo/route.ts
import { NextResponse } from 'next/server';

interface GitHubRepo {
    name: string;
    full_name: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    description: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    topics: string[];
    html_url: string;
    updated_at: string;
    license?: {
        name: string;
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Extract owner and repo from GitHub URL
        const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/\s]+)/;
        const match = url.match(githubUrlPattern);

        if (!match) {
            return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
        }

        const [, owner, repo] = match;

        // Fetch repository data from GitHub API
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Repository Preview'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
            }
            throw new Error('Failed to fetch repository data');
        }

        const data: GitHubRepo = await response.json();

        return NextResponse.json({
            name: data.name,
            fullName: data.full_name,
            owner: {
                login: data.owner.login,
                avatarUrl: data.owner.avatar_url
            },
            description: data.description,
            stars: data.stargazers_count,
            forks: data.forks_count,
            language: data.language,
            topics: data.topics,
            url: data.html_url,
            updatedAt: data.updated_at,
            license: data.license?.name
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch repository details' }, { status: 500 });
    }
}