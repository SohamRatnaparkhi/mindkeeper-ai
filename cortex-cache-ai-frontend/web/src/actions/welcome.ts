"use server"

import { redis } from "@/lib/redis"

export const addToWelcomeQueue = async (email: string) => {
    try {
        const message = {
            to: email,
            from: "info@mindkeeperai.com",
            subject: "Welcome to MindKeeper AI",
            content: "welcome",
            is_html: true
        }
        await redis.lpush("email:queue", JSON.stringify(message))
        console.log("Added to email queue")
    } catch (error) {
        console.error("Error adding to email queue", error)
    }
}