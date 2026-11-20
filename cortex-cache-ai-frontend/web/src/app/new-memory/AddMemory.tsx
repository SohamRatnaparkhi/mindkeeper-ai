'use client'
import { checkIsAuthenticated } from '@/actions/auth'
import { addMemoryBasedOnContentType } from '@/actions/memory-adder'
import { uploadFileUsingPresignedUrl } from '@/actions/s3'
import MindMapEditor from '@/components/mindmap/MindMapEditor'
import { MemoryStatus } from '@/components/status/MemoryStatus'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast'
import { ContentType } from '@/types/AddMemoryModalTypes'
import { User } from "@prisma/client"
import axios from 'axios'
import { Book, FileText, Github, Link, Notebook, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import ArticlePreview from './ArticlePreview'
import GitHubPreview from './GithubPreview'
import Spinner from './Spinner'
import YouTubePreview from './YoutubePreview'
const ALLOWED_MEDIA_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf',
]

export default function SecondBrainModal({ isOpen, onClose, defaultTab = 'media', currentMainTab = 'memory' }: { isOpen: boolean; onClose: () => void, defaultTab?: ContentType, currentMainTab?: "memory" | "mindmap" | "status" }) {
    const [contentType, setContentType] = useState<ContentType>(defaultTab)
    const [file, setFile] = useState<File | null>(null)
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [description, setDescription] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [loading, setIsLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<User>()
    const [activeTab, setActiveTab] = useState<"memory" | "mindmap" | "status">(currentMainTab)
    const { toast } = useToast()

    useEffect(() => {
        const checkAuthenticationStatus = async () => {
            const session = await checkIsAuthenticated()
            if (session.status === 401) {
                router.push('/auth/sign-in')
                return;
            } else {
                if (!session.body.user || !session.body.user.email) {
                    router.push('/auth/sign-in')
                    return;
                }

                const user = session.body.user
                if (!user) {
                    router.push('/auth/sign-in')
                    return;
                }
                setCurrentUser(user as unknown as User)
            }
        }
        checkAuthenticationStatus()
    }, [])

    const router = useRouter()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: ALLOWED_MEDIA_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
    })

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'ogg', 'mp3', 'wav']

    const handleSubmit = async () => {
        let s3Key = ""
        setIsLoading(true)
        if (contentType === 'media') {
            if (!file) {
                alert('No file selected.')
                toast({
                    title: 'No file selected.',
                    description: 'Please select a file to upload.',
                    duration: 5000,
                    className: 'bg-red-500 text-white'
                })
                setIsLoading(false)
                onClose()
                return
            }
            //  return if file size is greater than 4 MB
            if (file.size > 4 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "File exceeds 4MB limit. To proceed, either:\n\n" +
                        "• Compress the file to reduce its size\n" +
                        "• Split the content into multiple smaller files and create a mindmap after uploading the individual files separately\n",
                    variant: "destructive",
                    className: "bg-red-500 text-white",
                    duration: 10000
                });

                setIsLoading(false)
                return;
            }

            // return if file extension is not allowed
            const extension = file.name.split('.').reverse()[0]
            if (!allowedExtensions.includes(extension)) {
                toast({
                    title: "File type not supported",
                    description: "Please upload a file with one of the following extensions: " + allowedExtensions.join(', '),
                    variant: "destructive",
                    className: "bg-red-500 text-white",
                    duration: 10000
                });

                setIsLoading(false)
                return;
            }

            setIsUploading(true)
            const fileName = `${uuidv4()}-${file.name}`
            s3Key = fileName
            const { data } = await axios.post('/api/aws-presigned', {
                fileName: fileName,
                fileType: file.type,
                // file
            })
            const presignedUrl = data.url
            console.log('Presigned URL:', presignedUrl)
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await uploadFileUsingPresignedUrl(formData, presignedUrl)

            console.log(uploadRes)
            if (uploadRes.status === 200) {
                // Success case
                // alert('File uploaded successfully.')
                toast({
                    title: 'File uploaded successfully.',
                    description: 'File uploaded successfully.',
                    duration: 5000,
                    className: 'bg-green-500 text-white'
                })
            } else {
                // Handle failure
                // alert('Failed to upload the file.')
                toast({
                    title: 'Failed to upload the file.',
                    description: 'Failed to upload the file.',
                    duration: 5000,
                    className: 'bg-red-500 text-white'
                })
            }
        }
        console.log("URL = ", url)
        const { data: _, status } = await addMemoryBasedOnContentType(
            contentType,
            {
                title,
                description,
                tags,
                link: s3Key != "" ? s3Key : url
            },
            "low-priority-queue",
            currentUser?.id as string,
            ""
        )
        if (status === 200) {
            // alert('Memory added successfully.')
            toast({
                title: 'Memory will soon be added. ',
                description: 'You will receive an email once it is done. By then you can continue adding more memories!.',
                duration: 15000,
                className: 'bg-green-500 text-white'
            })
            emptyInputStates()
            setIsUploading(false)
            // setActiveTab('status')
            // onClose()
            setIsLoading(false)
        } else {
            alert('Failed to add memory.')
            toast({
                title: 'Failed to add memory.',
                description: 'Failed to add memory.',
                duration: 5000,
                className: 'bg-red-500 text-white'
            })
        }
        // setActiveTab('status')
    }

    const handleRemoveFile = () => {
        setFile(null)
    }

    const emptyInputStates = () => {
        setFile(null)
        setUrl('')
        setTitle('')
        setTags([])
        setDescription('')
    }
    const handleUrlChange = useCallback((newUrl: string) => {
        setUrl(newUrl);
    }, []);

    const handleAddPage = () => {
        const queryParams = new URLSearchParams()
        if (title) queryParams.set('title', title)
        if (description) queryParams.set('description', description)
        if (tags.length) queryParams.set('tags', tags.join(','))
        router.push(`/add-page?${queryParams.toString()}`)
    }

    const handleIntegration = (type: 'notion' | 'gdrive') => {

        const queryParams = new URLSearchParams()
        if (title) queryParams.set('title', title)
        if (description) queryParams.set('description', description)
        if (tags.length) queryParams.set('tags', tags.join(','))
        router.push(`/add-page/${type}?${queryParams.toString()}`)

    }

    const renderPreview = () => {
        if (!file) return null

        if (file.type.startsWith('image/')) {
            return (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                />
            )
        } else if (file.type.startsWith('audio/')) {
            return (
                <audio src={URL.createObjectURL(file)}></audio>
            )
        } else if (file.type.startsWith('video/')) {
            return (
                <video className='w-full h-full object-content' src={URL.createObjectURL(file)} controls></video>
            )
        }

        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-sm text-gray-400">Preview not available for this file type</p>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="custom-scrollbar-horizontal w-[90%] sm:max-w-[450px] max-h-[90vh] overflow-y-auto bg-gray-900 text-gray-100 border border-gray-800 shadow-lg shadow-blue-500/20">
                {/* <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold">Add Memory or MindMap</DialogTitle>
                </DialogHeader> */}

                <div className="flex flex-col">
                    {/* Fixed Header */}
                    <div className="p-2 space-y-4">
                        <Tabs defaultValue={activeTab} onValueChange={(value) => {
                            console.log('Value:', value)
                            setActiveTab(value as "memory" | "mindmap")
                            setContentType('media')
                        }}>
                            <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                                <TabsTrigger defaultChecked={true} value="memory">Memory</TabsTrigger>
                                <TabsTrigger value="mindmap">Mindmaps</TabsTrigger>
                                <TabsTrigger value="status"> Status </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className=''>
                        <Tabs value={activeTab}>
                            <TabsContent value='memory'>
                                <div className="space-y-4 mt-6">
                                    <Tabs defaultValue={contentType} className="w-full" onValueChange={(value) => {
                                        setContentType(value as ContentType)
                                        setUrl("")
                                    }}>
                                        <TabsList className="grid w-full grid-cols-4 gap-2 mb-6">
                                            <TabsTrigger
                                                value="media"
                                                className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors duration-200`}
                                            >
                                                <Upload className="h-4 w-4 mr-1" />Media
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="youtube"
                                                className={`data-[state=active]:bg-purple-600 transition-colors duration-200`}
                                            >
                                                <Link className="h-4 w-4 mr-1" />YouTube
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="article"
                                                className={`data-[state=active]:bg-purple-600 transition-colors duration-200`}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />Web
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="git"
                                                className={`data-[state=active]:bg-purple-600 transition-colors duration-200`}
                                            >
                                                <Github className="h-4 w-4 mr-2" />Github
                                            </TabsTrigger>
                                            {/* <TabsTrigger
                                                value="page"
                                                className={`data-[state=active]:bg-purple-600 transition-colors duration-200`}
                                            >
                                                <Book className="h-4 w-4 mr-1" />Page
                                            </TabsTrigger> */}
                                        </TabsList>
                                        <TabsContent value="media" className="space-y-4">
                                            {/* {renderContentInput()} */}
                                            <ContentInput
                                                contentType={contentType}
                                                url={url}
                                                setUrl={handleUrlChange}
                                                file={file}
                                                handleRemoveFile={handleRemoveFile}
                                                getRootProps={getRootProps}
                                                getInputProps={getInputProps}
                                                isDragActive={isDragActive}
                                                renderPreview={renderPreview}
                                                handleAddPage={handleAddPage}
                                            />
                                        </TabsContent>
                                        <TabsContent value="youtube" className="space-y-4">
                                            {/* {renderContentInput()} */}
                                            <ContentInput
                                                contentType={contentType}
                                                url={url}
                                                setUrl={handleUrlChange}
                                                file={file}
                                                handleRemoveFile={handleRemoveFile}
                                                getRootProps={getRootProps}
                                                getInputProps={getInputProps}
                                                isDragActive={isDragActive}
                                                renderPreview={renderPreview}
                                                handleAddPage={handleAddPage}
                                            />
                                        </TabsContent>
                                        <TabsContent value="article" className="space-y-4">
                                            {/* {renderContentInput()} */}
                                            <ContentInput
                                                contentType={contentType}
                                                url={url}
                                                setUrl={handleUrlChange}
                                                file={file}
                                                handleRemoveFile={handleRemoveFile}
                                                getRootProps={getRootProps}
                                                getInputProps={getInputProps}
                                                isDragActive={isDragActive}
                                                renderPreview={renderPreview}
                                                handleAddPage={handleAddPage}
                                            />
                                        </TabsContent>
                                        <TabsContent value="git" className="space-y-4">
                                            {/* {renderContentInput()} */}
                                            <ContentInput
                                                contentType={contentType}
                                                url={url}
                                                setUrl={handleUrlChange}
                                                file={file}
                                                handleRemoveFile={handleRemoveFile}
                                                getRootProps={getRootProps}
                                                getInputProps={getInputProps}
                                                isDragActive={isDragActive}
                                                renderPreview={renderPreview}
                                                handleAddPage={handleAddPage}
                                            />
                                            {/* <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                                                <div className="mx-auto p-8 text-center">
                                                    <div className="mb-8 flex justify-center">
                                                        <MessageSquareCode className="text-slate-400 w-16 h-16" />
                                                    </div>

                                                    <h1 className="text-4xl font-bold text-slate-100 mb-4">
                                                        Coming Soon
                                                    </h1>

                                                    <p className="text-xl text-slate-300 mb-6">
                                                        You will soon be able to talk to GitHub repos
                                                    </p>

                                                    <div className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 rounded-lg border border-slate-700">
                                                        <div className="flex space-x-2 items-center">
                                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                                            <span className="text-slate-400">In Development</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> */}
                                        </TabsContent>
                                        {/* <TabsContent value="page" className="space-y-4"> */}

                                        {/* </TabsContent> */}
                                    </Tabs>
                                    {<>
                                        <Input
                                            placeholder="Title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-gray-800 text-gray-300 border-gray-700"
                                        />
                                        <Textarea
                                            placeholder="Description (optional)"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[100px] bg-gray-800 text-gray-300 border-gray-700"
                                        />
                                    </>
                                    }
                                </div>
                                <div className="relative w-full mt-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-600" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-gray-900 px-2 text-gray-400">Or Upload from </span>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button onClick={() => handleIntegration('notion')} className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700">
                                        <Notebook className="mr-2 h-4 w-4" />
                                        Notion
                                    </Button>
                                    <Button onClick={() => handleIntegration('gdrive')} className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700">
                                        <Image
                                            src="/google-drive-icon.png"
                                            alt="Google Drive"
                                            width={24}
                                            height={24}
                                            className="opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        {/* <CloudIcon className="mr-2 h-4 w-4" /> */}
                                        Google Drive
                                    </Button>
                                    <hr />
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-purple-600 text-white hover:bg-purple-700 mt-3 rounded-md w-full"
                                    disabled={!title || (contentType === 'media' ? !file : !url) || loading}
                                >
                                    {loading ? 'Adding Memory...' : 'Add Memory'}
                                </Button>

                                {
                                    loading && isUploading && (
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm text-gray-500">Uploading...</p>
                                            <progress value={uploadProgress} max={100} className="w-1/2 h-2 bg-gray-800 rounded-full"></progress>
                                        </div>
                                    )
                                }
                                {
                                    loading && <Spinner />
                                }

                            </TabsContent>
                            <TabsContent value='mindmap'>
                                <MindMapEditor mindmapId={uuidv4()} />
                            </TabsContent>
                            <TabsContent value='status'>
                                <MemoryStatus />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const ContentInput = memo(function ContentInput({
    contentType,
    url,
    setUrl,
    file,
    handleRemoveFile,
    getRootProps,
    getInputProps,
    isDragActive,
    renderPreview,
    handleAddPage
}: {
    contentType: ContentType;
    url: string;
    setUrl: (url: string) => void;
    file: File | null;
    handleRemoveFile: () => void;
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;
    renderPreview: () => JSX.Element | null;
    handleAddPage: () => void;
}) {
    switch (contentType) {
        case 'media':
            return (
                <div className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors duration-200 ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500/50'
                            }`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate text-gray-300">
                                    {file.name?.substring(0, 10) + "..." + file.name.split('.').reverse()[0]} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}>
                                    <Trash2 className="h-4 w-4 text-gray-400" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                                <p className="text-sm font-medium text-gray-300">Drag & drop a file here, or click to select</p>
                                <p className="text-xs text-gray-500">Supported formats: Images, Audio, Video, PDF, Word</p>
                            </div>
                        )}
                    </div>
                    {file && (
                        <div className="relative w-full h-48 sm:h-64 bg-gray-800 rounded-lg overflow-hidden">
                            {renderPreview()}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-gray-900/50 hover:bg-gray-800/50 rounded-full"
                                onClick={handleRemoveFile}
                            >
                                <Trash2 className="h-4 w-4 text-gray-300" />
                            </Button>
                        </div>
                    )}
                </div>
            )
        case 'youtube':
            return <YouTubePreview url={url} setUrl={setUrl} />;
        case 'article':
            return <ArticlePreview url={url} setUrl={setUrl} />;
        case 'git':
            return <GitHubPreview url={url} setUrl={setUrl} />;
        case 'page':
            return (
                <div className="space-y-4">
                    <Button onClick={handleAddPage} className="w-full  bg-gray-800 text-gray-300 hover:bg-gray-700">
                        <Book className="mr-2 h-4 w-4" />
                        Add External Page
                    </Button>
                </div>
            )
    }
})
