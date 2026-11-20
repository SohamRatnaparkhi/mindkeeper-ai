'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { Brain, Loader2, Search, Trash2, XCircle } from "lucide-react"
import { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"

interface NotionPage {
    id: string
    title: string
    properties: {
        [key: string]: unknown
        title?: {
            type: "title"
            title: Array<{
                type: "text"
                text: {
                    content: string
                }
                plain_text: string
            }>
        }
    }
    state: string
    workspaceName: string | undefined
    inDatabase: boolean
}

const PageSkeleton = () => (
    <div className="flex flex-col h-[200px] rounded-lg border border-white/5 p-4 backdrop-blur-sm">
        <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 bg-white/5" />
            <Skeleton className="h-4 w-1/2 bg-white/5" />
        </div>
        <div className="flex-1 flex items-center mt-4">
            <Skeleton className="h-6 w-32 bg-white/5" />
        </div>
        <div className="mt-4">
            <Skeleton className="h-10 w-full bg-white/5" />
        </div>
    </div>
)


export default function Pages() {
    const [pages, setPages] = useState<NotionPage[]>([])
    const [filteredPages, setFilteredPages] = useState<NotionPage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [processingPages, setProcessingPages] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchPages()
    }, [])

    const [deletingPage, setDeletingPage] = useState<string | null>(null)

    const handleDelete = async (pageId: string) => {
        setDeletingPage(pageId)
        try {
            await axios.delete(`/api/notion/pages/${pageId}`)
            await fetchPages()
        } catch (err) {
            setError('Failed to delete page. Please try again later.')
        } finally {
            setDeletingPage(null)
        }
    }

    useEffect(() => {
        const filtered = pages.filter(page => {
            const title = page.properties.title?.title[0]?.plain_text || 'Untitled'
            const workspace = page.workspaceName || ''
            const searchLower = searchQuery.toLowerCase()
            return title.toLowerCase().includes(searchLower) ||
                workspace.toLowerCase().includes(searchLower)
        })
        setFilteredPages(filtered)
    }, [searchQuery, pages])

    const fetchPages = async () => {
        try {
            const response = await fetch('/api/notion/pages')
            if (!response.ok) throw new Error('Failed to fetch Notion pages')
            const data = await response.json()
            setPages(data.pages)
        } catch (err) {
            setError('Re-connect Notion or Try again later')
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async (pageId: string, title: string) => {
        setProcessingPages(prev => new Set(prev).add(pageId))
        try {
            const { status } = await axios.post('/api/notion/pages', { pageId, title })
            if (status === 200) {
                await axios.put('/api/notion/pages', { pageId, state: 'connected' })
                await fetchPages()
            } else {
                throw new Error('Failed to connect')
            }
        } catch (err) {
            // setError('Failed to connect to Notion page. Please try again later.')
            toast({
                title: 'Taking too long!',
                description: 'The file will soon be added to your memory, please wait.',
                duration: 15000,
                className: 'bg-blue-500/20 text-blue-200'
            })
        } finally {
            setProcessingPages(prev => {
                const newSet = new Set(prev)
                newSet.delete(pageId)
                return newSet
            })
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-300 space-y-4 border border-white/5 rounded-lg backdrop-blur-sm">
                <XCircle className="h-16 w-16 animate-bounce" />
                <p className="text-center max-w-md font-medium">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => {
                        setError(null)
                        fetchPages()
                    }}
                    className="border-white/10 hover:bg-white/5"
                >
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 rounded-lg border border-white/10 p-6 backdrop-blur-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white/90">Your Notion Pages</h1>
                    <p className="text-white/60">Connect your knowledge base to MindKeeper</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
                    <Input
                        placeholder="Search pages..."
                        className="pl-9 bg-white/5 border-white/10 focus-visible:ring-white/20 placeholder:text-white/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => <PageSkeleton key={i} />)
                ) : filteredPages.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] text-white/60 rounded-lg border border-white/10 backdrop-blur-sm">
                        <Brain className="h-16 w-16 mb-4 opacity-50" />
                        <p className="font-medium">No pages found</p>
                        <p className="text-sm">Try adjusting your search query</p>
                    </div>
                ) : (
                    filteredPages.map((page) => (
                        <Card
                            key={page.id}
                            className={`flex flex-col transition-all duration-200 border-white/10 backdrop-blur-sm group ${page.state === 'connected'
                                ? 'bg-white/20'
                                : 'bg-white/5'
                                }`}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0"> {/* min-w-0 ensures text truncation works */}
                                        <CardTitle className="line-clamp-1 text-white/90">
                                            {page.properties.title?.title[0]?.plain_text || 'Untitled'}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1 text-white/60">
                                            {page.workspaceName || 'No workspace'}
                                        </CardDescription>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors shrink-0"
                                            >
                                                {deletingPage === page.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-black/90 border border-white/10 backdrop-blur-md">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-white/90">Remove Connection</AlertDialogTitle>
                                                <AlertDialogDescription className="text-white/60">
                                                    This will remove &quot;{page.properties.title?.title[0]?.plain_text || 'Untitled'}&quot; from MindKeeper.
                                                    The original Notion page will not be affected. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white">
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
                                                    onClick={() => handleDelete(page.id)}
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Badge
                                    variant={page.state === 'connected' ? 'default' : 'secondary'}
                                    className={`transition-colors ${page.state === 'connected'
                                        ? 'bg-white/20 hover:bg-white/30 text-white'
                                        : 'bg-white/10 text-white/70'
                                        }`}
                                >
                                    {page.state === 'connected' ? (
                                        <>
                                            <Brain className="h-3 w-3 mr-1" />
                                            Stored in MindKeeper
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Not stored
                                        </>
                                    )}
                                </Badge>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button
                                    className={`w-full transition-all ${page.state === 'connected'
                                        ? 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                                        }`}
                                    variant="outline"
                                    onClick={() => handleConnect(page.id, page.title)}
                                    disabled={processingPages.has(page.id)}
                                >
                                    {processingPages.has(page.id) ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : page.state === 'connected' ? (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Refresh Knowledge
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Store in MindKeeper
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}