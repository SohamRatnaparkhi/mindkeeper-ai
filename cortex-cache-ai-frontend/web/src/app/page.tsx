"use client"

import { checkIsAuthenticated, handleSignOut } from "@/actions/auth"
import { checkUserIdInRedis } from "@/actions/userCrud"
import Sidebar from "@/components/complete/Sidebar"
import Conversation from "@/components/conversation/ConversationBot"
import { OnboardingModal } from "@/components/onboarding/OnboardingModal"
import { User } from "next-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'

type ActiveComponent = 'chatbot' | 'settings' | 'memories' | 'mindmaps' | 'conversations';

export default function ChatPage() {

    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [, setActiveComponent] = useState<ActiveComponent>('chatbot')
    const [isMobile, setIsMobile] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const router = useRouter()
    const [userName, setUserName] = useState("")
    const [showHelpModal, setShowHelpModal] = useState(false)
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
                // const { status, body } = await getUserByEmail(session.body.user.email)
                // if (status !== 200) {
                //     setIsAuthenticated(false)
                //     router.push('/auth/sign-in')
                //     return;
                // }
                const user = session.body.user
                if (!user || !user.id) {
                    setIsAuthenticated(false)
                    router.push('/auth/sign-in')
                    return;
                }
                setCurrentUser(user)
                setIsAuthenticated(true)

                if (await checkUserIdInRedis(user.id)) {
                    setShowHelpModal(true)
                }
            }
        }
        checkAuthenticationStatus()
    }, [isAuthenticated])

    useEffect(() => {
        const checkIfMobile = () => {
            const isMobile = window.innerWidth < 768
            setIsMobile(isMobile)
            // setIsSidebarOpen(!isMobile)  
        }
        checkIfMobile()
        window.addEventListener('resize', checkIfMobile)
        return () => window.removeEventListener('resize', checkIfMobile)
    }, [])

    // useEffect(() => {
    //     if (currentUser != undefined) {
    //         if (localStorage.getItem('onboarding') !== 'true') {
    //             setShowHelpModal(true)
    //             localStorage.setItem('onboarding', 'true')
    //         }
    //     }
    // }, [currentUser])

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
            window.location.reload()
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
            <div className="absolute inset-0 bg-slate-950 bg-opacity-50" />

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
                {/* {isMobile && (
                    <button
                        className="absolute top-8 left-4 z-50 text-white"
                        onClick={toggleSidebar}
                    >
                        <Menu size={24} />
                    </button>
                )} */}
                <div className="flex-1 md:mx-auto md:max-w-6xl w-full h-full overflow-hidden p-4">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto no-scroll-bar">
                        {/* {renderComponent()} */}
                        <Conversation userName={userName} user={currentUser!} conversationId={uuidv4()} />
                    </div>
                    {showHelpModal && <OnboardingModal onClose={() => setShowHelpModal(false)} />}
                </div>
            </div>
        </div>
    )
}
