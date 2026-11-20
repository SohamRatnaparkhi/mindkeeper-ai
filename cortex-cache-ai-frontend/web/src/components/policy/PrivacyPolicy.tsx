"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useState } from 'react';

export default function PrivacyPolicy() {
    const [openSection, setOpenSection] = useState<string | null>(null)

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section)
    }

    const sections = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'information-we-collect', title: 'Information We Collect' },
        { id: 'how-we-use-your-information', title: 'How We Use Your Information' },
        { id: 'data-security', title: 'Data Security' },
        { id: 'user-rights-controls', title: 'User Rights & Controls' },
        { id: 'cookies-tracking', title: 'Cookies & Tracking' },
        { id: 'data-retention', title: 'Data Retention' },
        { id: 'third-party-services', title: 'Third-Party Services' },
        { id: 'childrens-privacy', title: "Children's Privacy" },
        { id: 'changes-to-policy', title: 'Changes to This Policy' },
        { id: 'contact-information', title: 'Contact Information' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                    <p className="text-gray-600 mb-6">Effective Date: December 1, 2024</p>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Table of Contents</h2>
                        <ScrollArea className="h-64 rounded-md border p-4">
                            {sections.map((section) => (
                                <Button
                                    key={section.id}
                                    variant="ghost"
                                    className="w-full text-black justify-start text-left mb-2"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <Link href={`#${section.id}`}>
                                        {section.title}
                                    </Link>
                                </Button>
                            ))}
                        </ScrollArea>
                    </div>

                    <div className="space-y-8">
                        <section id="introduction">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-700">
                                Welcome to MindKeeper AI! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using MindKeeper AI, you consent to the data practices described in this policy.
                            </p>
                            <p className="text-gray-700 mt-2">
                                This policy applies to all information collected through our application, website, and any related services, including our integrations with Notion and Google Drive.
                            </p>
                        </section>

                        <section id="information-we-collect">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">2.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Account Information:</strong> We collect personal information such as your email address, name, and other profile settings when you create an account.</li>
                                <li><strong>Content Data:</strong> We access and store contents of the files that you upload and the pages/files from your Notion workspace and Google Drive that you choose to integrate with MindKeeper AI. This ONLY includes documents, notes, and files that you select for synchronization.</li>
                                <li>
                                    <strong>Data Control & Sync Policy for Google Drive and Notion:</strong>
                                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                        <li>All data synchronization requires your explicit consent.</li>
                                        <li>
                                            You maintain complete control over:
                                            <ul className="list-disc pl-6 mt-2">
                                                <li>Which information to sync</li>
                                                <li>When to re-sync existing data</li>
                                                <li>When to delete synchronized data</li>
                                            </ul>
                                        </li>
                                        <li>
                                            Upon deletion:
                                            <ul className="list-disc pl-6 mt-2">
                                                <li>Data is permanently removed from our servers</li>
                                                <li>This process is irreversible</li>
                                            </ul>
                                        </li>
                                        <li>Section 9 explains how you can use these third party apps with MindKeeper</li>
                                        <li className="font-medium mt-2">
                                            Your privacy and data sovereignty remain our highest priority
                                        </li>
                                        <li>
                                            <strong>Opting Out of Google/Notion Integration:</strong>
                                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                                <li>
                                                    You may choose not to grant us access to your personal information when authenticating or connecting your Google or Notion account with MindKeeper AI.
                                                </li>
                                                <li>
                                                    However, by doing so, you won't be able to use these third-party integrations with MindKeeper.
                                                </li>
                                                <li>
                                                    You can still create an account and use other services provided by MindKeeper AI. You can always connect your Google or Notion account later. While they are not connected, you can still upload other files or sync data from other sources.
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Other Sources:</strong>
                                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                                <li>
                                                    You can share a YouTube video link, upload an image, video, or audio file from your device, or enter a web page link.
                                                </li>
                                                <li>
                                                    The information from these sources will be stored as long as you want them to be.
                                                </li>
                                                <li>
                                                    You have full control to update or delete this information from the application.
                                                </li>
                                                <li>
                                                    Once deleted, it cannot be restored (same as mentioned for integrations).
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>The data that you store in MindKeeper AI, which includes uploaded files from Google Drive, Notion or any other sources is not being used to develop, improve, or train generalized AI and/or ML models.</li>
                                <li><strong>Usage Preferences:</strong> We collect your settings and preferences within the application to enhance your experience.</li>
                            </ul>
                            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">2.2 Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Device Information:</strong> We may collect information about your device, including IP address, browser type, and device type.</li>
                                <li><strong>Usage Data:</strong> We track how you interact with our application to improve functionality.</li>
                                <li><strong>Performance Data:</strong> We monitor app performance and error logs to ensure a smooth user experience.</li>
                            </ul>
                        </section>

                        <section id="how-we-use-your-information">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-2">We use your information for the following purposes:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Service Provision:</strong> To operate and maintain the MindKeeper AI service, i.e., to allow you to promptly use your digital brain.</li>
                                <li><strong>Personalization:</strong> To customize your experience based on your preferences and usage patterns.</li>
                                <li><strong>Content Synchronization:</strong> To facilitate the integration with Notion and Google Drive, allowing you to add memories directly from these platforms.</li>
                                <li><strong>Communication:</strong> To respond to your inquiries, provide updates about our services, and send important notifications.</li>
                                <li><strong>Security:</strong> To protect our services and users from fraud, abuse, or unauthorized access.</li>
                                <li><strong>Analytics:</strong> To analyze usage patterns and improve our service offerings.</li>
                            </ul>
                        </section>

                        <section id="data-security">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                            <p className="text-gray-700 mb-2">We implement robust security measures to protect your data:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Encryption:</strong> All sensitive data is encrypted using AES-256 encryption for data at rest and TLS 1.3 for data in transit.</li>
                                <li><strong>Access Controls:</strong> We enforce role-based access control and multi-factor authentication to restrict access to authorized personnel only.</li>
                                <li><strong>Regular Audits:</strong> We conduct periodic security assessments and penetration testing to identify vulnerabilities.</li>
                                <li><strong>Monitoring:</strong> Our systems are monitored 24/7 for suspicious activities.</li>
                            </ul>
                        </section>

                        <section id="user-rights-controls">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Rights & Controls</h2>
                            <p className="text-gray-700 mb-2">Under GDPR and other privacy laws, you have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Access:</strong> You can view all the personal data we store about you.</li>
                                <li><strong>Rectification:</strong> You can correct any inaccurate or incomplete information we hold about you.</li>
                                <li><strong>Erasure:</strong> You can request the deletion of your personal data at any time.</li>
                                <li><strong>Restriction of Processing:</strong> You can request that we limit how we process your personal data under certain conditions.</li>
                            </ul>
                        </section>

                        <section id="cookies-tracking">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies & Tracking</h2>
                            <p className="text-gray-700 mb-2">We use cookies to enhance user experience:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Essential Cookies:</strong> These are required for basic functionality of our application.</li>
                                <li><strong>Functional Cookies:</strong> These remember your preferences and settings within the app.</li>
                                <li><strong>Analytics Cookies:</strong> These help us understand usage patterns for improving our services.</li>
                            </ul>
                            <p className="text-gray-700 mt-2">You can control cookie preferences through your browser settings.</p>
                        </section>

                        <section id="data-retention">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                            <p className="text-gray-700 mb-2">We retain your data for as long as you allow us to store thereby allowing us to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide our services effectively.</li>
                                <li>Comply with legal obligations.</li>
                                <li>Resolve disputes or enforce agreements if any.</li>
                            </ul>
                            <p className="text-gray-700 mt-2">After account deletion, we don't retain any data related to your account.</p>
                        </section>

                        <section id="third-party-services">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
                            <p className="text-gray-700 mb-2">We integrate with third-party services to enhance functionality:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Notion Integration:</strong> When you connect MindKeeper AI with Notion, we will read content from your Notion workspace that you choose to sync. This allows you to add memories directly from Notion into MindKeeper AI. You control which content is shared during this integration.</li>
                                <li><strong>Google Drive Integration:</strong> When you upload files from Google Drive into MindKeeper AI using the upload button, we will access the specific files you select. This enables seamless synchronization of documents into your memory space. We do not store or share these files without your explicit consent.</li>
                            </ul>
                            <p className="text-gray-700 mt-2">
                                Each third-party service has its own privacy policy governing their data handling practices, and we strictly comply with them. If they change their policy, we will update ours accordingly, and you will be informed.
                            </p>
                        </section>

                        <section id="childrens-privacy">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
                            <p className="text-gray-700">
                                Our service is not intended for children under 13 years old. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                            </p>
                        </section>

                        <section id="changes-to-policy">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                            <p className="text-gray-700 mb-2">
                                We may update this Privacy Policy periodically. If we make material changes, we will notify you through:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Email notifications,</li>
                                <li>In-app notifications,</li>
                                <li>Website announcements.</li>
                            </ul>
                            <p className="text-gray-700 mt-2">
                                Your continued use of our service after changes indicates acceptance of the updated policy.
                            </p>
                        </section>

                        <section id="contact-information">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                            <p className="text-gray-700">
                                For privacy-related inquiries or to exercise your rights regarding your personal data, please contact us at:
                            </p>
                            <address className="mt-2 text-gray-700 not-italic">
                                MINDKEEPER AI.<br />
                                Privacy Officer<br />
                                Email: <a href="mailto:info@mindkeeperai.com" className="text-blue-600 hover:underline">info@mindkeeperai.com</a>
                            </address>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}