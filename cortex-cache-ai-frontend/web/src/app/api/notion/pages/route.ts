import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface NotionPage {
    id: string;
    object: 'page';
    properties: {
        title?: {
            type: 'title';
            title: Array<{
                type: 'text';
                text: {
                    content: string;
                };
                plain_text: string;
            }>;
        };
        [key: string]: unknown;
    };
}

interface NotionSearchResponse {
    results: NotionPage[];
    next_cursor: string | undefined;
    has_more: boolean;
}

// Helper function to extract page title from Notion page
function extractPageTitle(page: NotionPage): string {
    const titleProperty = Object.values(page.properties).find(
        (prop: any) => prop?.type === 'title'
    ) as { title: Array<{ plain_text: string }> } | undefined;

    return titleProperty?.title?.[0]?.plain_text || 'Untitled';
}

export async function GET() {
    try {
        // 1. Authenticate user
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // 2. Get user's Notion access token and existing pages in one query
        const [accessToken, existingPages] = await Promise.all([
            prisma.accessTokens.findUnique({
                where: {
                    userId_platform: {
                        userId: session.user.id,
                        platform: 'notion'
                    }
                },
                select: {
                    token: true,
                    workspaceName: true,
                    workspaceId: true
                }
            }),
            prisma.connectedNotionPages.findMany({
                where: {
                    userId: session.user.id
                },
                select: {
                    pageId: true,
                    title: true,
                    state: true,
                    workspaceName: true,
                }
            })
        ]);

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Notion integration not found' },
                { status: 404 }
            );
        }

        // 3. Fetch all pages from Notion (with pagination)
        const pages: NotionPage[] = [];
        let hasMore = true;
        let cursor: string | undefined;

        while (hasMore) {
            const response = await fetch('https://api.notion.com/v1/search', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filter: { property: 'object', value: 'page' },
                    page_size: 100,
                    start_cursor: cursor,
                }),
            });

            if (!response.ok) {
                console.error('Notion API Error:', await response.text());
                return NextResponse.json(
                    { error: 'Failed to fetch Notion pages' },
                    { status: response.status }
                );
            }

            const data = (await response.json()) as NotionSearchResponse;
            pages.push(...data.results);
            hasMore = data.has_more;
            cursor = data.next_cursor;
        }

        // 4. Prepare data for bulk operations
        const currentPageIds = new Set(pages.map(page => page.id));
        const existingPageIds = new Set(existingPages.map(page => page.pageId));

        // Calculate pages to delete, update, and create

        const existingPageIdsArray = existingPages.map(page => page.pageId);
        const pageIdsToDelete = [...existingPageIdsArray].filter(id => !currentPageIds.has(id));

        // 5. Perform bulk operations in a single transaction
        await prisma.$transaction(async (tx) => {
            // First, delete pages that no longer exist
            if (pageIdsToDelete.length > 0) {
                await tx.connectedNotionPages.deleteMany({
                    where: {
                        userId: session!.user!.id,
                        pageId: { in: pageIdsToDelete }
                    }
                });
            }

            // Then, update or create pages in batches
            const batchSize = 100; // Adjust based on your needs
            const pagesToUpsert = pages.map(page => ({
                userId: session!.user!.id!,
                pageId: page.id,
                title: extractPageTitle(page),
                workspaceName: accessToken.workspaceName || "",
                state: existingPages.find(ep => ep.pageId === page.id)?.state || 'NOT_CONNECTED',
                updatedAt: new Date()
            }));

            // Process upserts in batches to avoid memory issues
            for (let i = 0; i < pagesToUpsert.length; i += batchSize) {
                const batch = pagesToUpsert.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(page =>
                        tx.connectedNotionPages.upsert({
                            where: {
                                userId_pageId: {
                                    userId: page!.userId!,
                                    pageId: page.pageId
                                }
                            },
                            update: {
                                title: page.title,
                                workspaceName: page.workspaceName,
                                updatedAt: page.updatedAt
                            },
                            create: page
                        })
                    )
                );
            }
        }, {
            timeout: 60000 // Adjust based on your needs
        });

        // 6. Prepare and return enriched page data
        const enrichedPages = pages.map(page => ({
            id: page.id,
            title: extractPageTitle(page),
            properties: page.properties,
            state: existingPages.find(ep => ep.pageId === page.id)?.state || 'NOT_CONNECTED',
            workspaceName: accessToken.workspaceName,
        }));

        return NextResponse.json({
            success: true,
            pages: enrichedPages
        });

    } catch (error) {
        console.error('Error syncing Notion pages:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT endpoint to update page connection state
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { pageId, state } = body;

        if (!pageId || !state) {
            return NextResponse.json(
                { error: 'Page ID and state are required' },
                { status: 400 }
            );
        }

        // Update the page state
        await prisma.connectedNotionPages.update({
            where: {
                userId_pageId: {
                    userId: session.user.id,
                    pageId: pageId
                }
            },
            data: {
                state: state,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Page state updated successfully'
        });

    } catch (error) {
        console.error('Error updating page state:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const POST = async (req: NextRequest) => {
    try {
        const CONTENT_PROCESSOR_URL = process.env.CONTENT_PROCESSOR_SERVER_URL;
        console.log(CONTENT_PROCESSOR_URL);
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = session.user;
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { pageId, title } = body;

        const accessToken = await prisma.accessTokens.findUnique({
            where: {
                userId_platform: {
                    userId: user.id!,
                    platform: 'notion'
                }
            },
            select: {
                token: true,
            }
        });

        if (!accessToken) {
            return NextResponse.json({ error: 'Notion integration not found' }, { status: 404 });
        }

        // TODO: CHECK FOR PREVIOUS NOTION PAGES WITH SAME ID TO DELETE THEM

        const response = await fetch(`${CONTENT_PROCESSOR_URL}/integration/process/notion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    "page_id": pageId,
                    "access_token": accessToken.token,
                    "metadata": {
                        "user_id": user.id,
                        "memId": "",
                        "title": title,
                        "description": "",
                        "created_at": "",
                        "last_updated": "",
                        "tags": [
                            ""
                        ],
                        "source": "",
                        "language": "english",
                        "type": "",
                        "content_hash": "",
                        "specific_desc": {
                            "chunk_id": "",
                            "page_id": ""
                        },
                        "ai_summary": "",
                        "ai_insights": "",
                        "related_memories": [
                            ""
                        ]
                    }
                })
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: 'An error occurred' }, { status: response.status });
        }
        return NextResponse.json({
            success: true,
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred', status: 500 });
    }
}