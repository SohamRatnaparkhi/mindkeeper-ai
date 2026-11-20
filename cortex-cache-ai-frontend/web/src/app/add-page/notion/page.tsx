"use client";

import { checkIsAuthenticated, handleSignOut } from "@/actions/auth";
import Sidebar from "@/components/complete/Sidebar";
import Pages from "@/components/notion/Pages";
import PrivacyPolicyModal from "@/components/policy/PrivacyPolicyModal";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
type ActiveComponent = 'chatbot' | 'settings' | 'memories' | 'mindmaps' | 'conversations';

export default function NotionIntegration() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [, setActiveComponent] = useState<ActiveComponent>('chatbot')
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter()
    const [, setUserName] = useState("Guest")
    const [notionUrl, setNotionUrl] = useState("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentUser, setCurrentUser] = useState<User>()
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
        setNotionUrl(process.env.NEXT_PUBLIC_NOTION_AUTH_URL || "")
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
                <div className="flex-1 md:mx-auto  w-full h-full overflow-hidden">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto no-scroll-bar">
                        <div className="max-w-6xl mx-auto">
                            {/* <Header interactionTitle={'Add Memory'} handleButtonClicked={() => { }} central="MindKeeper AI" /> */}
                            <div className="p-4">
                                <h1 className="text-2xl font-bold mb-4">Welcome to MindKeeper AI</h1>
                                <p className="mb-4">Please review our privacy policy before using our service.</p>
                                <Button onClick={() => setIsModalOpen(true)}>
                                    View Privacy Policy
                                </Button>
                                <PrivacyPolicyModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                />
                                <Button>
                                    {
                                        notionUrl && <Link href={notionUrl}>
                                            Open Notion
                                        </Link>
                                    }
                                </Button>
                            </div>

                            <div className="">
                                <Pages />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}