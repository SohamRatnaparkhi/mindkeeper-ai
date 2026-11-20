// app/api/gdrive/files/route.ts

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import { GaxiosError, GaxiosResponse } from 'gaxios'
import { drive_v3, google } from 'googleapis'
import { NextResponse } from 'next/server'

// Interface for Google Drive file response
interface DriveFile {
    id: string
    name: string
    mimeType: string
    webViewLink: string
}

interface DriveListResponse {
    files: DriveFile[]
    nextPageToken?: string
}

export type GDriveError = {
    type: 'AUTH_REQUIRED' | 'SERVER_ERROR' | 'NOT_FOUND'
    message: string
}


// Helper function to setup Google Drive client
const setupDriveClient = async (accessToken: string) => {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    return google.drive({
        version: 'v3',
        auth: oauth2Client,
        params: {
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        }
    });
}

export async function GET() {
    try {
        // 1. Authenticate user
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const connectedFiles = await prisma.connectedGDriveFiles.findMany({
            where: {
                userId: session.user!.id!
            },
        })

        // 5. Prepare the response with connection status
        const enrichedFiles = connectedFiles.map(file => {
            const connectionStatus = connectedFiles.find(cf => cf.fileId === file.fileId)
            return {
                fileId: file.fileId,
                name: file.name,
                mimeType: file.mimeType,
                url: file.url,
                state: connectionStatus?.state || 'NOT_CONNECTED'
            }
        })

        return NextResponse.json({
            success: true,
            files: enrichedFiles
        })

    } catch (error) {
        console.error('Error fetching Google Drive files:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        // 1. Authenticate user
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // 2. Get file details from request
        const { fileId, name, mimeType, url } = await request.json()
        if (!fileId) {
            return NextResponse.json(
                { error: 'File ID is required' },
                { status: 400 }
            )
        }

        await prisma.connectedGDriveFiles.upsert({
            where: {
                userId_fileId: {
                    userId: session.user!.id!,
                    fileId: fileId!
                }
            },
            update: {
                name: name || '',
                mimeType: mimeType || '',
                url: url || '',
                updatedAt: new Date()
            },
            create: {
                userId: session.user!.id!,
                fileId: fileId!,
                name: name || '',
                mimeType: mimeType || '',
                url: url || '',
                state: 'NOT_CONNECTED'
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error connecting Google Drive file:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { fileId, state } = await request.json()
        if (!fileId || !state) {
            return NextResponse.json(
                { error: 'File ID and state are required' },
                { status: 400 }
            )
        }
        const accessToken = await prisma.socialUser.findMany({
            where: {
                userId: session.user!.id!,
                provider: 'google'
            },
            select: {
                accessToken: true,
                refreshToken: true
            }
        })


        if (!accessToken || accessToken.length === 0 || !accessToken[0].accessToken) {
            return NextResponse.json(
                { error: 'Google Drive integration not found' },
                { status: 404 }
            )
        }

        console.log(accessToken)

        const token = accessToken[0].accessToken
        const refresh_token = accessToken[0].refreshToken

        // const refresh_token = accessToken[0].refreshToken
        // 4. Get file details from Google Drive
        const drive = await setupDriveClient(token)

        let fileResponse: GaxiosResponse<drive_v3.Schema$File> | null = null

        // try {
        console.log('in here 6')
        fileResponse = await drive.files.get({
            fileId,
            fields: 'id, name, mimeType, webViewLink',
            supportsAllDrives: true,
            supportsTeamDrives: true,  // Add this
            // includeTeamDriveItems: true,  // Add this
            // includeItemsFromAllDrives: true  // Add this
        })
        console.log(fileResponse)

        console.log('here 5')
        console.log(fileResponse)
        if (!fileResponse) {
            return NextResponse.json(
                {
                    error: {
                        type: 'NOT_FOUND',
                        message: 'File not found'
                    } as GDriveError
                },
                { status: 404 }
            )
        }
        const file = fileResponse.data

        if (!file) {
            return NextResponse.json(
                {
                    error: {
                        type: 'AUTH_REQUIRED',
                        message: 'Internal server error'
                    } as GDriveError
                },
                { status: 500 }
            )
        }

        const oldDriveRelatedMemoryIds = await prisma.memory.findMany({
            where: {
                userId: session.user!.id!,
                memType: 'drive'
            }
        })

        const oldDriveMemIdsOfThisFileId = oldDriveRelatedMemoryIds.filter((mem) => {
            const metadata = mem.metadata as { specific_desc: { file_id: string } }
            return metadata?.specific_desc?.file_id === fileId
        }).map((mem) => mem.memId)

        if (oldDriveMemIdsOfThisFileId.length > 0) {
            await prisma.memory.deleteMany({
                where: {
                    memId: {
                        in: oldDriveMemIdsOfThisFileId
                    }
                }
            })
        }

        const CONTENT_PROCESSOR_SERVER_URL = process.env.CONTENT_PROCESSOR_SERVER_URL
        console.log(`CONTENT_PROCESSOR_SERVER_URL: ${CONTENT_PROCESSOR_SERVER_URL}`)
        const addFileToMemory = await axios.post(
            `${CONTENT_PROCESSOR_SERVER_URL}/integration/process/gdrive`,
            {
                file_id: fileId,  // Note: matches the backend model
                access_token: token,
                refresh_token: refresh_token || '',
                metadata: {
                    user_id: session.user!.id!,
                    memId: "",
                    title: file.name,
                    description: "",
                    created_at: "",
                    last_updated: "",
                    tags: [""],
                    source: "",
                    language: "english",
                    type: "",
                    content_hash: "",
                    specific_desc: {  // Matches GDriveSpecificMd
                        chunk_id: "",
                        file_id: "",
                        page_number: 0,
                        sheet_name: ""
                    },
                    ai_summary: "",
                    ai_insights: "",
                    related_memories: [""]
                }
            }
        );

        if (addFileToMemory.status !== 200) {
            return NextResponse.json(
                {
                    error: {
                        type: 'SERVER_ERROR',
                        message: 'Internal server error'
                    } as GDriveError
                },
                { status: 500 }
            )
        }

        await prisma.connectedGDriveFiles.update({
            where: {
                userId_fileId: {
                    userId: session.user!.id!,
                    fileId
                }
            },
            data: {
                state
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error putting Google Drive files:', error)
        if (error instanceof GaxiosError) {
            return NextResponse.json(
                {
                    error: {
                        type: 'AUTH_REQUIRED',
                        message: 'Authentication required'
                    } as GDriveError
                },
                { status: 401 }
            )
        }
        return NextResponse.json(
            {
                error: {
                    type: 'SERVER_ERROR',
                    message: 'Internal server error' + error
                } as GDriveError
            },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { fileId } = await request.json()
        if (!fileId) {
            return NextResponse.json(
                { error: 'File ID is required' },
                { status: 400 }
            )
        }

        const oldDriveRelatedMemoryIds = await prisma.memory.findMany({
            where: {
                userId: session.user!.id!,
                memType: 'drive'
            }
        })

        const oldDriveMemIdsOfThisFileId = oldDriveRelatedMemoryIds.filter((mem) => {
            const metadata = mem.metadata as { specific_desc: { file_id: string } }
            return metadata?.specific_desc?.file_id === fileId
        }).map((mem) => mem.memId)

        if (oldDriveMemIdsOfThisFileId.length > 0) {
            await prisma.memory.deleteMany({
                where: {
                    memId: {
                        in: oldDriveMemIdsOfThisFileId
                    }
                }
            })
        }

        await prisma.connectedGDriveFiles.delete({
            where: {
                userId_fileId: {
                    userId: session.user!.id!,
                    fileId
                }
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error fetching Google Drive files:', error)
        return NextResponse.json(
            {
                error: {
                    type: 'SERVER_ERROR',
                    message: 'Internal server error'
                } as GDriveError
            },
            { status: 500 }
        )
    }
}