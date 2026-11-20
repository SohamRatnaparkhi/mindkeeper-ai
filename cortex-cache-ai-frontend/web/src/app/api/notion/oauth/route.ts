import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Type for Notion OAuth response
interface NotionOAuthResponse {
    access_token: string;
    bot_id: string;
    workspace_id: string;
    workspace_name: string;
    workspace_icon: string | null;
    owner: {
        workspace: boolean;
        user: {
            id: string;
            name: string;
            avatar_url: string | null;
        };
    };
}

export const GET = async (req: NextRequest) => {
    try {
        // 1. Check environment variables
        const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
        const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
        const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;
        const frontendUrl = process.env.FRONTEND_SERVER_URL;

        if (!clientId || !clientSecret || !redirectUri || !frontendUrl) {
            console.error('Missing required environment variables');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // 2. Extract code from URL
        const url = new URL(req.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return NextResponse.json(
                { error: 'Authorization code is required' },
                { status: 400 }
            );
        }

        // 3. Authenticate user
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // 4. Exchange code for access token
        const response = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(
                    `${clientId}:${clientSecret}`
                ).toString('base64')}`,
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Notion API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to exchange authorization code' },
                { status: response.status }
            );
        }

        const data = (await response.json()) as NotionOAuthResponse;

        if (!data.access_token) {
            return NextResponse.json(
                { error: 'Invalid response from Notion' },
                { status: 500 }
            );
        }

        // 5. Store or update access token
        await prisma.accessTokens.upsert({
            where: {
                userId_platform: {
                    userId: session.user.id,
                    platform: 'notion'
                }
            },
            update: {
                token: data.access_token,
                botId: data.bot_id,
                workspaceId: data.workspace_id,
                workspaceName: data.workspace_name,
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                token: data.access_token,
                platform: 'notion',
                botId: data.bot_id,
                workspaceId: data.workspace_id,
                workspaceName: data.workspace_name,
            }
        });

        // 6. Redirect to frontend
        const redirectUrl = new URL("/add-page/notion", frontendUrl);
        return NextResponse.redirect(redirectUrl.toString());

    } catch (error) {
        console.error('OAuth handler error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}