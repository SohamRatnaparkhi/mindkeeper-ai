import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import StructuredData from "@/components/seo/StructuredData";
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MindKeeper AI - Your AI-Powered Second Brain",
  description: "MindKeeper AI is a sophisticated personal knowledge management tool that helps you capture, organize, and retrieve information using artificial intelligence. Upload content, query naturally, and access your knowledge across all devices.",
  keywords: "AI second brain, personal knowledge management, mind keeper, digital brain, knowledge base, AI assistant, content organization, memory enhancement",
  authors: [{ name: "MindKeeper AI, Soham Ratnaparkhi" }],
  creator: "MindKeeper AI, Soham Ratnaparkhi",
  publisher: "MindKeeper AI, Soham Ratnaparkhi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.mindkeeperai.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-us',
    },
  },
  openGraph: {
    title: 'MindKeeper AI - Your AI-Powered Second Brain',
    description: 'Transform how you capture and retrieve knowledge with MindKeeper AI. Natural language querying, comprehensive content support, and secure cloud storage.',
    url: 'https://www.mindkeeperai.com',
    siteName: 'MindKeeper AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MindKeeper AI Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindKeeper AI - Your AI-Powered Second Brain',
    description: 'Transform how you capture and retrieve knowledge with MindKeeper AI. Natural language querying, comprehensive content support, and secure cloud storage.',
    images: ['/og-image.png'],
    creator: '@sohamr_7113',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="MindKeeper AI" />
        <link rel="manifest" href="/site.webmanifest" />
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
          `}
        </Script>
      </head>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_G_ANALYTICS_ID}`}></Script>
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', ${process.env.NEXT_PUBLIC_G_ANALYTICS_ID});
        `}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <StructuredData />
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
