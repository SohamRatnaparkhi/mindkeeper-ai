"use client";

export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "MindKeeper AI",
        "applicationCategory": "PersonalInformationManager",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "An AI-powered second brain for personal knowledge management. Upload, organize, and retrieve information using natural language queries.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
        },
        "featureList": [
            "Natural Language Querying",
            "Cross-Platform Accessibility",
            "Comprehensive Content Upload",
            "Web Integration",
            "Enterprise Integration"
        ],
        "author": {
            "@type": "Organization",
            "name": "MindKeeper AI",
            "url": "https://www.mindkeeperai.com"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
