import { Redis } from '@upstash/redis';

const url = process.env.REDIS_URL || 'https://current-gibbon-24756.upstash.io';

export const redis = new Redis({
    url: url,
    token: process.env.UPSTASH_REDIS_TOKEN,
})