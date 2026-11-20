import { deleteUserAndRelatedData } from "@/actions/userCrud"
import type {
    Adapter,
    AdapterAccount,
    AdapterSession,
    AdapterUser,
} from "@auth/core/adapters"
import { Prisma, PrismaClient } from "@prisma/client"
import { formatUser } from "./auth"

export function CustomPrismaAdapter(
    prisma: PrismaClient | ReturnType<PrismaClient["$extends"]>
): Adapter {
    const p = prisma as PrismaClient
    return {
        createUser: ({ id, ...data }) => {
            return {
                id,
                ...data
            }
        },
        getUser: async (id) => {
            console.log('Getting account by user id')
            const user = await p.user.findUnique({
                where: { id },
                include: {
                    ApiKeys: true,
                    ConnectedGDriveFiles: true,
                    ConnectedNotionPages: true,
                }
            })
            if (!user) return null
            return formatUser(user, user.ApiKeys, user.ConnectedGDriveFiles, user.ConnectedNotionPages)
        },
        getUserByEmail: async (email) => {
            console.log('Getting account by email')
            const user = await p.user.findUnique({
                where: { email },
                include: {
                    ApiKeys: true,
                    ConnectedGDriveFiles: true,
                    ConnectedNotionPages: true,
                }
            })
            if (!user) return null
            const formatted = formatUser(user, user.ApiKeys, user.ConnectedGDriveFiles, user.ConnectedNotionPages)
            return formatted
        },
        async getUserByAccount(provider_providerAccountId) {
            console.log("getting user by account", provider_providerAccountId)
            const provider = provider_providerAccountId.provider
            const providerAccountId = provider_providerAccountId.providerAccountId
            const account = await p.socialUser.findUnique({
                where: {
                    provider_providerId: {
                        provider,
                        providerId: providerAccountId
                    }
                },
                select: {
                    User: true,
                }
            })
            if (!account) return null
            const user = await p.user.findUnique({
                where: { id: account?.User.id },
                // include: {
                //     ApiKeys: true,
                //     ConnectedGDriveFiles: true,
                //     ConnectedNotionPages: true,
                // }
            })
            if (!user) return null
            const res = formatUser(user, null, null, null)
            console.log('Getting user by acc', res)
            return res
        },
        updateUser: async ({ id, ...data }) => {
            console.log('Updating user', data)
            const user = await p.user.update({
                where: { id },
                data: {
                    // name: data.name,
                    pfp: data.image,
                }
            })
            return user as unknown as AdapterUser
        },
        deleteUser: async (id) => {
            const user = await deleteUserAndRelatedData(id)
            return user as unknown as AdapterUser
        },
        linkAccount: (data) => {
            console.log("Updating user with social account", data)
            return data as unknown as AdapterAccount
            // p.account.create({ data }) as unknown as AdapterAccount
        },
        unlinkAccount: (provider_providerAccountId) => {
            const provider = provider_providerAccountId.provider
            const providerAccountId = provider_providerAccountId.providerAccountId
            const account = p.socialUser.delete({
                where: {
                    provider_providerId: {
                        provider,
                        providerId: providerAccountId
                    }
                }
            })
            return account as unknown as AdapterAccount
        },
        async getSessionAndUser(sessionToken) {
            console.log("Getting session and user", sessionToken)
            const res = await fetch('/api/user?sessionToken=' + sessionToken)
            const userAndSession = await res.json()
            if (!userAndSession) return null
            const { status, body } = userAndSession
            if (status !== 200) return null
            const { user, ...session } = body
            return { user, session } as { user: AdapterUser; session: AdapterSession }
        },
        createSession: (data) => p.session.create(stripUndefined(data)),
        updateSession: (data) =>
            p.session.update({
                where: { sessionToken: data.sessionToken },
                ...stripUndefined(data),
            }),
        deleteSession: (sessionToken) =>
            p.session.delete({ where: { sessionToken } }),
        async createVerificationToken(data) {
            const verificationToken = await p.verificationToken.create(
                stripUndefined(data)
            )
            // @ts-expect-errors // MongoDB needs an ID, but we don't
            if (verificationToken.id) delete verificationToken.id
            return verificationToken
        },
        async useVerificationToken(identifier_token) {
            try {
                const verificationToken = await p.verificationToken.delete({
                    where: { identifier_token },
                })
                // @ts-expect-errors // MongoDB needs an ID, but we don't
                if (verificationToken.id) delete verificationToken.id
                return verificationToken
            } catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
                    return null
                throw error
            }
        },
        async getAccount(providerAccountId, provider) {
            console.log("Getting account by provider", providerAccountId, provider)
            const socialUser = p.socialUser.findFirst({
                where: { provider: provider, providerId: providerAccountId },
            })

            if (!socialUser) return null

            return socialUser as unknown as AdapterAccount
        },
    }
}

/** @see https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/null-and-undefined */
function stripUndefined<T>(obj: T) {
    const data = {} as T
    for (const key in obj) if (obj[key] !== undefined) data[key] = obj[key]
    return { data }
}

