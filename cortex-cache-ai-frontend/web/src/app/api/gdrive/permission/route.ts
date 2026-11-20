import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { fileId } = await request.json();
        if (!fileId) {
            return NextResponse.json(
                { error: 'File ID is required' },
                { status: 400 }
            );
        }

        const accessToken = await prisma.socialUser.findFirst({
            where: {
                userId: session.user.id,
                provider: 'google'
            },
            select: {
                accessToken: true,
                refreshToken: true
            }
        });

        if (!accessToken?.accessToken) {
            return NextResponse.json(
                { error: 'Google Drive access token not found' },
                { status: 401 }
            );
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: accessToken.accessToken,
            refresh_token: accessToken.refreshToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Create a permission for the file
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'user',
                emailAddress: session.user.email  // Make sure your session includes email
            },
            supportsAllDrives: true
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error creating permission:', error);
        return NextResponse.json(
            { error: 'Failed to create permission' },
            { status: 500 }
        );
    }
}