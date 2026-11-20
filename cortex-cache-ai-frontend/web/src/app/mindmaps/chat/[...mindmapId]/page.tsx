"use client"

import { checkIsAuthenticated, handleSignOut } from "@/actions/auth"
import Sidebar from "@/components/complete/Sidebar"
import Conversation from "@/components/conversation/ConversationBot"
import { Memory, MindMap } from "@prisma/client"
import { Menu } from "lucide-react"
import { User } from "next-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { v4 as uuid } from 'uuid'

type ActiveComponent = 'chatbot' | 'settings' | 'memories' | 'mindmaps' | 'conversations';

export default function ChatPage({
    params
}: {
    params: {
        mindmapId: string[]
    }
}) {

    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebar2Open, setIsSidebar2Open] = useState(true)
    const [, setActiveComponent] = useState<ActiveComponent>('chatbot')
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter()
    const [userName, setUserName] = useState("Guest")
    const [mindmapId, setMindmapId] = useState<string>("")
    const [mindmap, setMindmap] = useState<MindMap | undefined>()
    const [linkedMemoryIds, setLinkedMemoryIds] = useState<string[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentUser, setCurrentUser] = useState<User>()

    useEffect(() => {
        setMindmapId(params.mindmapId[0])
    }, [mindmapId])

    console.log("Memory ID: ", mindmapId)

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
                setCurrentUser(user)
                setIsAuthenticated(true)
            }
        }
        checkAuthenticationStatus()
    }, [isAuthenticated])

    useEffect(() => {
        const fetchMindmap = async () => {
            if (mindmapId === "") {
                return
            }
            const res = await fetch(`/api/mindmaps/${mindmapId}`)
            const data = await res.json()
            setMindmap(data.body)
            const map = data.body

            if (map && map.Memory) {
                setLinkedMemoryIds(map.Memory.map((m: Memory) => m.memId))
            }

            // console.log("Mindmap: ", map)
        }
        fetchMindmap()
    }, [mindmapId])

    useEffect(() => {
        const checkIfMobile = () => {
            const isMobile = window.innerWidth < 768
            setIsMobile(isMobile)
            setIsSidebar2Open(!isMobile)
        }
        checkIfMobile()
        window.addEventListener('resize', checkIfMobile)
        return () => window.removeEventListener('resize', checkIfMobile)
    }, [])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const toggleSidebar2 = () => {
        setIsSidebar2Open(!isSidebar2Open)
    }

    const handleLogout = async () => {
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

    if (mindmapId === "") {
        return (
            <p>loading</p>
        )
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
                <div className="flex-1 md:mx-auto md:max-w-6xl w-full h-full overflow-hidden p-4">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto no-scroll-bar">
                        {/* {renderComponent()} */}
                        <Conversation userName={userName} user={currentUser!} conversationId={uuid()} linkedMemoryIds={linkedMemoryIds} mindmap={mindmap} mindmapId={mindmapId} />
                    </div>
                </div>
            </div>

            {/* <RightBar memId={memoryId} /> */}
            {/* <Sidebar2
                isOpen={isSidebar2Open}
                toggleSidebar={toggleSidebar2}
                isMobile={isMobile}
                memId={memoryId}
            /> */}
        </div>
    )
}
