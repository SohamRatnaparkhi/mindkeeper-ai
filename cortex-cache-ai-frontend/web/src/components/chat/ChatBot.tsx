"use client"

import ChatMessage from '@/components/complete/ChatMessage'
import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
// import { ScrollArea } from "../ui/scroll-area"
import { ParsedContent, processAIContentFinally } from '@/hooks/response-filter'
import { Clock, FileText } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Header from '../complete/Header'
import CustomScrollArea from '../ui/CustomScrollArea'
interface Message {
    id: string
    content: string
    sender: "user" | "ai"
    citations?: string[]
    ai_content?: ParsedContent
}

interface ChatbotProps {
    userName: string
    chatId: string
}

export default function Chatbot({ userName, chatId }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [interactionTitle, setInteractionTitle] = useState("")
    const [summary, setSummary] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [streamingResponse, setStreamingResponse] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isStreamingRef = useRef(false)
    const [lastQuery, setLastQuery] = useState<string | null>(null)
    const [parsingFailed, setParsingFailed] = useState(false);
    const [messageId, setMessageId] = useState("")
    // const [finalContent, setFinalContent] = React.useState<ParsedContent>();
    const finalResultAfterStreaming = (content: string) => {
        return processAIContentFinally(content);
    }
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        fetchPrevMessages()
    }, [])

    const fetchPrevMessages = async () => {
        // const res = await fetch(`/api/chat/${chatId}`)
        // const data = await res.json()
        // setMessages(data)
        console.log("chatId", chatId)
        setMessages([])
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
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            handleSubmit(e)
        }
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

    console.log(messages)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isStreaming) {
            stopStream()
            return
        }
        if (inputValue.trim()) {
            setInteractionTitle(inputValue.split('\n')[0].slice(0, 30) + (inputValue.length > 30 ? "..." : ""))
            const newMessage: Message = {
                id: Date.now().toString(),
                content: inputValue,
                sender: "user"
            }
            setMessages(prev => [...prev, newMessage])
            setInputValue("")
            adjustTextareaHeight()

            setIsLoading(true)
            setIsStreaming(true)
            isStreamingRef.current = true
            setStreamingResponse("")

            try {
                abortControllerRef.current = new AbortController()
                const signal = abortControllerRef.current.signal
                setLastQuery(inputValue)
                const res = await fetch('/api/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: inputValue,
                        query_id: uuidv4(),
                        user_id: userName,
                        conversation_id: chatId,
                        metadata: {
                            user_id: userName
                        },
                        number: 0,
                        is_pro: true
                    }),
                    signal,
                })

                if (!res.body) {
                    throw new Error('Response body is null')
                }

                const reader = res.body.getReader()
                const decoder = new TextDecoder()

                let fullResponse = ""
                while (isStreamingRef.current) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n')
                    lines.forEach((line) => {
                        if (line.startsWith('data: ')) {
                            const token = line.slice(6).replace(/\\n/g, '\n')
                            fullResponse += token
                            setStreamingResponse(fullResponse)
                        } else if (line.startsWith('messageId: ')) {
                            setMessageId(line)
                        }
                    })
                }
                console.log(`Message ID: ${messageId}`)
                // Only add the complete AI response to messages if streaming wasn't aborted
                const fullParsedContent = finalResultAfterStreaming(fullResponse);
                if (fullParsedContent.answer === '') {
                    setParsingFailed(true);
                }
                if (isStreamingRef.current) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: fullResponse,
                        sender: "ai",
                        ai_content: fullParsedContent
                    }])
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Error fetching stream:', error);
                }
            } finally {
                setIsLoading(false)
                setIsStreaming(false)
                isStreamingRef.current = false
                setStreamingResponse("")
                abortControllerRef.current = null
            }
        }
    }

    const fetchSummary = async () => {
        // Simulate API call to fetch summary
        setTimeout(() => {
            setSummary("This is a simulated summary of the current interaction.")
        }, 1000)
    }

    const handleShowSummary = async () => {
        await fetchSummary();
    };

    const handleRepeatQuery = () => {
        // Remove any AI-specific formatting
        // const cleanedQuery = query.replace(/<START_OF_ANSWER>|<END_OF_ANSWER>|<START_OF_SUMMARY>|<END_OF_SUMMARY>/g, '').trim();
        setInputValue(lastQuery || "");
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
    };

    const handleFeedback = (type: 'positive' | 'negative') => {
        // Implement feedback logic here
        console.log(`Feedback received: ${type}`);
        // You might want to send this feedback to your backend
    };

    return (
        <div className="flex flex-col h-full w-full overflow-x-auto">
            {messages.length === 0 && <Header interactionTitle={'Add Memory'} handleButtonClicked={() => { }} central="MindKeeper AI" />}
            {messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full max-w-6xl mx-auto px-4 wd-8">
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-5xl font-bold mb-6 tracking-tight">Welcome back, {userName} 👋</h1>
                            <p className="text-2xl leading-relaxed">
                                Your <span className="text-purple-400 font-semibold">MindKeeper</span> is ready to help you effortlessly
                                capture, organize, and recall your valuable knowledge
                            </p>
                        </motion.div>
                    </AnimatePresence>
                    <motion.div
                        className="w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="flex items-end w-full bg-white bg-opacity-10 border border-gray-600 rounded-md overflow-hidden">
                                <textarea
                                    ref={textareaRef}
                                    placeholder="🔍 Ask Anything..."
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full py-3 px-4 bg-transparent text-white placeholder-gray-400 text-lg focus:outline-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
                                    style={{ minHeight: '72px', maxHeight: '144px' }} // 3 to 6 lines approx.
                                />
                                <div className="flex items-center space-x-2 p-2 ">
                                    <Button
                                        type="button"
                                        className="rounded-md bg-transparent hover:bg-white hover:bg-opacity-10 text-gray-300 hover:text-white transition-colors duration-200"
                                        size="icon"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                    <Button
                                        type="submit"
                                        className={`rounded-md ${isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'} transition-colors duration-200`}
                                        size="icon"
                                    >
                                        {isStreaming ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="bg-opacity-5 border-grey-600 overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Clock className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Recent Conversations</dt>
                                                <dd className="flex items-baseline">
                                                    <div className="text-2xl font-semibold text-gray-900">12</div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-purple-700 hover:text-purple-900">View all</a>
                                    </div>
                                </div>
                            </div>
                            <div className='bg-opacity-10 border border-gray-600 rounded-md'>
                                <div className="bg-transparent border-grey-600 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-white truncate">Total Memories</dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-white">1,024</div>
                                                    </dd>
                                                    <dd>
                                                        <div className="text-sm text-white">Upload screenshots, video, audio, PDF files, or git repo (any public git repo on github/bitbukt/gitlab) or article links </div>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-5 py-3">
                                        <div className="text-sm">
                                            <a href="#" className="font-medium text-purple-700 hover:text-purple-900">Manage memories</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <>
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 p-4 relative">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="w-10 md:w-auto"> {/* Placeholder for mobile */}
                                <span className="hidden md:inline">
                                    {/* You can add any content here that you want to show only on larger screens */}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold truncate text-center flex-grow">
                                {interactionTitle}
                            </h2>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={handleShowSummary}
                                        className="bg-purple-900 text-white border-2 border-[#9855FF] hover:bg-purple-800 transition-colors duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="hidden md:inline">
                                            Show Summary
                                        </span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Interaction Summary</DialogTitle>
                                    </DialogHeader>
                                    <p>{summary}</p>
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    </div>

                    {/* Scrollable Message Area */}
                    <motion.div
                        className="flex-1 overflow-y-auto overflow-x-auto px-0 md:px-4 max-w-6xl mx-auto w-full "
                        animate={{
                            scale: messages.length > 0 ? 1 : 0.8,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <CustomScrollArea className="h-full w-full block">
                            {/*Generate scroll to bottom button  */}
                            {messages.map((msg) => (
                                <div className="w-full break-words" key={msg.id}>
                                    <ChatMessage
                                        content={msg.content}
                                        sender={msg.sender}
                                        onRepeatQuery={handleRepeatQuery}
                                        onFeedback={handleFeedback}
                                        isStreaming={isStreaming}
                                        aiContent={msg.ai_content}
                                        failedParsingAIContent={parsingFailed}
                                    />
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center justify-center space-x-2 my-4">
                                    <div className="text-white font-mono">AI is searching your memories</div>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                </div>
                            )}
                            {isLoading && (
                                <div className='block'>

                                    <ChatMessage
                                        content={streamingResponse}
                                        sender="ai"
                                        isStreaming={true}
                                        onRepeatQuery={handleRepeatQuery}
                                        onFeedback={handleFeedback}
                                    />
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </CustomScrollArea>
                    </motion.div>

                    {/* Input Area */}
                    <div className="flex-shrink-0 py-4">
                        <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto">
                            <div className="flex items-end w-full bg-white bg-opacity-10 border border-gray-600 rounded-md overflow-hidden">
                                <textarea
                                    ref={textareaRef}
                                    placeholder="Ask Anything..."
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full py-3 px-4 bg-transparent text-white placeholder-gray-400 text-lg focus:outline-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
                                    style={{ minHeight: '72px', maxHeight: '144px' }} // 3 to 6 lines approx.
                                />
                                <div className="flex items-center space-x-2 p-2">
                                    <Button
                                        type="button"
                                        className="rounded-md bg-transparent hover:bg-white hover:bg-opacity-10 text-gray-300 hover:text-white transition-colors duration-200"
                                        size="icon"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                    <Button
                                        type="submit"
                                        className={`rounded-md ${isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'} transition-colors duration-200`}
                                        size="icon"
                                    >
                                        {isStreaming ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    )
}