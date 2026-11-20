"use client";

import { useToast } from "@/hooks/use-toast";
import { Montserrat } from "next/font/google";
import { useEffect, useRef } from "react";
import ArticleStack from "./ArticleStack";
import Citations, { CitationLoadingSkeleton } from "./Citations";
import { Query } from "./ConversationBot";
import InfinityLoader from "./InfinityLoader";
import { SourcesLoader } from "./SourcesLoader";

interface ConversationMessageProps {
    query?: Query
    isStreaming: boolean
    onRepeatQuery: (queryId: string) => void
    onFeedback: (queryId: string, feedback: 'positive' | 'negative') => void
    citations: any[]
    streamingQueryId: string
    isReasoningModel: boolean
    reasoningContent: string
}

const font = Montserrat({
    weight: "500",
    subsets: ["latin"],
})

const ConversationMessage = ({
    query,
    isStreaming,
    citations,
    streamingQueryId,
    onRepeatQuery,
    isReasoningModel = false,
    reasoningContent = ""
}: ConversationMessageProps) => {
    const { toast } = useToast()
    const codeRef = useRef<HTMLElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);

    const copyCodeToClipboard = () => {
        if (codeRef.current) {
            const range = document.createRange();
            range.selectNode(codeRef.current);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            document.execCommand('copy');
            window.getSelection()?.removeAllRanges();
            showToast("Copied to clipboard");
        }
    };
    const showToast = (message: string) => {
        toast({
            title: message,
            description: "The message has been copied to your clipboard.",
            duration: 3000,
        });
    }

    useEffect(() => {
        if (isStreaming && query?.queryId === streamingQueryId) {
            messageRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [isStreaming, streamingQueryId, query?.queryId]);

    return (
        <div ref={messageRef} className="mb-4 w-full break-words">
            <div className="p-3 rounded-lg w-full">
                {/* Question */}
                <div className="md:overflow-visible break-words w-full overflow-x-auto">
                    <pre className={`text-lg whitespace-pre-wrap break-words text-white p-3 bg-gray-50 dark:bg-gray-800/50 opacity-80 rounded-md font-mono ${font.className}`}>
                        {query!.userMessage}
                    </pre>
                </div>
                {/* Answer design */}
                {
                    isStreaming && query?.queryId === streamingQueryId && (
                        <>
                            <div className="flex items-center space-x-2 mb-4 pt-2">
                                {/* <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4L20 20M4 20L20 4M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" />
                                </svg> */}
                                <SourcesLoader />
                                <h2 className="text-lg text-purple-400 font-semibold">Sources</h2>
                            </div>
                            <CitationLoadingSkeleton />
                        </>
                    )
                }
                <div>
                    {query?.queryId !== streamingQueryId && query?.citations && query.citations.length > 0 && <div className="flex items-center space-x-2 mb-4 pt-2">
                        <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L20 20M4 20L20 4M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <h2 className="text-lg text-purple-400 font-semibold">Sources</h2>
                    </div>}
                    {query?.queryId !== streamingQueryId && query?.citations && <Citations cards={query!.citations} />}
                </div>
                <div className="flex items-center my-2 pt-2">
                    {
                        isStreaming && query?.queryId === streamingQueryId ?
                            <div className="pr-2">
                                <InfinityLoader />
                            </div>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                    }
                    <span className="font-bold text-lg text-purple-400">Answer</span>
                </div>

                <div className={`text-base overflow-x-auto md:overflow-visible break-words`}>
                    <ArticleStack processedContents={query!.aiAnswers} codeRef={codeRef} copyCodeToClipboard={copyCodeToClipboard} queryId={query!.queryId} onRepeatQuery={onRepeatQuery} isStreaming={isStreaming} streamingQueryId={streamingQueryId} citations={citations} isReasoningModel={isReasoningModel} reasoningContent={reasoningContent} />

                </div>
                <hr className="my-4 border-t-1 border-white" />
            </div>
        </div>
    )
}
export default ConversationMessage
