"use server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { $Enums } from "@prisma/client";

export type RATE_LIMIT_CATEGORY = "HOURLY" | "DAILY";

export type RateLimitConfig = {
    WEB_RATE_LIMIT: number,
    MEMORY_RATE_LIMIT: number,
    EXPIRY_TIME: number
}

export type RATE_LIMIT_VALUES = {
    hourly: RateLimitConfig,
    daily: RateLimitConfig
}

interface RateLimitCheckConfig {
    satisfied: boolean;
    category: RATE_LIMIT_CATEGORY | "MASTER";
}
interface RateLimitCheckResult {
    web?: RateLimitCheckConfig | null;
    memory?: RateLimitCheckConfig | null;
}

export const areUserRateLimitsSatisfied = async (
    userId: string,
    webRequired: boolean,
    memoryRequired: boolean
): Promise<RateLimitCheckResult | null> => {
    try {
        // Input validation
        if (!userId?.trim()) {
            console.error("Invalid userId provided");
            return {
                web: {
                    category: "MASTER",
                    satisfied: true
                },
                memory: {
                    category: "MASTER",
                    satisfied: true
                }
            };
        }

        if (!webRequired && !memoryRequired) {
            console.error("At least one limit type must be required");
            return null;
        }

        // Memory is more common, check it first
        if (memoryRequired) {
            const masterMemoryLimit = await redis.get(`rl:inference:master:${userId}:memory`);
            if (masterMemoryLimit && Boolean(masterMemoryLimit) === false) {
                return {
                    memory: {
                        category: "MASTER",
                        satisfied: false
                    }
                };
            }
        }

        // Web check only if required (less common)
        if (webRequired) {
            const masterWebLimit = await redis.get(`rl:inference:master:${userId}:web`);
            if (masterWebLimit && Boolean(masterWebLimit) === false) {
                return {
                    web: {
                        category: "MASTER",
                        satisfied: false
                    }
                };
            }
        }

        // Check both hourly and daily limits sequentially since they both might be needed
        const hourlyLimits = await canUserInferBasedOnKind(userId, webRequired, memoryRequired, 'HOURLY');
        if (!hourlyLimits) {
            return null;
        }

        if (hourlyLimits.memoryLimitsCrossed) {
            return {
                memory: {
                    category: "HOURLY",
                    satisfied: false
                }
            };
        }

        if (hourlyLimits.webLimitsCrossed) {
            return {
                web: {
                    category: "HOURLY",
                    satisfied: false
                }
            };
        }

        const dailyLimits = await canUserInferBasedOnKind(userId, webRequired, memoryRequired, 'DAILY');
        if (!dailyLimits) {
            return null;
        }

        if (dailyLimits.memoryLimitsCrossed) {
            return {
                memory: {
                    category: "DAILY",
                    satisfied: false
                }
            };
        }

        if (dailyLimits.webLimitsCrossed) {
            return {
                web: {
                    category: "DAILY",
                    satisfied: false
                }
            };
        }

        return {
            web: {
                category: "MASTER",
                satisfied: true
            },
            memory: {
                category: "MASTER",
                satisfied: true
            }
        };
    } catch (error) {
        console.error("RATE LIMIT ERROR", error);
        return null;
    }
}

export const decrementRateLimit = async (userId: string, type: LimitType, isBoth = false) => {
    try {
        if (!userId?.trim()) {
            throw new Error("Invalid userId provided");
        }
        if (type !== 'web' && type !== 'memory') {
            throw new Error("Invalid rate limit type provided");
        }

        const pipeline = redis.pipeline();

        if (!isBoth) {
            const hourlyKey = `rl:inference:hourly:${userId}:${type}`;
            const dailyKey = `rl:inference:daily:${userId}:${type}`;

            pipeline.decr(hourlyKey);
            pipeline.decr(dailyKey);
        } else {
            const keys = [
                `rl:inference:hourly:${userId}:memory`,
                `rl:inference:daily:${userId}:memory`,
                `rl:inference:hourly:${userId}:web`,
                `rl:inference:daily:${userId}:web`
            ];

            keys.forEach(key => pipeline.decr(key));
        }

        await pipeline.exec();
    } catch (error) {
        console.error("Rate limit decrement error:", error);
        throw error; // Propagate error to caller
    }
}

type LimitType = 'web' | 'memory';

const TIME = {
    HOUR: 60 * 60,
    DAY: 24 * 60 * 60
} as const;

const DEFAULT_REQUEST_LIMITS = {
    FREE: {
        HOURLY: {
            WEB: 3,
            MEMORY: 15
        },
        DAILY: {
            WEB: 10,
            MEMORY: 50
        }
    },
    PREMIUM: {
        HOURLY: {
            WEB: 60,
            MEMORY: 360
        },
        DAILY: {
            WEB: 150,
            MEMORY: 1000
        }
    }
} as const;

const safeParseInt = (value: string | undefined, defaultValue: number): number => {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

const getRateLimitValuesForUser = async (userId: string): Promise<RATE_LIMIT_VALUES | null> => {
    try {
        if (!userId?.trim()) {
            console.error("Invalid userId provided");
            return null;
        }

        const accountType = await getUserType(userId);
        if (!accountType) {
            return null;
        }

        const type = accountType.includes("FREE") ? "FREE" : "PREMIUM";

        // Build config based on account type
        const config = {
            hourly: {
                WEB_RATE_LIMIT: safeParseInt(
                    process.env[`${type}_HOURLY_WEB_RATE_LIMIT_INFERENCE`],
                    DEFAULT_REQUEST_LIMITS[type].HOURLY.WEB
                ),
                MEMORY_RATE_LIMIT: safeParseInt(
                    process.env[`${type}_HOURLY_MEMORY_RATE_LIMIT_INFERENCE`],
                    DEFAULT_REQUEST_LIMITS[type].HOURLY.MEMORY
                ),
                EXPIRY_TIME: type === "FREE" ? 3 * TIME.HOUR : TIME.HOUR
            },
            daily: {
                WEB_RATE_LIMIT: safeParseInt(
                    process.env[`${type}_DAILY_WEB_RATE_LIMIT_INFERENCE`],
                    DEFAULT_REQUEST_LIMITS[type].DAILY.WEB
                ),
                MEMORY_RATE_LIMIT: safeParseInt(
                    process.env[`${type}_DAILY_MEMORY_RATE_LIMIT_INFERENCE`],
                    DEFAULT_REQUEST_LIMITS[type].DAILY.MEMORY
                ),
                EXPIRY_TIME: TIME.DAY
            }
        };

        // Validate that daily limits are higher than hourly
        if (config.daily.WEB_RATE_LIMIT < config.hourly.WEB_RATE_LIMIT ||
            config.daily.MEMORY_RATE_LIMIT < config.hourly.MEMORY_RATE_LIMIT) {
            console.error(`Invalid rate limit configuration for ${type} account: daily limits cannot be lower than hourly`);
            return null;
        }

        return config;
    } catch (error) {
        console.error("RATE LIMIT ERROR", error);
        return null;
    }
};

type LimitCheckResult = {
    memoryLimitsCrossed: boolean;
    webLimitsCrossed: boolean;
} | null;

const checkLimit = async (
    key: string,
    type: LimitType,
    userId: string,
    rateLimits: RATE_LIMIT_VALUES,
    kind: RATE_LIMIT_CATEGORY
): Promise<boolean> => {
    try {
        const rateLimit = await redis.get(key);

        // If no rate limit exists, initialize it
        if (rateLimit === null) {
            const success = await resetInferenceRateLimitsForUser(userId, rateLimits, kind, type);
            return success; // Return the result of reset operation instead of always true
        }

        const remainingLimit = parseInt(rateLimit as string, 10);
        if (isNaN(remainingLimit)) {
            console.error(`Invalid rate limit value for ${userId} ${type} ${kind}: ${rateLimit}`);
            return false;
        }

        return remainingLimit > 0;
    } catch (error) {
        console.error(`Error checking limit for ${userId} ${type} ${kind}:`, error);
        return false;
    }
}

const canUserInferBasedOnKind = async (
    userId: string,
    webRequired: boolean,
    memoryRequired: boolean,
    kind: RATE_LIMIT_CATEGORY
): Promise<LimitCheckResult> => {
    try {
        // Input validation
        if (!userId?.trim()) {
            console.error("Invalid userId provided");
            return null;
        }

        const type = kind.toLowerCase() as 'hourly' | 'daily';

        const rateLimits = await getRateLimitValuesForUser(userId);
        if (!rateLimits) {
            console.error(`Failed to get rate limits for user ${userId}`);
            return null;
        }

        const results = {
            memoryLimitsCrossed: false,
            webLimitsCrossed: false
        };

        // Check memory limits if required
        if (memoryRequired) {
            const memoryKey = `rl:inference:${type}:${userId}:memory`;
            const memoryPass = await checkLimit(memoryKey, 'memory', userId, rateLimits, kind);
            results.memoryLimitsCrossed = !memoryPass;
        }

        // Check web limits if required
        if (webRequired) {
            const webKey = `rl:inference:${type}:${userId}:web`;
            const webPass = await checkLimit(webKey, 'web', userId, rateLimits, kind);
            results.webLimitsCrossed = !webPass;
        }

        return results;
    } catch (error) {
        console.error("REDIS ERROR", error);
        // Log detailed error for monitoring
        console.error({
            error,
            userId,
            kind,
            webRequired,
            memoryRequired
        });
        return null; // Return null instead of empty object for error case
    }
};


const resetInferenceRateLimitsForUser = async (
    userId: string,
    rateLimits: RATE_LIMIT_VALUES,
    kind: RATE_LIMIT_CATEGORY,
    type: LimitType
): Promise<boolean> => {
    try {
        if (!userId?.trim()) {
            console.error("Invalid userId provided");
            return false;
        }

        const config = kind === 'DAILY' ? rateLimits.daily : rateLimits.hourly;

        const limit = type === 'web' ? config.WEB_RATE_LIMIT : config.MEMORY_RATE_LIMIT;

        const key = `rl:inference:${kind.toLowerCase()}:${userId}:${type}`;

        // Set the rate limit with expiry
        await redis.set(key, limit, {
            ex: config.EXPIRY_TIME
        });

        return true;
    } catch (error) {
        console.error("REDIS ERROR", {
            error,
            userId,
            kind,
            type
        });
        return false;
    }
};

const getUserType = async (userId: string) => {
    try {
        if (!userId?.trim()) {
            throw new Error("Invalid userId provided");
        }

        const cacheKey = `user:${userId}:type`;
        const cachedType = await redis.get(cacheKey);

        if (cachedType) {
            // Validate cached value
            if (Object.values($Enums.AccountType).includes(cachedType as $Enums.AccountType)) {
                return cachedType as $Enums.AccountType;
            }
            // Invalid cache value, remove it
            await redis.del(cacheKey);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { accountType: true }
        });

        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // Cache the result
        await redis.set(cacheKey, user.accountType, {
            ex: 1 * 60 * 60 // 1 hour
        });

        return user.accountType;
    } catch (error) {
        console.error("Error getting user type:", error);
        throw error;
    }
};

export const resetUserCacheAfterPlanChange = async (userId: string) => {
    try {
        if (!userId?.trim()) {
            throw new Error("Invalid userId provided");
        }

        // Define all known key patterns for a user
        const keyPatterns = [
            // User type cache
            `user:${userId}:type`,
            // Rate limit keys - hourly
            `rl:inference:hourly:${userId}:web`,
            `rl:inference:hourly:${userId}:memory`,
            // Rate limit keys - daily
            `rl:inference:daily:${userId}:web`,
            `rl:inference:daily:${userId}:memory`,
            // Master rate limit keys
            `rl:inference:master:${userId}:web`,
            `rl:inference:master:${userId}:memory`
        ];

        // Use unlink for non-blocking deletion
        await redis.unlink(...keyPatterns);

    } catch (error) {
        console.error("Error resetting user cache after plan change:", error);
        throw error;
    }
}