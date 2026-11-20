"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { checkIsAuthenticated, handleSignOut } from "@/actions/auth"
import { getFullUser } from "@/actions/userCrud"
import Sidebar from "@/components/complete/Sidebar"
import Settings, { FullUser } from "@/components/settings/UserSettings"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type ActiveComponent = 'chatbot' | 'settings' | 'memories' | 'mindmaps' | 'conversations';

const SettingsPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [, setActiveComponent] = useState<ActiveComponent>('chatbot')
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter()
    const [, setUserName] = useState("Guest")

    const [user, setUser] = useState<FullUser>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                setIsAuthenticated(true)
            }
        }
        checkAuthenticationStatus()
    }, [isAuthenticated])


    useEffect(() => {
        const getUser = async () => {
            const response = await getFullUser()
            const { body } = response

            if (!body) {
                console.error('Error fetching user data:', response)
                return
            }

            if (response.status === 200) {
                setUser(body as FullUser)
            } else {
                console.error('Error fetching user data:', response)
            }
        }
        getUser()
    }, [])


    useEffect(() => {
        const checkIfMobile = () => {
            const isMobile = window.innerWidth < 768
            setIsMobile(isMobile)
        }
        checkIfMobile()
        window.addEventListener('resize', checkIfMobile)
        return () => window.removeEventListener('resize', checkIfMobile)
    }, [])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
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
                {/* {isMobile && (
                    <button
                        className="absolute top-8 left-4 z-50 text-white"
                        onClick={toggleSidebar}
                    >
                        <Menu size={24} />
                    </button>
                )} */}
                <div className="flex-1 md:mx-auto  w-full h-full overflow-hidden">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto no-scroll-bar">
                        {
                            user ? <Settings user={user} /> : <div>

                                <PersonalInfoSkeleton />
                            </div>

                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage


const PersonalInfoSkeleton = () => {
    return (
        <div className="flex items-center justify-center w-full min-h-screen bg-slate-950">
            <Card className="w-full max-w-3xl border-none shadow-none bg-slate-900/40 animate-pulse">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-700" />
                        <div className="h-6 w-48 bg-slate-700 rounded" />
                    </div>
                    <div className="h-4 w-72 bg-slate-700 rounded mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div className="w-24 h-24 rounded-full bg-slate-700" />
                        </div>
                        <Separator className="bg-slate-700" />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-slate-700 rounded" />
                                <div className="h-10 w-full max-w-md bg-slate-800 rounded border border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-28 bg-slate-700 rounded" />
                                <div className="h-10 w-full max-w-md bg-slate-800 rounded border border-slate-700" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-32 h-10 bg-slate-700 rounded" />
                </CardFooter>
            </Card>
        </div>
    );
};