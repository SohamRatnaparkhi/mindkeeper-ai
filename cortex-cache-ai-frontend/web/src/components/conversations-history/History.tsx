'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { Archive, History as HistoryIcon, MessageCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomScrollArea from "../ui/CustomScrollArea"
import { HorizontalBorderCard } from "../ui/horizontal-border-card"
import { Input } from "../ui/input"
import { ShareConversationModal } from "./ShareConversationModal"

type Conversation = {
    id: string
    title: string
    updatedAt: string
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
    summary?: string
    Message: any[]
}

export default function History() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED' | 'DELETED'>('ACTIVE')
    const [searchQuery, setSearchQuery] = useState('')
    const { toast } = useToast()

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    useEffect(() => {
        try {
            const getConvoHistory = async () => {
                const { data, status } = await axios.get('/api/convo-history')
                console.log(data)
                if (status === 200) {
                    setConversations(data.data)
                }
                setIsLoading(false)
            }
            getConvoHistory()
        } catch (error) {
            console.log(error)
        }
    }, [])
    // console.log(conversations)
    const handleConversationClick = (id: string) => {
        router.push(`/chat/${id}`)
    }

    const handleStatusChange = async (id: string, newStatus: 'ARCHIVED' | 'DELETED' | 'ACTIVE') => {
        // setConversations(prevConversations =>
        //     prevConversations.map(conv =>
        //         conv.id === id ? { ...conv, status: newStatus } : conv
        //     )
        // )
        const { status } = await axios.patch(`/api/convo-history/${id}`, { status: newStatus })
        if (status === 200) {
            setConversations(prevConversations =>
                prevConversations.map(conv =>
                    conv.id === id ? { ...conv, status: newStatus } : conv
                )
            )
        } else {
            toast({
                title: "Failed to update status",
                description: "An error occurred while updating the status of the conversation.",
                variant: "destructive",
                className: "bg-red-500"
            })
        }
    }
    const filteredConversations = conversations?.filter(conv =>
        conv.status.toUpperCase() === activeTab.toUpperCase() &&
        (conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.summary?.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div>
            <div className="p-4 pb-0 mb-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center text-slate-200">
                        <HistoryIcon className="mr-3 ml-5 text-transparent sm:text-slate-400" size={28} />
                        Chat History
                    </h1>
                    <Button
                        // onClick={() => setIsModalOpen(true)}
                        className="bg-slate-700/50 border border-slate-600 text-slate-200 
                             hover:bg-slate-600/50 hover:border-slate-500
                             transition-all duration-200 flex items-center gap-2"
                    >
                        <MessageCircle size={18} className="text-slate-300" />
                        <span className="hidden sm:inline">Chat</span>
                    </Button>
                </div>
            </div>
            <div className="min-h-screen mx-auto max-w-6xl text-white">
                <div className="flex flex-col h-screen">
                    {/* Fixed Header */}
                    <div className="p-4 space-y-4">
                        <Input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full "
                        />
                        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "ACTIVE" | "ARCHIVED" | "DELETED")}>
                            <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                                <TabsTrigger defaultChecked={true} value="ACTIVE">Active</TabsTrigger>
                                <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
                                <TabsTrigger value="DELETED">Deleted</TabsTrigger>
                            </TabsList>
                            {
                                activeTab === 'DELETED' && (
                                    <div className="bg-red-500 bg-opacity-10 my-4 p-4 rounded-lg">
                                        <p className="text-sm text-red-500">
                                            Note: Deleted conversations will be permanently removed after 7 days.
                                        </p>
                                    </div>
                                )
                            }
                        </Tabs>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-hidden">
                        <CustomScrollArea className="h-full">
                            <div className="p-8">
                                <Tabs value={activeTab}>
                                    <TabsContent value="ACTIVE">
                                        <ConversationCards
                                            conversations={filteredConversations}
                                            isLoading={isLoading}
                                            onConversationClick={handleConversationClick}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </TabsContent>
                                    <TabsContent value="ARCHIVED">
                                        <ConversationCards
                                            conversations={filteredConversations}
                                            isLoading={isLoading}
                                            onConversationClick={handleConversationClick}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </TabsContent>
                                    <TabsContent value="DELETED">
                                        <ConversationCards
                                            conversations={filteredConversations}
                                            isLoading={isLoading}
                                            onConversationClick={handleConversationClick}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CustomScrollArea>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ConversationCards({ conversations, isLoading, onConversationClick, onStatusChange }: {
    conversations: Conversation[]
    isLoading: boolean
    onConversationClick: (id: string) => void
    onStatusChange: (id: string, newStatus: 'ARCHIVED' | 'DELETED' | 'ACTIVE') => void
}) {
    if (isLoading) {
        return (
            <div className="space-y-4 mt-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="w-full border-none bg-white bg-opacity-5">
                        <CardHeader className="pb-2">
                            <div className="h-5 bg-gray-200 bg-opacity-10 rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 bg-opacity-10 rounded w-1/2 animate-pulse mt-1"></div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-4 bg-gray-200 bg-opacity-10 rounded w-full animate-pulse mb-2"></div>
                            <div className="h-8 bg-gray-200 bg-opacity-10 rounded w-1/4 animate-pulse ml-auto"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const filterMarkdown = (content: string): string => {
        // Remove code blocks (both fenced and indented)
        let filtered = content.replace(/```[\s\S]*?```/g, '')
            .replace(/(`.*?`)/g, '')

        // Remove headers
        filtered = filtered.replace(/^#{1,6}\s+/gm, '')

        // Remove emphasis and bold
        filtered = filtered.replace(/[*_]{1,2}(.*?)[*_]{1,2}/g, '$1')

        // Remove horizontal rules
        filtered = filtered.replace(/^[-*=]{3,}\s*$/gm, '')

        // Remove blockquotes
        filtered = filtered.replace(/^>\s+/gm, '')

        // Remove ordered and unordered list markers
        filtered = filtered.replace(/^[\s]*[-+*]\s+/gm, '')
        filtered = filtered.replace(/^[\s]*\d+\.\s+/gm, '')

        // Remove link syntax while preserving text
        filtered = filtered.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

        // Remove extra whitespace
        filtered = filtered.replace(/\s+/g, ' ').trim()

        return filtered
    }

    return (
        <div className="space-y-4 mt-4">
            {/* Note saying content remains for 7 days only */}

            {conversations?.map((conversation) => (
                <HorizontalBorderCard key={conversation.id} className="w-full cursor-pointer hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-sm">
                    <CardHeader className="pb-2" onClick={() => onConversationClick(conversation.id)}>
                        <CardTitle className="text-lg">{conversation.title.length > 150 ? conversation.title.substring(0, 120) + "..." : conversation.title}</CardTitle>
                        <CardDescription className="text-xs">Last updated: {new Date(conversation.updatedAt).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {(
                            <p onClick={() => onConversationClick(conversation.id)} className="text-sm text-slate-400 mb-2 line-clamp-2">{conversation.Message.length > 1 ? filterMarkdown(conversation.Message[1].content) : filterMarkdown(conversation.Message[0].content)}</p>
                        )}
                        <div className="flex justify-end space-x-2">
                            {/* Only show share button for active conversations */}
                            {conversation.status === 'ACTIVE' && (
                                <ShareConversationModal conversationId={conversation.id} />
                            )}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-blue-800" variant="outline" size="icon" onClick={(e) => e.stopPropagation()}>
                                        <Archive className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will {
                                                conversation.status === 'ARCHIVED' ? 'unarchive' : 'archive'
                                            } the conversation. You can access it later from the {conversation.status === 'ARCHIVED' ? 'Active' : 'Archived'} tab.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel </AlertDialogCancel>
                                        <AlertDialogAction className={`${conversation.status === 'ARCHIVED' ? 'bg-green-600' : 'bg-blue-500'}`} onClick={() => onStatusChange(conversation.id, conversation.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED')}>{conversation.status === 'ARCHIVED' ? 'Un-archive' : 'Archive'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-red-800" variant="outline" size="icon" onClick={(e) => e.stopPropagation()}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        {conversation.status != 'DELETED' ? (<AlertDialogDescription>
                                            This action will delete the conversation. You can access it later from the Deleted tab for 7 days.
                                        </AlertDialogDescription>) : (
                                            <AlertDialogDescription>
                                                The conversation will be deleted forever and this action can't be undone.
                                            </AlertDialogDescription>
                                        )}
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-600" onClick={async () => {
                                            if (conversation.status != 'DELETED') {
                                                onStatusChange(conversation.id, 'DELETED')
                                            } else {
                                                await axios.delete(`/api/convo-history/${conversation.id}`)
                                                window.location.reload()
                                            }
                                        }
                                        }>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </HorizontalBorderCard>
            ))}
        </div>
    )
}