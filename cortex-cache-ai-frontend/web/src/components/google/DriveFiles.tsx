'use client'

import { handleGoogleDriveAuth } from "@/actions/social-auth"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import axios, { AxiosError } from "axios"
import { Brain, File, FileImage, FileSpreadsheet, FileText, Loader2, Search, Trash2, XCircle } from "lucide-react"
import { useEffect, useState } from 'react'

interface GDriveFile {
    fileId: string
    name: string
    state: string
    mimeType: string
    url: string
}
export type GDriveError = {
    type: 'AUTH_REQUIRED' | 'SERVER_ERROR' | 'NOT_FOUND'
    message: string
}
const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="h-4 w-4 mr-2" />
    if (mimeType.includes('document')) return <FileText className="h-4 w-4 mr-2" />
    if (mimeType.includes('image')) return <FileImage className="h-4 w-4 mr-2" />
    return <File className="h-4 w-4 mr-2" />
}

const FileSkeleton = () => (
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

export default function DriveFiles() {
    const [files, setFiles] = useState<GDriveFile[]>([])
    const [filteredFiles, setFilteredFiles] = useState<GDriveFile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<GDriveError | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
    const [deletingFile, setDeletingFile] = useState<string | null>(null)
    const { toast } = useToast()
    useEffect(() => {
        const handleRefresh = () => {
            fetchFiles()
        }
        window.addEventListener('refreshDriveFiles', handleRefresh)
        return () => window.removeEventListener('refreshDriveFiles', handleRefresh)
    }, [])
    useEffect(() => {
        fetchFiles()
    }, [])

    useEffect(() => {
        const filtered = files.filter(file => {
            const searchLower = searchQuery.toLowerCase()
            return file.name.toLowerCase().includes(searchLower) ||
                file.mimeType.toLowerCase().includes(searchLower)
        })
        setFilteredFiles(filtered)
    }, [searchQuery, files])

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/gdrive/files')
            const data = await response.json()

            if (!response.ok) {
                setError(data.error)
                if (data.error.type === 'AUTH_REQUIRED') {
                    // handleReconnect()
                    await handleGoogleDriveAuth()
                }
                return
            }

            setFiles(data.files)
            setError(null)
        } catch (err) {
            setError({
                type: 'SERVER_ERROR',
                message: 'Error fetching Google Drive files. Please try again later.'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async (fileId: string) => {
        setProcessingFiles(prev => new Set(prev).add(fileId))
        try {
            const { status } = await axios.put('/api/gdrive/files', { fileId, state: 'connected' })
            if (status === 200) {
                await fetchFiles()
            } else {
                throw new Error('Failed to connect')
            }
        } catch (err) {
            const error: AxiosError = err as unknown as any
            if (error.status === 401) {
                await handleGoogleDriveAuth()
                toast({
                    title: 'Error',
                    description: 'Please try again',
                    duration: 5000,
                    className: 'bg-red-500/20 text-red-200'
                })
            } else if (error.status === 504) {
                toast({
                    title: 'Taking too long!',
                    description: 'The file will soon be added to your memory, please wait.',
                    duration: 15000,
                    className: 'bg-blue-500/20 text-blue-200'
                })
            }
            else setError({
                type: 'SERVER_ERROR',
                message: 'Failed to connect Google Drive file. Please try again later.'
            })
        } finally {
            setProcessingFiles(prev => {
                const newSet = new Set(prev)
                newSet.delete(fileId)
                return newSet
            })
        }
    }

    const handleDelete = async (fileId: string) => {
        setDeletingFile(fileId)
        try {
            await axios.delete(`/api/gdrive/files`, {
                data: { fileId }
            })
            await fetchFiles()
        } catch (err) {
            setError({
                type: 'SERVER_ERROR',
                message: 'Failed to delete Google Drive file. Please try again later.'
            })
        } finally {
            setDeletingFile(null)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-300 space-y-4 border border-white/5 rounded-lg backdrop-blur-sm">
                <XCircle className="h-16 w-16 animate-bounce" />
                <p className="text-center max-w-md font-medium">{error.message}</p>
                <Button
                    variant="outline"
                    onClick={() => {
                        setError(null)
                        fetchFiles()
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
                    <h1 className="text-2xl font-bold text-white/90">Your Google Drive Files in MindKeeper AI</h1>
                    {/* <p className="text-white/60">Connect your documents to MindKeeper</p> */}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
                    <Input
                        placeholder="Search files..."
                        className="pl-9 bg-white/5 border-white/10 focus-visible:ring-white/20 placeholder:text-white/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => <FileSkeleton key={i} />)
                ) : filteredFiles.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] text-white/60 rounded-lg border border-white/10 backdrop-blur-sm">
                        <FileText className="h-16 w-16 mb-4 opacity-50" />
                        <p className="font-medium">No files found</p>
                        <p className="text-sm">Try adjusting your search query</p>
                    </div>
                ) : (
                    filteredFiles.map((file) => (
                        <Card
                            key={file.fileId}
                            className={`flex flex-col transition-all duration-200 border-white/10 backdrop-blur-sm ${file.state === 'connected'
                                ? 'bg-white/10'
                                : 'bg-white/5'
                                }`}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="line-clamp-1 text-white/90 flex items-center">
                                            {getFileIcon(file.mimeType)}
                                            {file.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1 text-white/60">
                                            {file.mimeType.split('/').pop()?.toUpperCase()}
                                        </CardDescription>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors shrink-0"
                                            >
                                                {deletingFile === file.fileId ? (
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
                                                    This will remove &quot;{file.name}&quot; from MindKeeper.
                                                    The original file will not be affected. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white">
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
                                                    onClick={() => handleDelete(file.fileId)}
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
                                    variant={file.state === 'connected' ? 'default' : 'secondary'}
                                    className={`transition-colors ${file.state === 'connected'
                                        ? 'bg-white/20 hover:bg-white/30 text-white'
                                        : 'bg-white/10 text-white/70'
                                        }`}
                                >
                                    {file.state === 'connected' ? (
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
                                    className={`w-full transition-all ${file.state === 'connected'
                                        ? 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                                        }`}
                                    variant="outline"
                                    onClick={() => handleConnect(file.fileId)}
                                    disabled={processingFiles.has(file.fileId)}
                                >
                                    {processingFiles.has(file.fileId) ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : file.state === 'connected' ? (
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