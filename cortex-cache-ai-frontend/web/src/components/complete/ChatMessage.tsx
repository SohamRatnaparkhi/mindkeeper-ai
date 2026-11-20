
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { processAIContent } from "@/hooks/ai-filter";
import { ParsedContent } from "@/hooks/response-filter";
import { useToast } from "@/hooks/use-toast";
import React, { useRef } from 'react';
import FixedMarkdown from "./FixedMarkdown";

interface ChatMessageProps {
    content: string;
    sender: 'user' | 'ai';
    isStreaming?: boolean;
    onRepeatQuery: () => void;
    onFeedback: (type: 'positive' | 'negative') => void;
    aiContent?: ParsedContent;
    failedParsingAIContent?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, sender, isStreaming, onRepeatQuery, onFeedback, aiContent, failedParsingAIContent }) => {
    const { toast } = useToast()
    const codeRef = useRef<HTMLElement>(null);
    const copyCodeToClipboard = () => {
        if (codeRef.current) {
            const range = document.createRange();
            range.selectNode(codeRef.current);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            document.execCommand('copy');
            window.getSelection()?.removeAllRanges();
            alert('Code copied to clipboard!');
        }
    };

    const handleCopy = () => {
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
    };

    const renderContent = () => {
        if (sender === 'ai') {
            const processedContent = processAIContent(content, false,);
            return (
                <article className="rounded-md p-0 md:p-4 flex flex-col markdown-body entry-content text-justify w-full overflow-x-auto break-words">
                    <FixedMarkdown
                        processedContent={processedContent}
                        codeRef={codeRef}
                        copyCodeToClipboard={copyCodeToClipboard}
                    />
                </article>
                // <div className="w-full">{processedContent}</div>
            );
        }
        return (
            <div className="w-full overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words text-white text-sm p-4 bg-gray-50 dark:bg-gray-800/50 opacity-80 rounded-md font-mono">
                    {content}
                </pre>
            </div>);
    };

    return (
        <div className="mb-4 w-full break-words">
            <div className="p-3 rounded-lg w-full">
                {sender === 'ai' && (
                    <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-bold text-purple-400">Answer</span>
                    </div>
                )}
                <div className={`${sender === "user" ? "text-xl" : "text-base"} overflow-x-auto md:overflow-visible break-words`}>
                    {renderContent()}
                    {isStreaming && sender === 'ai' && <span className="animate-pulse">|</span>}
                </div>

                {sender === 'ai' && (
                    <div className="flex justify-end space-x-2 mt-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-gray-100 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                        </svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy to clipboard</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={() => onRepeatQuery()} className="p-1 text-gray-400 hover:text-gray-100 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Repeat query</p>
                                </TooltipContent>
                            </Tooltip   >

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={() => onFeedback('positive')} className="p-1 text-gray-400 hover:text-green-400 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                        </svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Positive feedback</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={() => onFeedback('negative')} className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                        </svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Negative feedback</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
                {sender === 'ai' && (
                    <hr className="my-4 border-t-2 border-white" />
                )}
                {/* <hr className="my-4 border-t-2 border-white" /> Bright white separator after feedback icons */}
            </div>
        </div>
    );
};

export default ChatMessage;


