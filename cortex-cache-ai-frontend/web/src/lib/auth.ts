import { insertUserIdInRedis } from '@/actions/userCrud'
import { addToWelcomeQueue } from '@/actions/welcome'
import { $Enums, ApiKeys, ConnectedGDriveFiles, ConnectedNotionPages, User } from '@prisma/client'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import NodeMailer from 'next-auth/providers/nodemailer'
import { v4 as uuidv4 } from 'uuid'
import { CustomPrismaAdapter } from './CustomPrismaAdaptor'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    secret: process.env.SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/auth/sign-in',
        verifyRequest: '/auth/verify-request',
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: [
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'openid',
                        // 'https://www.googleapis.com/auth/drive.file',
                        // 'https://www.googleapis.com/auth/drive.readonly',
                        // 'https://www.googleapis.com/auth/drive.metadata.readonly'
                    ].join(' '),
                    access_type: 'offline',
                    response_type: 'code',
                    prompt: 'consent',
                }
            }
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        }),
        NodeMailer({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
            // server: {
            //     host: 'smtp.resend.com',
            //     secure: true,
            //     port: 465,
            //     auth: {
            //         user: 'resend',
            //         pass: process.env.RESEND_API_KEY,
            //     },

            // },
            // from: 'onboarding@resend.dev',
            maxAge: 24 * 60 * 60, // 24 hours
        }),
        Credentials({
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                return await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                    include: {
                        // ApiKeys: true,
                        // ConnectedGDriveFiles: true,
                        // ConnectedNotionPages: true,
                    }
                })
            }
        })
    ],
    adapter: CustomPrismaAdapter(prisma),
    callbacks: {
        async jwt({ token, user, }) {
            if (user) {
                return {
                    ...token,
                    user
                }
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user: token.user as User,
            };
        },
        async signIn({ user, account }) {
            // console.log("signIn callback", { user, account, profile });
            if (!user || !account) {
                console.log('No user or account');
                return false;
            }

            // eslint-disable-next-line prefer-const
            let { id, name, email, image } = user;
            if (!email) {
                return false;
            }
            if (!id || id == null) {
                id = uuidv4();
            }

            if (!name) {
                name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
            }
            const checkUser = await prisma.user.findUnique({
                where: {
                    email,
                },
            })
            let newUser = null;
            if (!checkUser) {
                const accType = await prisma.waitlist.findUnique({
                    where: {
                        email,
                    }
                })
                let accountType: $Enums.AccountType = $Enums.AccountType.FREE;
                if (accType) {
                    accountType = accType.type;
                }
                newUser = await prisma.user.create({
                    data: {
                        id,
                        name,
                        email,
                        pfp: image,
                        updatedAt: new Date(),
                        accountType,
                    }
                })
                if (!newUser) {
                    return false;
                }
                await generateAPIKey(newUser.id);
                await addToWelcomeQueue(email)
                await insertUserIdInRedis(newUser.id);
            } else {
                if (checkUser.pfp !== image) {
                    await prisma.user.update({
                        where: {
                            email,
                        },
                        data: {
                            pfp: image,
                        }
                    })
                }
            }

            // update social oauth tokens
            console.log(account)
            console.log('___')
            console.log(user)
            console.log('___')
            console.log(checkUser || newUser)

            const userId = checkUser?.id || newUser?.id;
            // check for provider and providerId
            const checkProvider = await prisma.socialUser.findUnique({
                where: {
                    provider_providerId: {
                        provider: account.provider,
                        providerId: account.providerAccountId,
                    },
                    userId: userId,
                }
            })

            console.log(checkProvider)
            if (!checkProvider) {
                const socialUser = await prisma.socialUser.create({
                    data: {
                        userId: userId!,
                        provider: account.provider,
                        providerId: account.providerAccountId,
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                        expiresAt: account.expires_in,
                        type: account.type,
                        id: uuidv4(),
                        token_id: account.id_token,
                        tokenType: account.token_type,
                        scope: account.scope,
                        updatedAt: new Date(),
                        sessionState: `${account.session_state}`,
                    }
                })
                console.log('socialUser', socialUser);
            } else {
                try {
                    console.log('Updating social user');
                    const socialUser = await prisma.socialUser.update({
                        data: {
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                            expiresAt: account.expires_in,
                            type: account.type,
                            token_id: account.id_token,
                            tokenType: `${account.tokenType}`,
                            scope: account.scope,
                            updatedAt: new Date(),
                            sessionState: `${account.session_state}`,
                        },
                        where: {
                            provider_providerId: {
                                provider: account.provider,
                                providerId: account.providerAccountId,
                            },
                            userId: userId!,
                        }
                    })
                    console.log('socialUser', socialUser);
                } catch (error) {
                    console.log('error', error);

                }
            }
            return true;
        },
    }
})


export const generateAPIKey = async (userId: string) => {
    const apiKey1 = uuidv4();
    const apiKey2 = uuidv4();
    const apiKey3 = uuidv4();

    const totalLength = 20;

    const combinedKey = apiKey1 + apiKey2 + apiKey3;

    let finalKey = '';

    for (let i = 0; i < totalLength; i++) {
        finalKey += combinedKey[randomNumGenerator(0, combinedKey.length)];
    }

    finalKey = "sk_" + finalKey;

    console.log('Generating key for user:', userId);

    const createdApiKey = await prisma.apiKeys.create({
        data: {
            apiKey: finalKey,
            userId,
            isPrimary: true,
        }
    })

    if (!createdApiKey) {
        return null;
    }
    return finalKey;
}

const randomNumGenerator = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
}

export const formatUser = (
    user: User,
    apiKeys: ApiKeys[] | null,
    connectedGDriveFiles: ConnectedGDriveFiles[] | null,
    connectedNotionPages: ConnectedNotionPages[] | null
): any => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        pfp: user.pfp,
        accountType: user.accountType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        apiKeys: apiKeys,
        connectedAccounts: {
            gdrive: connectedGDriveFiles,
            notion: connectedNotionPages
        }
    };
};