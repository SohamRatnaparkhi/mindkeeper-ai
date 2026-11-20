"use client"

import SecondBrainModal from '@/app/new-memory/AddMemory';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, BookOpen, BrainCircuit, ChevronLeft, ChevronRight, FileAudio, FileText, GitGraph, Globe, Image, NotebookPen, Search, Sparkles, Video } from 'lucide-react';
import { useRef, useState } from 'react';
import { DriveIcon, NotionIcon, YouTubeIcon } from '../conversation/CustomeIcons';
import { Button } from '../ui/button';

export type SourceType = 'image' | 'youtube' | 'web' | 'git' | 'github' | 'video' |
    'audio' | 'drive' | 'notion' | 'arxiv' | 'reddit' | 'pdf' | 'note';

interface IconConfig {
    icon: any;
    className: string;
    style: React.CSSProperties;
}

const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
} as const;

export const getSourceIcon = (sourceType: SourceType, size: keyof typeof iconSizes = "sm"): IconConfig => {
    // Base classes that will be applied to all icons
    const baseClasses = `${iconSizes[size]} inline-flex items-center justify-center flex-shrink-0`;

    switch (sourceType) {
        case 'image':
            return {
                icon: Image,
                className: `${baseClasses} text-blue-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'youtube':
            return {
                icon: YouTubeIcon,
                className: `${baseClasses} text-red-500`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'web':
            return {
                icon: Globe,
                className: `${baseClasses} text-blue-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'git':
            return {
                icon: GitGraph,
                className: `${baseClasses} text-orange-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'github':
            return {
                icon: GitGraph,
                className: `${baseClasses} text-orange-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'video':
            return {
                icon: Video,
                className: `${baseClasses} text-red-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'audio':
            return {
                icon: FileAudio,
                className: `${baseClasses} text-green-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'drive':
            return {
                icon: DriveIcon,
                className: `${baseClasses} `,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'notion':
            return {
                icon: NotionIcon,
                className: `${baseClasses} text-white-600`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'arxiv':
            return {
                icon: BookOpen,
                className: `${baseClasses} text-purple-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'reddit':
            return {
                icon: Search,
                className: `${baseClasses} text-orange-500`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
        case 'pdf':
            return {
                icon: FileText,
                className: `${baseClasses} text-red-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            }
        case 'note':
            return {
                icon: NotebookPen,
                className: `${baseClasses} text-yellow-400`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            }
        default:
            return {
                icon: Globe,
                className: `${baseClasses} text-muted-foreground`,
                style: { minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }
            };
    }
};


interface MemoryHeaderProps {
    activeType: string;
    setActiveType: (type: string) => void;
    memoryTypes: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeTab: "ai" | "regular";
    setActiveTab: (tab: "ai" | "regular") => void;
    setMemories: (memories: any[] | undefined) => void;
    aiMemories: any[] | undefined;
    allMemories: any[] | undefined;
}

const MemoryHeader = ({
    activeType,
    setActiveType,
    memoryTypes,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    setMemories,
    aiMemories,
    allMemories
}: MemoryHeaderProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const navigateTypes = (direction: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += direction * 200;
        }
    };

    const [modalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center text-slate-200">
                    <Book className="mr-3 ml-5 text-transparent sm:text-slate-400" size={28} />
                    Your Memories
                </h1>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-700/50 border border-slate-600 text-slate-200 
                             hover:bg-slate-600/50 hover:border-slate-500
                             transition-all duration-200 flex items-center gap-2"
                >
                    <BrainCircuit size={18} className="text-slate-300" />
                    <span className="hidden sm:inline">Add Memory</span>
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-xl p-1.5 relative">
                        <ChevronLeft
                            className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors absolute left-2 z-10"
                            onClick={() => navigateTypes(-1)}
                        />
                        <div
                            ref={scrollContainerRef}
                            className="overflow-x-auto flex space-x-2 px-8 scrollbar-none"
                        >
                            {memoryTypes.map(type => {
                                const sourceIcon = getSourceIcon(type.toLowerCase() as SourceType, "sm");
                                const Icon = sourceIcon.icon;

                                return (
                                    <button
                                        key={type}
                                        className={`
                                            flex-shrink-0 px-4 py-1.5 rounded-lg transition-all duration-200
                                            text-sm font-medium flex items-center gap-2
                                            ${type === activeType
                                                ? 'bg-slate-700/50 text-slate-200 ring-1 ring-slate-600/50'
                                                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                            }
                                        `}
                                        onClick={() => setActiveType(type)}
                                    >
                                        <Icon className={sourceIcon.className} style={sourceIcon.style} />
                                        <span>{type}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <ChevronRight
                            className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors absolute right-2 z-10"
                            onClick={() => navigateTypes(1)}
                        />
                    </div>
                </div>

                <div className="relative lg:w-1/3">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 mr-2 z-50" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search memories by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm text-slate-200 placeholder-slate-400 
                                 rounded-xl py-2.5 pl-10 pr-4 
                                 focus:outline-none focus:ring-1 focus:ring-slate-500 
                                 transition-all duration-200"
                    />
                </div>
            </div>

            <div className="px-1">
                <Tabs
                    defaultValue={activeTab}
                    onValueChange={(value) => {
                        setActiveTab(value as "ai" | "regular");
                        setMemories(value === "ai" ? aiMemories : allMemories);
                    }}
                >
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl backdrop-blur-sm">
                        <TabsTrigger
                            value="regular"
                            className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-200"
                        >
                            Regular search
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai"
                            className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-200"
                        >
                            <Sparkles className='w-4 h-4 mx-2' /> AI search
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <SecondBrainModal
                isOpen={modalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default MemoryHeader;