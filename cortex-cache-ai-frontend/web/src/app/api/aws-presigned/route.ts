import { NextRequest, NextResponse } from 'next/server';

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


if (!process.env.AWS_S3_bucket_region || !process.env.AWS_S3_cortex_cache_manager_access_key || !process.env.AWS_S3_cortex_cache_manager_secret_key || !process.env.AWS_S3_bucket_name) {
    throw new Error("Environment variables are missing");
}


const client = new S3Client({
    region: process.env.AWS_S3_bucket_region,
    credentials: {
        accessKeyId: process.env.AWS_S3_cortex_cache_manager_access_key,
        secretAccessKey: process.env.AWS_S3_cortex_cache_manager_secret_key
    }
});

const getPresignedUrl = async (fileName: string, fileType: string) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_bucket_name,
        Key: fileName,
        ContentType: fileType
    });
    try {
        const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
        console.log("Presigned URL:", signedUrl);
        return signedUrl;
    } catch (error) {
        console.error("Error generating presigned URL", error);
    }
};


export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { fileName, fileType } = body;

        const url = await getPresignedUrl(fileName, fileType);

        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}