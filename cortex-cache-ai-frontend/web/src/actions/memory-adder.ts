"use server";
import { redis } from '@/lib/redis';
import { getAudioProcessingRequest, getFileProcessingRequest, getGitProcessingRequest, getImageProcessingRequest, getNoteProcessingRequest, getVideoProcessingRequest, getWebProcessingRequest, getYoutubeProcessingRequest } from '@/lib/RequestFormatter';
import { QueueRequestTypes, QueueTask } from '@/types/Metadata';
import jwt from 'jsonwebtoken';
import { ContentType, MemoryInputs } from '../types/AddMemoryModalTypes';



export const addMemoryBasedOnContentType = async (
    contentType: ContentType,
    memory: MemoryInputs,
    topic: string,
    userId: string,
    apiKey: string
): Promise<{
    data: string,
    status: number
}> => {
    let memoryBody = {};

    switch (contentType) {
        case 'media':
            const s3Key = memory.link;
            console.log("s3Key - " + s3Key)
            const extension = "." + s3Key.split('.').pop();
            if (extension === '.pdf') {
                memoryBody = getFileProcessingRequest(
                    topic,
                    s3Key,
                    userId,
                    memory.title,
                    memory.description,
                    memory.tags,
                    'english'
                )
            } else if (extension === '.mp3' || extension === '.wav' || extension === '.ogg') {
                memoryBody = getAudioProcessingRequest(
                    topic,
                    s3Key,
                    userId,
                    memory.title,
                    memory.description,
                    memory.tags,
                    'english'
                )
            } else if (extension === '.mp4' || extension === '.webm' || extension === '.ogg') {
                memoryBody = getVideoProcessingRequest(
                    topic,
                    s3Key,
                    userId,
                    memory.title,
                    memory.description,
                    memory.tags,
                    'english'
                )
            } else if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
                memoryBody = getImageProcessingRequest(
                    topic,
                    s3Key,
                    userId,
                    memory.title,
                    memory.description,
                    memory.tags,
                    'english'
                )
            }
            break;
        case 'youtube':
            memoryBody = getYoutubeProcessingRequest(
                topic,
                memory.link,
                userId,
                memory.title,
                memory.description,
                memory.tags,
                'english'
            )
            break;
        case 'article':
            memoryBody = getWebProcessingRequest(
                topic,
                memory.link,
                userId,
                memory.title,
                memory.description,
                memory.tags,
                'english'
            )
            break;
        case 'git':
            memoryBody = getGitProcessingRequest(
                topic,
                memory.link,
                userId,
                memory.title,
                memory.description,
                memory.tags,
                'english'
            )
            break;

        case 'note':
            memoryBody = getNoteProcessingRequest(
                topic,
                memory.link,
                userId,
                memory.title,
                memory.description,
                memory.tags,
                'english'
            )
            break;
        default:
    }

    const queueTask: QueueTask = {
        data: memoryBody,
        retries: 5,
        type: await getQueryReqTypeFromContentType(contentType, "." + memory.link.split('.').pop() || "")
    }

    const jwtToken = jwt.sign({ userId, apiKey }, process.env.JWT_SECRET as string);

    // Create message object combining task and API key
    const redisMessage = {
        task: queueTask,
        apiKey: jwtToken
    };

    try {
        // Push to Redis low priority queue
        await redis.lpush('low:priority:queue', JSON.stringify(redisMessage));
        console.log('Added to Redis queue:', queueTask);

        return {
            status: 200,
            data: 'Memory added to queue'
        }
    } catch (error) {
        console.error('Failed to add to Redis queue:', error);
        throw error;
    }
}

// Keep the helper function as is since it's still needed
export const getQueryReqTypeFromContentType = (contentType: ContentType, extension: string): QueueRequestTypes => {
    switch (contentType) {
        case 'media':
            if (extension === '.pdf') {
                return 'file';
            } else if (extension === '.mp3' || extension === '.wav' || extension === '.ogg') {
                return 'audio';
            } else if (extension === '.mp4' || extension === '.webm' || extension === '.ogg') {
                return 'video';
            } else if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
                return 'image';
            }
        case 'youtube':
            return 'youtube';
        case 'article':
            return 'web';
        case 'git':
            return 'git';
        case 'page':
            return 'web';
        case 'note':
            return 'note';
    }
}