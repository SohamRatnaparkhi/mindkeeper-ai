/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { processAIContent } from '@/hooks/ai-filter';
import 'katex/dist/katex.min.css';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import CitationLink from './CitationLink';

const FixedMarkdown = ({
    processedContent,
    codeRef,
    copyCodeToClipboard,
    citations
}: {
    processedContent: string;
    codeRef: React.RefObject<HTMLElement>;
    copyCodeToClipboard: () => void;
    citations?: any[];
}) => {
    const convertMathNotation = (content: string) => {
        let converted = content
        if (citations != null && citations != undefined) {
            converted = processAIContent(converted, false, citations);
        }
        converted = converted.replace(/\\\((.*?)\\\)/g, (_, captured) => `$${captured}$`);
        converted = converted.replace(/\\\[(.*?)\\\]/g, (_, captured) => `$$${captured}$$`);
        converted = converted.replace(/\\\((.*?)\\\)/g, (_, captured) => `$${captured}$`);

        if (citations != null && citations != undefined) {
            const content = processAIContent(converted, false, citations);
            console.log(`Content: ${content}`);
        }
        return processAIContent(converted, true);
    };

    const contentWithProcessedMath = convertMathNotation(processedContent);
    return (
        <div className="text-white">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                unwrapDisallowed={true}
                components={{
                    hr: ({ node, ...props }) => (
                        <hr className="overflow-x-auto hidden" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="my-2 w-full break-words whitespace-pre-wrap text-white" {...props} />
                    ),
                    pre: ({ node, children, ...props }: any) => (
                        <div className="w-full overflow-x-auto my-4">
                            <pre className="bg-gray-100 dark:bg-gray-800 overflow-x-scroll rounded-md w-full text-white">
                                {children}
                            </pre>
                        </div>
                    ),
                    code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                            <div className="w-full overflow-x-auto">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button onClick={copyCodeToClipboard} className="p-1 text-gray-400 hover:text-gray-100 transition-colors duration-200">
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
                                </TooltipProvider>
                                <pre className="bg-gray-100 dark:bg-gray-800 rounded-md w-full">
                                    <code ref={codeRef} className={`${className} whitespace-pre overflow-x-scroll text-white`} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        ) : (
                            <code className={`${className || ''} bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 whitespace-pre overflow-x-scroll text-white`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold my-3 break-words text-white" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-2xl font-semibold my-1 break-words text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-medium my-1 break-words text-white" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside my-2 break-words text-white" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside my-2 break-words text-white" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="my-1 break-words flex items-start text-white">
                            <span className="mr-2">•</span>
                            <div className="flex-1">
                                {props.children}
                            </div>
                        </li>
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 w-full">
                            <table className="min-w-full divide-y divide-gray-200 text-white" {...props} />
                        </div>
                    ),
                    img: ({ node, ...props }) => (
                        <img className="max-w-full h-auto" {...props} alt="" />
                    ),
                    a: ({ node, href, children, ...props }) => {
                        if (href?.includes('memories/') && citations != undefined) {
                            const [baseUrl, citationPart] = href.split('#citation-');
                            const citationNumber = citationPart;
                            const citationData = citations.find(
                                (citation) => citation.link === baseUrl
                            );
                            return (
                                <CitationLink
                                    href={href}
                                    citationNumber={citationNumber}
                                    title={citationData?.title || 'Untitled'}
                                    description={citationData?.description || 'No description available'}
                                    source={citationData?.sourceLink || href}
                                />
                            );
                        }
                        return (
                            <a
                                href={href}
                                className="text-blue-500 hover:text-blue-600 underline break-words"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    sup: ({ node, children, ...props }) => (
                        <sup className="text-xs text-white" {...props}>
                            {children}
                        </sup>
                    )
                }}
            >
                {contentWithProcessedMath}
            </ReactMarkdown>
        </div>
    )
}

export default FixedMarkdown