"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { FeedbackModal } from "../FeedbackModal";

interface InteractionsProps {
    handleCopy: (content: string) => void
    onRepeatQuery: (queryId: string, answerId: number) => void
    onFeedback: (queryId: string, answerId: number, feedback: 'positive' | 'negative') => void
    copyContent: string
    queryId: string
    answerId: number
    currentIndex: number
    totalArticles: number
    goToPrevious: () => void
    goToNext: () => void
}

export default function Interactions({
    handleCopy,
    onRepeatQuery,
    onFeedback,
    copyContent,
    queryId,
    answerId,
    currentIndex,
    totalArticles,
    goToPrevious,
    goToNext,
}: InteractionsProps) {
    const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    return (
        <div className="flex items-center justify-between space-x-2 mt-2">
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">
                    {currentIndex + 1}/{totalArticles}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
                    disabled={currentIndex === totalArticles - 1}
                >
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
            <TooltipProvider>
                <div className="flex items-center space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(copyContent)}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy to clipboard</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy to clipboard</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onRepeatQuery(queryId, answerId)}>
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only">Repeat query</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Repeat query</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={feedback === 'positive' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => {
                                    onFeedback(queryId, answerId, 'positive');
                                    setFeedback('positive');
                                }}
                            >
                                <ThumbsUp className={`h-4 w-4 ${feedback === 'positive' ? 'text-green-600' : ''}`} />
                                <span className="sr-only">Positive feedback</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Positive feedback</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={feedback === 'negative' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => {
                                    onFeedback(queryId, answerId, 'negative');
                                    setFeedback('negative');
                                    setFeedbackModalOpen(true);
                                }}
                            >
                                <ThumbsDown className={`h-4 w-4 ${feedback === 'negative' ? 'text-red-600' : ''}`} />
                                <span className="sr-only">Negative feedback</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Negative feedback</p>
                        </TooltipContent>
                    </Tooltip>
                    <FeedbackModal onClose={() => setFeedbackModalOpen(false)} open={feedbackModalOpen} />
                </div>
            </TooltipProvider>
        </div>
    )
}
