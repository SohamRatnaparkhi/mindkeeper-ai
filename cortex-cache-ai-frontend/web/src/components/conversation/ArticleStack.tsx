"use client"

import { toast } from "@/hooks/use-toast"
import { Brain, Search, Sparkles } from 'lucide-react'
import { Poppins } from 'next/font/google'
import React, { useEffect, useState } from "react"
import FixedMarkdown from "../complete/FixedMarkdown"
import { CollapsibleReasoning } from "./CollapsibleReasoning"
import Interactions from "./Interactions"
import QuantumLoader from "./QuantumLoader"
interface ArticleStackProps {
    processedContents: string[]
    codeRef: React.RefObject<HTMLElement>
    queryId: string
    copyCodeToClipboard: () => void
    onRepeatQuery: (queryId: string) => void
    isStreaming: boolean
    streamingQueryId: string
    citations: any[],
    isReasoningModel: boolean,
    reasoningContent: string
}

const font = Poppins({
    weight: "400",
    subsets: ["latin"],
})

export default function ArticleStack({ processedContents, codeRef, copyCodeToClipboard, queryId, onRepeatQuery, isStreaming, streamingQueryId, citations, isReasoningModel = false, reasoningContent = "" }: ArticleStackProps) {
    const [currentIndex, setCurrentIndex] = useState(processedContents.length > 0 ? processedContents.length - 1 : 0)
    const totalArticles = processedContents.length
    const [message, setMessage] = useState('Processing query');

    useEffect(() => {
        const sequence = [
            { time: 2000, text: 'Analyzing', icon: Brain },
            { time: 4000, text: 'Recalling', icon: Search },
            { time: 12000, text: 'Generating', icon: Sparkles },
            { time: 45000, text: 'This is taking longer than usual', icon: Brain }
        ];

        const timers: any = [];

        // Check if we have processed content
        const hasContent = processedContents &&
            processedContents[currentIndex] &&
            processedContents[currentIndex].trim() !== '';

        if (hasContent) {
            // If we have content, only set the generating response message
            timers.push(
                setTimeout(() => setMessage('Generating'), 100)
            );
        } else {
            // If no content, run the full sequence
            sequence.forEach(({ time, text }) => {
                timers.push(
                    setTimeout(() => setMessage(text), time)
                );
            });
        }

        return () => timers.forEach(clearTimeout);
    }, [processedContents, currentIndex]);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex))
    }

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < totalArticles - 1 ? prevIndex + 1 : prevIndex))
    }


    const handleCopy = () => {
        const content = processedContents[currentIndex];
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content)
                .then(() => {
                    showToast("Copied to clipboard");
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                    fallbackCopy();
                });
        } else {
            fallbackCopy();
        }
    };

    const fallbackCopy = () => {
        const content = processedContents[currentIndex];
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast("Copied to clipboard");
            } else {
                showToast("Copy failed, please try again");
            }
        } catch (err) {
            console.error("Fallback copy failed: ", err);
            showToast("Copy failed, please try again");
        }
        document.body.removeChild(textArea);
    };

    const showToast = (message: string) => {
        toast({
            title: message,
            description: "The message has been copied to your clipboard.",
            duration: 3000,
        });
    }
    const getCurrentIcon = () => {
        if (message.includes('Searching')) return Search;
        if (message.includes('Processing')) return Brain;
        if (message.includes('Generating')) return Sparkles;
        return Brain;
    };

    const Icon = getCurrentIcon();


    const onFeedback = () => { }

    if (processedContents.length != 0) {
        return (
            <div className="relative min-h-fit w-full pr-1">
                <article className={`rounded-md flex flex-col markdown-body entry-content text-left w-full overflow-x-auto break-words ${font.className}`}>
                    {
                        isStreaming && queryId === streamingQueryId && (
                            <div className="flex items-center justify-center space-x-2 my-4 ">
                                <Icon size={24} className="text-white" />
                                <div className="text-white font-mono">{message}</div>
                                {/* <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                                </div> */}
                                <QuantumLoader />
                            </div>
                        )
                    }
                    {/* {
                        isReasoningModel && (
                            <div className="flex items-center justify-center space-x-2 my-4 ">
                                <Icon size={24} className="text-white" />
                                <div className="text-white font-mono">Reasoning</div>
                            </div>
                        )
                    } */}
                    {reasoningContent && reasoningContent != "" && <CollapsibleReasoning
                        content={reasoningContent}
                    />}
                    <FixedMarkdown
                        processedContent={processedContents[currentIndex]}
                        codeRef={codeRef}
                        copyCodeToClipboard={copyCodeToClipboard}
                        citations={citations}
                    />
                </article>
                <Interactions
                    answerId={currentIndex}
                    copyContent={processedContents[currentIndex]}
                    handleCopy={handleCopy}
                    onFeedback={onFeedback}
                    onRepeatQuery={() => onRepeatQuery(queryId)}
                    queryId={queryId}
                    currentIndex={currentIndex}
                    goToNext={goToNext}
                    goToPrevious={goToPrevious}
                    totalArticles={totalArticles}
                />
                {/* <hr className="my-4 border-t-1 border-white" /> */}
            </div>
        )
    }
}