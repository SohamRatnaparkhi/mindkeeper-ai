/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { areUserRateLimitsSatisfied, decrementRateLimit } from "@/actions/rate-limiting";
import { processAIContent } from "@/hooks/ai-filter";
import { toast } from "@/hooks/use-toast";
import { Memory, MindMap, User as PrismaUser } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import Header from "../complete/Header";
import MemoryWidget from "../memory/MemoryWidget";
import CustomScrollArea from "../ui/CustomScrollArea";
import { ICitationType } from "./Citations";
import ConversationMessage from "./ConversationMessage";
import { PromptInput } from "./PromptInput";
import SummaryModal from "./SummaryModal";

interface ConversationProps {
    userName: string;
    conversationId: string;
    user: User  // eslint-disable-line @typescript-eslint/no-explicit-any
    linkedMemoryIds?: string[];
    memory?: Memory;
    mindmapId?: string;
    mindmap?: MindMap
}

export interface Query {
    queryId: string;
    userMessage: string;
    aiAnswers: string[];
    citations: ICitationType[];
}

export interface Citation {
    citation: object;
}
interface Option {
    value: string;
    label: string;
}

const agents: Option[] = [
    { value: 'default', label: 'Default Agent' },
    { value: 'code', label: 'Code Assistant' },
    { value: 'social-linkedin', label: 'Linkedin Post agent' },
    { value: 'social-twitter', label: 'X(Twitter) Post agent' },
    { value: 'social-facebook', label: 'Facebook Post agent' },
    { value: 'social-instagram', label: 'Instagram Caption agent' },
    { value: 'blogging', label: 'Blogger agent' },
]
const llms: Option[] = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'deepseek-r1', label: 'DeepSeek R1' },
    { value: 'deepseek-chat', label: 'DeepSeek v3' },
    { value: 'sonnet-3.5', label: 'Claude Sonnet 3.5' },
    { value: 'gemini-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
    { value: 'llama-3.1-70b', label: 'Llama 3.1 70B' },
    // { value: 'llama-3.2-90b', label: 'Llama 3.2 90B' },
    // { value: 'llama-3.2-3b', label: 'Llama 3.2 3B' },
    // { value: 'grok', label: 'Grok 2' },
]

const Conversation = ({ userName, conversationId, user, linkedMemoryIds, memory, mindmap, mindmapId }: ConversationProps) => {
    const [queries, setQueries] = useState<Record<string, Query>>({});
    const [inputValue, setInputValue] = useState("")
    const [interactionTitle, setInteractionTitle] = useState("")
    const [useWeb, setUseWeb] = useState(false)
    const [selectedWebSources, setSelectedWebSources] = useState<string[]>([])
    const [summary, setSummary] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [streamingResponse, setStreamingResponse] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isStreamingRef = useRef(false)
    const [lastQuery, setLastQuery] = useState<string | null>(null)
    const [messageId, setMessageId] = useState("")
    const [queryOrdered, setQueryOrdered] = useState<string[]>([])
    const [streamingQueryId, setStreamingQueryId] = useState("")
    const [isRepeat, setIsRepeat] = useState(false)
    const [isProMode, setIsProMode] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState(agents[0].value)
    const [selectedLLM, setSelectedLLM] = useState(llms[0].value)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [useMemory, setUseMemory] = useState(true)
    const [showPromptInput, setShowPromptInput] = useState(true)
    const router = useRouter()
    const [reasoning, setReasoning] = useState<string>("")

    useEffect(() => {
        fetchPrevMessages()
    }, [])

    useEffect(() => {
        const checkScreenSize = () => {
            setShowShortcuts(window.innerWidth >= 768)
        }
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])
    const getSelectedAgentLabel = () => {
        return agents.find(a => a.value === selectedAgent)?.label || 'Select Agent'
    }

    const getSelectedLLMLabel = () => {
        return llms.find(l => l.value === selectedLLM)?.label || 'Select LLM'
    }

    let formattedDate = memory?.createdAt
        ? new Date(memory?.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        : null;

    formattedDate = formattedDate == null ? mindmap?.createdAt ? new Date(mindmap?.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }) : null : formattedDate


    const fetchPrevMessages = async () => {

        try {
            const { data, status } = await axios.get(`/api/convo-history/${conversationId}`)
            if (status === 200) {
                const { queries, title, summary, isShared, isOwner } = data.data
                setQueries(queries)
                setInteractionTitle(title ? title : "")
                setSummary(summary)
                setQueryOrdered(Object.keys(queries))

                if (!isOwner)
                    setShowPromptInput(false)
                else
                    setShowPromptInput(true)
            }
        } catch (error: unknown) {
            const axiosError = error as AxiosError
            if (axiosError.status === 403)
                router.push('/errors/403/convo')
            else if (axiosError.status === 404)
                setQueries({})
        }
    }

    const handleSubmit = async (e: React.FormEvent, repeatQueryId?: string) => {
        if (!repeatQueryId)
            e.preventDefault()

        if (isStreaming) {
            stopStream()
            return
        }

        chatEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });



        let currQuery = null
        if (repeatQueryId && queries[repeatQueryId]) {
            currQuery = queries[repeatQueryId]
        }

        if (repeatQueryId || inputValue.trim()) {
            if (interactionTitle === "")
                setInteractionTitle(inputValue)

            // if (inputValue.trim() === "") {
            //     setInputValue("")
            //     return
            // }

            if (inputValue) {
                setInputValue(inputValue.trim())
            }

            const queryId = repeatQueryId || uuidv4()
            const newQuery: Query = {
                queryId,
                userMessage: currQuery?.userMessage?.trim() || inputValue?.trim(),
                aiAnswers: [""],
                citations: []
            }

            // Initialize query in state
            if (!currQuery) {
                setQueries(prev => ({ ...prev, [queryId]: newQuery }))
                setQueryOrdered([...queryOrdered, queryId])
            } else {
                currQuery.aiAnswers.push('')
                setQueries(prev => ({ ...prev, [repeatQueryId || queryId]: currQuery }))
            }

            setInputValue("")
            adjustTextareaHeight()

            setIsLoading(true)
            setIsStreaming(true)
            isStreamingRef.current = true
            setStreamingResponse("")
            setStreamingQueryId(queryId)
            let streamMessageId = '';
            let fullResponse = ""
            const canUserInfer = await areUserRateLimitsSatisfied(user.id!, useWeb, useMemory)
            // let noCheck =In

            if (canUserInfer) {
                const { web, memory } = canUserInfer
                if (useWeb) {
                    if (!web || !web.satisfied) {
                        const category = web?.category
                        if (!category || category === 'HOURLY') {
                            toast({
                                title: 'Rate Limit Exceeded',
                                description: 'You have exceeded the rate limit for web queries. Please try again in 3 hours.',
                                className: 'bg-red-500 text-white',
                                duration: 15000
                            })
                        } else if (category === 'DAILY') {
                            toast({
                                title: 'Rate Limit Exceeded',
                                description: 'You have exceeded the DAILY rate limit for web queries. Please try again tomorrow.',
                                duration: 15000,
                                className: 'bg-red-500 text-white',
                            })
                        } else if (category === 'MASTER') {
                            toast({
                                title: 'Rate Limit Exceeded',
                                description: 'You have exceeded the MASTER rate limit for web queries. Please try again later.',
                                duration: 15000,
                                className: 'bg-red-500 text-white',
                            })
                        }
                        setIsLoading(false)
                        setIsStreaming(false)
                        isStreamingRef.current = false
                        setStreamingResponse("")
                        setStreamingQueryId("")
                        abortControllerRef.current = null
                        return
                    }
                }
                if (useMemory) {
                    if (!memory || !memory.satisfied) {
                        const category = memory?.category
                        if (!category || category === 'HOURLY') {
                            toast({
                                title: 'Rate Limit Exceeded',
                                description: 'You have exceeded the rate limit for memory queries. Please try again in 3 hours.',
                                className: 'bg-red-500 text-white',
                                duration: 15000
                            })
                        } else if (category === 'DAILY') {
                            toast({
                                title: 'Rate Limit Exceeded',
                                description: 'You have exceeded the DAILY rate limit for memory queries. Please try again tomorrow.',
                                duration: 15000
                            })
                        } else if (category === 'MASTER') {
                            toast({
                                title: 'Rate Limit Exceeded',
                                description: 'You have exceeded the MASTER rate limit for web queries. Please try again later.',
                                duration: 15000
                            })
                        }
                        setIsLoading(false)
                        setIsStreaming(false)
                        isStreamingRef.current = false
                        setStreamingResponse("")
                        setStreamingQueryId("")
                        abortControllerRef.current = null
                        return
                    }
                }
            }



            try {
                abortControllerRef.current = new AbortController()
                const signal = abortControllerRef.current.signal
                setLastQuery(inputValue)

                const metadata: Record<string, any> = {}
                metadata["user_id"] = user.id
                if (linkedMemoryIds)
                    metadata["memId"] = linkedMemoryIds
                setReasoning("")
                const res = await fetch('/api/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: newQuery.userMessage,
                        query_id: queryId,
                        user_id: user.id,
                        conversation_id: conversationId,
                        metadata: metadata,
                        is_pro: true,
                        llm: selectedLLM,
                        use_memory: useMemory,
                        agent: selectedAgent,
                        use_web: useWeb,
                        web_sources: selectedWebSources,
                    }),
                    signal,
                })

                if (!res.body) {
                    throw new Error('Response body is null')
                }

                const reader = res.body.getReader()
                const decoder = new TextDecoder()

                let fullReasoning = ""
                while (isStreamingRef.current) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value)
                    const chunk_body = chunk[0] == `{` ? JSON.parse(chunk)['body'] as unknown as string : chunk
                    const lines = chunk_body.split('\n')

                    lines.forEach((line) => {
                        if (line.startsWith('messageId: ')) {
                            const starter = 'messageId: '
                            streamMessageId = line.substring(starter.length, '9336ff48-b1f6-4d61-b14e-1f899438eba5'.length + starter.length)
                            console.log('Stream message ID:', streamMessageId)
                            console.log("Line before message ID: ", line)
                            line = line.slice(streamMessageId.length + starter.length + 1)
                            console.log("Line after message ID: ", line)
                        }
                        if (line.startsWith('reasoning: ')) {
                            const token = line.slice('reasoning: '.length).replace(/\\n/g, '\n')
                            fullReasoning += token
                            console.log("Reasoning token ", token)
                            setReasoning(fullReasoning)
                            console.log("Reasoning: ", reasoning)
                        }
                        if (line.startsWith('data: ')) {
                            const token = line.slice('data: '.length).replace(/\\n/g, '\n')
                            fullResponse += token
                            setStreamingResponse(fullResponse)
                            // if (type === 'reasoning: ')
                            // console.log(type)
                            // console.log(fullResponse)
                            // Update queries state with the current streaming response
                            setQueries(prevQueries => {
                                const existingQuery = prevQueries[repeatQueryId || queryId]
                                if (!existingQuery) return prevQueries

                                const updatedQuery = {
                                    ...existingQuery,
                                    aiAnswers: repeatQueryId
                                        ? existingQuery.aiAnswers.map((answer, index) =>
                                            index === existingQuery.aiAnswers.length - 1
                                                ? processAIContent(fullResponse, true)
                                                : answer
                                        )
                                        : [...existingQuery.aiAnswers.slice(0, -1), processAIContent(fullResponse, true)]
                                }

                                return { ...prevQueries, [repeatQueryId || queryId]: updatedQuery }
                            })
                        }

                    })
                }

                // Fetch citations after streaming is complete
                if (streamMessageId) {
                    const res2 = await fetch(`/api/citations`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            messageId: streamMessageId,
                            title: interactionTitle == "" ? inputValue : interactionTitle,
                            conversationId: conversationId
                        }),
                    })

                    if (!res2.ok) {
                        console.error('Failed to fetch citations')
                    } else {
                        const { citations, memoryIds } = await res2.json()
                        console.log('Citations:', citations)
                        console.log('Memory IDs:', memoryIds)

                        // Final update with citations
                        if (isStreamingRef.current) {
                            setQueries(prevQueries => {
                                const existingQuery = prevQueries[repeatQueryId || queryId]
                                if (!existingQuery) return prevQueries

                                const updatedQuery = {
                                    ...existingQuery,
                                    citations,
                                    aiAnswers: repeatQueryId
                                        ? existingQuery.aiAnswers.map((answer, index) =>
                                            index === existingQuery.aiAnswers.length - 1
                                                ? processAIContent(fullResponse, false, citations)
                                                : answer
                                        )
                                        : [...existingQuery.aiAnswers.slice(0, -1), processAIContent(fullResponse, false, citations)]
                                }

                                console.log(updatedQuery)

                                return { ...prevQueries, [repeatQueryId || queryId]: updatedQuery }
                            })
                        }
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Fetch aborted')
                } else {
                    console.error('Error fetching stream:', error)
                }
            } finally {
                setIsLoading(false)
                setIsStreaming(false)
                isStreamingRef.current = false
                setStreamingResponse("")
                setStreamingQueryId("")
                abortControllerRef.current = null

                const type = useMemory ? 'memory' : 'web'
                decrementRateLimit(user.id!, type, useMemory && useWeb)
            }
        }
    }
    // console.log(reasoning)
    const onRepeatQuery = (queryId: string) => {
        setIsRepeat(true)
        handleSubmit({} as React.FormEvent<Element>, queryId)
        setIsRepeat(false)
    }

    const stopStream = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        isStreamingRef.current = false
        setIsStreaming(false)
        setIsLoading(false)
        setStreamingResponse("")
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
        adjustTextareaHeight()
    }

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            const newHeight = Math.min(textarea.scrollHeight, 4 * 24) // 24px is approx. line height
            textarea.style.height = `${newHeight}px`
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        //  This doesn't work
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return
            } else { }
            e.preventDefault()
            handleSubmit(e)
        }
    }


    // console.log(memory)

    return (
        <div className="flex flex-col w-full h-full no-scroll-bar">
            {
                Object.keys(queries).length === 0 ?
                    (
                        <div className="no-scroll-bar flex flex-col content-between overflow-x-h-full max-w-6xl mx-auto px-4 wd-8 h-full">
                            <div className="">
                                <Header interactionTitle={'Add Memory'} handleButtonClicked={() => { }} central="MindKeeper AI" />
                            </div>
                            <div className="min-h-full flex flex-col justify-center item-center">
                                <div className="h-fit overflow-auto no-scroll-bar">
                                    <AnimatePresence>
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="text-center mb-10 md:mb-16"
                                        >
                                            {
                                                !linkedMemoryIds &&
                                                <>
                                                    <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Welcome back, {userName} 👋</h1>
                                                    <p className="text-lg md:text-2xl leading-relaxed">
                                                        Your <span className="text-purple-400 font-semibold">MindKeeper</span> is ready to help you effortlessly
                                                        capture, organize, and recall your valuable knowledge
                                                    </p>
                                                </>
                                            }
                                            {
                                                linkedMemoryIds && linkedMemoryIds.length == 1 &&
                                                <>
                                                    <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Hey {userName} 👋</h1>
                                                    <p className="text-lg md:text-2xl leading-relaxed">
                                                        Your <span className="text-purple-400 font-semibold">MindKeeper</span> is ready to help you effortlessly
                                                        recall anything related to &quot;{memory?.title}&quot;
                                                    </p>
                                                    {formattedDate && (
                                                        <p className="text-sm md:text-base text-gray-400">
                                                            Added to your knowledge base on {formattedDate}
                                                        </p>
                                                    )}
                                                </>
                                            }
                                            {
                                                linkedMemoryIds && linkedMemoryIds.length > 1 &&
                                                <>
                                                    <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Hey {userName} 👋</h1>
                                                    <p className="text-lg md:text-2xl leading-relaxed">
                                                        Your <span className="text-purple-400 font-semibold">MindKeeper</span> is ready to help you effortlessly
                                                        recall anything related to &quot;{mindmap?.title}&quot;
                                                    </p>
                                                    {formattedDate && (
                                                        <p className="text-sm md:text-base text-gray-400">
                                                            Added to your knowledge base on {formattedDate}
                                                        </p>
                                                    )}
                                                </>
                                            }

                                        </motion.div>
                                    </AnimatePresence>
                                    <motion.div
                                        className="max-w-5xl"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <PromptInput
                                            inputValue={inputValue}
                                            handleInputChange={handleInputChange}
                                            handleKeyDown={handleKeyDown}
                                            handleSubmit={handleSubmit}
                                            isStreaming={isStreaming}
                                            selectedWebSources={selectedWebSources}
                                            setSelectedWebSources={setSelectedWebSources}
                                            setUseWeb={setUseWeb}
                                            useWeb={useWeb}
                                            isProMode={isProMode}
                                            setIsProMode={setIsProMode}
                                            setSelectedAgent={setSelectedAgent}
                                            setSelectedLLM={setSelectedLLM}
                                            setIsDialogOpen={setIsDialogOpen}
                                            showShortcuts={showShortcuts}
                                            agents={agents}
                                            llms={llms}
                                            getSelectedAgentLabel={getSelectedAgentLabel}
                                            getSelectedLLMLabel={getSelectedLLMLabel}
                                            useMemory={useMemory}
                                            setUseMemory={setUseMemory}
                                            isDialogOpen={isDialogOpen}
                                        />
                                        <MemoryWidget currentUser={user as unknown as PrismaUser} />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                        // {/* </CustomScrollArea> */}
                    )
                    :
                    (
                        <div className="h-full content-between flex flex-col">
                            {/* Fixed Header */}
                            <div className="flex-shrink-0 relative">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full flex items-center justify-between"
                                >
                                    <div className="w-10 md:w-auto"> {/* Placeholder for mobile */}
                                    </div>
                                    <h2 className="text-lg font-bold truncate text-center flex-grow">
                                        {interactionTitle?.split('\n')[0].slice(0, 30) + (inputValue.length > 30 ? "..." : "")}
                                    </h2>

                                    <SummaryModal conversationId={conversationId} />
                                </motion.div>
                            </div>

                            {/* Messages */}
                            <div className="relative flex flex-col h-[95%]">
                                {/* Full-height scrollable messages */}
                                <motion.div
                                    className="flex-1 overflow-y-auto overflow-x-auto px-0 md:px-4 max-w-6xl mx-auto w-full"
                                    animate={{
                                        scale: Object.keys(queries).length > 0 ? 1 : 0.8,
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    <CustomScrollArea smoothScroll={true} className="custom-scrollbar-horizontal h-full w-full block">
                                        {Object.keys(queries).map((queryId) => (
                                            <div className="w-full break-words" key={queryId}>
                                                <ConversationMessage
                                                    key={`${queryId}-${queries[queryId].aiAnswers.length}`}
                                                    citations={queries[queryId].citations}
                                                    isStreaming={isStreaming}
                                                    onFeedback={() => { }}
                                                    onRepeatQuery={onRepeatQuery}
                                                    query={queries[queryId]}
                                                    streamingQueryId={streamingQueryId}
                                                    isReasoningModel={selectedLLM === 'deepseek-r1'}
                                                    reasoningContent={reasoning}
                                                />
                                            </div>
                                        ))}
                                        {
                                            isStreaming ? <div className="h-48" /> : null
                                        }
                                        <div className="h-48" />
                                        <div ref={chatEndRef} />
                                    </CustomScrollArea>
                                </motion.div>

                                {/* Floating PromptInput overlay */}
                                <div className="absolute left-0 right-0 bottom-4 mx-auto max-w-5xl px-4 z-50">
                                    <div className="relative">
                                        {/* Base background layer - always opaque */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md" />

                                        {/* Content masking layer */}
                                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />

                                        {/* Main content */}
                                        <div className="relative border border-gray-600 rounded-md shadow-sm">
                                            {showPromptInput && <PromptInput
                                                inputValue={inputValue}
                                                handleInputChange={handleInputChange}
                                                handleKeyDown={handleKeyDown}
                                                handleSubmit={handleSubmit}
                                                isStreaming={isStreaming}
                                                isProMode={isProMode}
                                                setIsProMode={setIsProMode}
                                                setSelectedAgent={setSelectedAgent}
                                                setSelectedLLM={setSelectedLLM}
                                                setIsDialogOpen={setIsDialogOpen}
                                                showShortcuts={showShortcuts}
                                                agents={agents}
                                                llms={llms}
                                                selectedWebSources={selectedWebSources}
                                                setSelectedWebSources={setSelectedWebSources}
                                                setUseWeb={setUseWeb}
                                                useWeb={useWeb}
                                                getSelectedAgentLabel={getSelectedAgentLabel}
                                                getSelectedLLMLabel={getSelectedLLMLabel}
                                                useMemory={useMemory}
                                                setUseMemory={setUseMemory}
                                                isDialogOpen={isDialogOpen}
                                            />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
            }
        </div>
        // </div>
    )
}

export default Conversation
