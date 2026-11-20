"use server";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Redis } from '@upstash/redis';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { isRedirectError } from "next/dist/client/components/redirect";
const redis = new Redis({
    url: 'https://current-gibbon-24756.upstash.io',
    token: process.env.UPSTASH_REDIS_TOKEN,
})

export const handleGoogleAuth = async () => {
    try {
        console.log("IN HANDLE GOOGLE AUTH");
        const result = await signIn("google", {
            redirectTo: "/",
            // callbackUrl: "/api/auth/callback/google"
        });
        console.log("Sign-in result:", result);
        return result;
    } catch (error) {
        console.error("GOOGLE AUTH ERROR", error);
        if (isRedirectError(error))
            throw error; // Re-throw the error for proper error handling
    }
};

export const handleGoogleDriveAuth = async () => {
    try {
        const result = await signIn(
            "google",
            {
                redirectTo: "/add-page/gdrive",
            },
            {
                scope: [
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'openid',
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/drive.install',
                    // 'https://www.googleapis.com/auth/drive.readonly',
                    // 'https://www.googleapis.com/auth/drive.metadata.readonly'
                ].join(' '),
                access_type: 'offline',
                response_type: 'code',
                prompt: 'consent'
            }
        );
        return result;
    } catch (error) {
        console.error("GOOGLE DRIVE AUTH ERROR", error);
        if (isRedirectError(error))
            throw error;
    }
};

export const handleGithubAuth = async () => {
    try {
        console.log("IN HANDLE GITHUB AUTH");
        const result = await signIn("github", {
            redirectTo: "/",
            // callbackUrl: "/api/auth/callback/github"
        });
        console.log("Sign-in result:", result);
        return result;
    } catch (error) {
        console.error("GITHUB AUTH ERROR", error);
        if (isRedirectError(error))
            throw error; // Re-throw the error for proper error handling
    }
}

export const handleMagicLinkAuth = async (email: string) => {
    console.log("IN HANDLE MAGIC LINK AUTH - EMAIL:", email);
    const checkUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!checkUser) {
        console.log("User not found");
        return {
            status: 404,
            body: {
                error: "User not found",
            },
        };
    }
    const result = await signIn("nodemailer", {
        // redirectTo: "/",
        callbackUrl: "/",
        email
    });
    console.log("Sign-in result:", result);
    return result;
}

export const handleCredentialsAuth = async (email: string, password: string) => {
    try {
        if (email === "testuser@email.com" && password === "testuser123") {
            console.log("Test user logged in");
            const result = await signIn("credentials", {
                redirectTo: "/",
                // callbackUrl: "/",
                email,
                password
            });
            return {
                status: 200,
                body: {
                    message: "Logged in successfully",
                },
            };
        }

        const checkUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!checkUser || !checkUser.password) {
            console.log("User not found");
            return {
                status: 404,
                body: {
                    error: "User not found",
                },
            };
        }
        const comparisonResult = await bcrypt.compare(password, checkUser.password);
        if (!comparisonResult) {
            console.log("Password does not match");
            return {
                status: 401,
                body: {
                    error: "Password does not match",
                },
            };
        }
        const result = await signIn("credentials", {
            redirectTo: "/",
            // callbackUrl: "/",
            email,
            password
        });
        console.log("Sign-in result:", result);
        return {
            status: 200,
            body: {
                message: "Logged in successfully",
                user: result,
            },
        };
    } catch (error) {
        if (isRedirectError(error)) {
            return {
                status: 200,
                body: {
                    message: "Logged in successfully",
                },
            };
        }
        return {
            status: 500,
            body: {
                error: "An error occurred",
            },
        }
    }
}

export const getOpt = async () => crypto.randomInt(100000, 999999).toString()

export const setOptToRedis = async (email: string, otp: string) => {
    try {
        await redis.setex(email, 300, otp)  // Store OTP in Redis for 5 minutes
        return {
            status: 200,
            body: {
                message: "OTP sent successfully"
            }
        }
    } catch (error) {
        console.error("SEND EMAIL ERROR", error);
        return {
            status: 500,
            body: {
                error: "An error occurred"
            }
        }
    }
}

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const storedOtp = await redis.get(email)

        if (storedOtp == otp) {
            return {
                status: 200,
                body: {
                    message: "OTP verified successfully"
                }
            }
        } else {
            return {
                status: 400,
                body: {
                    error: "Invalid OTP"
                }
            }
        }
    } catch (error) {
        console.error("VERIFY OTP ERROR", error);
        return {
            status: 500,
            body: {
                error: "An error occurred"
            }
        }
    }
}