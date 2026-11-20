"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const checkIsAuthenticated = async () => {
    const session = await auth();
    if (!session) {
        return {
            status: 401,
            body: {
                error: "Unauthorized",
            },
        };
    }
    return {
        status: 200,
        body: {
            user: session.user,
            session: session,
        }
    };
}

export const handleSignOut = async () => {
    await signOut();
    return {
        status: 200,
        body: {
            message: "Sign out successful",
        },
    };
}

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        return {
            status: 404,
            body: {
                error: "User not found",
            },
        };
    }
    return {
        status: 200,
        body: user,
    };
}