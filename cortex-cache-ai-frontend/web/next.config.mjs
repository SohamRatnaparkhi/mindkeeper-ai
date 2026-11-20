/** @type {import('next').NextConfig} */
const nextConfig = {
    logging: {
        fetches: {
            fullUrl: true,
        }
    },
    compiler: {
        removeConsole: true,
    },
    async redirects() {
        return [
            // Redirect auth routes to www domain from mindkeeperai.com
            {
                source: '/auth/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'mindkeeperai.com',
                    },
                ],
                destination: 'https://www.mindkeeperai.com/auth/:path*',
                permanent: true,
            },
            // Redirect auth routes to www domain from app subdomain
            {
                source: '/auth/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'app.mindkeeperai.com',
                    },
                ],
                destination: 'https://www.mindkeeperai.com/auth/:path*',
                permanent: true,
            },
            // Redirect auth routes to www domain from home subdomain
            {
                source: '/auth/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'home.mindkeeperai.com',
                    },
                ],
                destination: 'https://www.mindkeeperai.com/auth/:path*',
                permanent: true,
            },
            // Redirect /landing from any domain to home subdomain
            {
                source: '/landing',
                has: [
                    {
                        type: 'host',
                        value: 'mindkeeperai.com',
                    },
                ],
                destination: 'https://home.mindkeeperai.com',
                permanent: true,
            },
            {
                source: '/landing',
                has: [
                    {
                        type: 'host',
                        value: 'www.mindkeeperai.com',
                    },
                ],
                destination: 'https://home.mindkeeperai.com',
                permanent: true,
            },
            {
                source: '/landing',
                has: [
                    {
                        type: 'host',
                        value: 'app.mindkeeperai.com',
                    },
                ],
                destination: 'https://home.mindkeeperai.com',
                permanent: true,
            }
        ]
    },
    async rewrites() {
        return {
            beforeFiles: [
                // Serve landing page on home subdomain root
                {
                    source: '/',
                    has: [
                        {
                            type: 'host',
                            value: 'home.mindkeeperai.com',
                        },
                    ],
                    destination: '/landing',
                },
                // Handle static assets for home subdomain
                {
                    source: '/_next/:path*',
                    has: [
                        {
                            type: 'host',
                            value: 'home.mindkeeperai.com',
                        },
                    ],
                    destination: '/_next/:path*',
                },
                // Handle all other paths for home subdomain
                {
                    source: '/:path*',
                    has: [
                        {
                            type: 'host',
                            value: 'home.mindkeeperai.com',
                        },
                    ],
                    destination: '/:path*',
                },
                // Handle all paths for app subdomain
                {
                    source: '/:path*',
                    has: [
                        {
                            type: 'host',
                            value: 'app.mindkeeperai.com',
                        },
                    ],
                    destination: '/:path*',
                }
            ]
        }
    },
};

export default nextConfig;
