"use client";

import { checkIsAuthenticated, handleSignOut } from "@/actions/auth";
import Sidebar from "@/components/complete/Sidebar";
import DriveFiles from "@/components/google/DriveFiles";
import PrivacyPolicyModal from "@/components/policy/PrivacyPolicyModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { User } from "@prisma/client";
import { FileUp, Menu, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useDrivePicker from 'react-google-drive-picker';
type ActiveComponent = 'chatbot' | 'settings' | 'memories' | 'mindmaps' | 'conversations';

const allowedMimetypeMap: Record<string, string> = {
    'application/vnd.google-apps.document': 'Google doc',
    'application/vnd.google-apps.spreadsheet': 'Google sheet',
    'application/vnd.google-apps.presentation': 'Google slide',
    'application/pdf': 'pdf',
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/jpg': 'image',
    'video/mp4': 'video',
}

export default function GDriveIntegration() {
    const [openPicker, authResponse] = useDrivePicker();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [, setActiveComponent] = useState<ActiveComponent>('chatbot')
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter()
    const [, setUserName] = useState("Guest")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentUser, setCurrentUser] = useState<User>()

    useEffect(() => {
        if (authResponse != null || authResponse != undefined) {
            // setAuthToken(authResponse.access_token)
        }
    }, [authResponse])

    useEffect(() => {
        const checkAuthenticationStatus = async () => {
            const session = await checkIsAuthenticated()
            if (session.status === 401) {
                setIsAuthenticated(false)
                router.push('/auth/sign-in')
                return;
            } else {
                setUserName(session.body.user?.name || "")
                if (!session.body.user || !session.body.user.email) {
                    setIsAuthenticated(false)
                    router.push('/auth/sign-in')
                    return;
                }

                const user = session.body.user
                if (!user) {
                    setIsAuthenticated(false)
                    router.push('/auth/sign-in')
                    return;
                }
                setCurrentUser(user as unknown as User)
                setIsAuthenticated(true)
            }
        }
        checkAuthenticationStatus()
    }, [isAuthenticated])

    useEffect(() => {
        const checkIfMobile = () => {
            const isMobile = window.innerWidth < 768
            setIsMobile(isMobile)
            // setIsSidebarOpen(!isMobile)  // Open sidebar by default on desktop
        }
        checkIfMobile()
        window.addEventListener('resize', checkIfMobile)
        return () => window.removeEventListener('resize', checkIfMobile)
    }, [])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleLogout = async () => {
        // Implement your logout logic here
        // router.push('/auth/sign-in')
        console.log('Logging out...');
        await handleSignOut()
        router.push('/auth/sign-in')
    };

    const handleSidebarItemClick = (component: ActiveComponent) => {
        setActiveComponent(component)
        if (component === "chatbot") {
            router.push('/')
            return
        }
        router.push("/" + component)
        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }
    const [isProcessing, setIsProcessing] = useState(false)

    const handleOpenPicker = async () => {
        // console.log(`Inside handleOpenPicker` + authResponse?.access_token)
        openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || "",
            viewId: "DOCS",
            supportDrives: true,
            multiselect: true,
            customScopes: [
              'https://www.googleapis.com/auth/drive.file'
            ],
            appId: "896545192470",
            callbackFunction: handlePickerCallback,
        })
    }


    const handlePickerCallback = async (data: any) => {
        if (data.action === 'picked') {
            setIsProcessing(true)
            try {
                // Process each selected file
                const results = await Promise.all(
                    data.docs.map(async (doc: any) => {
                        if (!doc.id || !doc.name || !doc.mimeType || !doc.url) {
                            return null
                        }
                        if (!allowedMimetypeMap[doc.mimeType]) {
                            toast({
                                title: 'Error',
                                description: `File type not supported. We currently support Google Docs, Sheets, Slides, PDFs, Images(jpg, jpeg, png) and Videos(mp4).`,
                                className: 'bg-red-500 text-white',
                            })
                            return null
                        }
                        console.log("Doc", doc)
                        try {
                            await fetch('/api/gdrive/permission', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    fileId: doc.id
                                }),
                            });
                        } catch (permError) {
                            console.error('Permission error:', permError);
                        }

                        const response = await fetch('/api/gdrive/files', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                fileId: doc.id,
                                name: doc.name,
                                mimeType: allowedMimetypeMap[doc.mimeType] || 'Google file',
                                url: doc.url,
                            }),
                        })

                        return await response.json()
                    })
                )

                // Refresh the file list
                // You can emit an event or use state management to trigger this
                window.dispatchEvent(new CustomEvent('refreshDriveFiles'))

            } catch (error) {
                console.error('Error processing files:', error)
            } finally {
                setIsProcessing(false)
            }
        }
    }
    return (
        <div className="flex h-screen relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/chat/bg4-min.png')" }}
            />
            <div className="absolute inset-0 bg-gray-950 bg-opacity-50" />

            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                onItemClick={handleSidebarItemClick}
                isMobile={isMobile}
                onLogout={handleLogout}
            />

            <div className={`
                flex-1 flex flex-col relative z-10 overflow-hidden
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}
            `}>
                {isMobile && (
                    <button
                        className="absolute top-8 left-4 z-50 text-white"
                        onClick={toggleSidebar}
                    >
                        <Menu size={24} />
                    </button>
                )}
                <div className="flex-1 md:mx-auto w-full h-full overflow-hidden">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto no-scroll-bar">
                        <div className="max-w-6xl mx-auto">
                            <div className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text">
                                        Welcome to MindKeeper AI
                                    </h1>
                                    <p className="text-white/60 max-w-2xl">
                                        Connect your knowledge from various sources and let AI help you make better use of it.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        variant="outline"
                                        className="bg-white/5 border-white/10 hover:bg-white/10 space-x-2 group"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <Shield className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                                        <span>Privacy Policy</span>
                                    </Button>

                                    <Button
                                        className="bg-white/10 hover:bg-white/20 border border-white/10 space-x-2 relative overflow-hidden group"
                                        onClick={handleOpenPicker}
                                        disabled={isProcessing}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-400/10 group-hover:opacity-70 transition-opacity opacity-0" />
                                        <Image
                                            src="/google-drive-icon.png"
                                            alt="Google Drive"
                                            width={24}
                                            height={24}
                                            className="opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <span>
                                            {isProcessing ? 'Processing...' : 'Upload from Google Drive'}
                                        </span>
                                        {isProcessing && (
                                            <FileUp className="w-4 h-4 animate-bounce" />
                                        )}
                                    </Button>
                                </div>

                                <PrivacyPolicyModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                />

                                <div className="mt-8">
                                    <DriveFiles />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}