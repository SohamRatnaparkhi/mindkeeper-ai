"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    FileAudio,
    FileText,
    GitGraph,
    Globe,
    Image,
    NotebookPen,
    Search,
    Video
} from "lucide-react"
import Link from "next/link"
import React, { useRef, useState } from "react"
import CustomScrollArea from "../ui/CustomScrollArea"

import { DriveIcon, NotionIcon, YouTubeIcon } from "./CustomeIcons"

type WebSourceType = 'github' | 'arxiv' | 'youtube' | 'web' | 'reddit';
type MemoryType = 'image' | 'youtube' | 'web' | 'git' | 'drive' | 'notion' | 'memory' | 'pdf' | 'video' | 'audio' | 'note';
type SourceType = WebSourceType | MemoryType;
export interface ICitationType {
    title: string
    description: string
    link: string
    sourceType: SourceType
    sourceNumber: number
    sourceLink: string
    memoryId: string
    startTime?: string
    endTime?: string
}


interface IconConfig {
    icon: any; // Replace 'any' with proper type when custom logos are imported
    className?: string;
    style?: React.CSSProperties;
}

const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
} as const;

const getSourceIcon = (sourceType: SourceType, size: keyof typeof iconSizes = "sm"): IconConfig => {
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
                className: `${baseClasses} text- yellow-400`,
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

const getSourceTypeDisplay = (sourceType: SourceType): string => {
    switch (sourceType) {
        case 'image':
            return 'Image';
        case 'youtube':
            return 'YouTube';
        case 'web':
            return 'Web';
        case 'git':
        case 'github':
            return 'Git';
        case 'drive':
            return 'Drive';
        case 'notion':
            return 'Notion';
        case 'arxiv':
            return 'arXiv';
        case 'reddit':
            return 'Reddit';
        default:
            return 'Web';
    }
};

function groupCitationsByMemoryId(citations: ICitationType[]): Record<string, ICitationType[]> {
    return citations?.reduce((acc, citation) => {
        const groupId = `${citation.sourceType}-${citation.memoryId}`
        if (!acc[groupId]) {
            acc[groupId] = []
        }
        acc[groupId].push(citation)
        return acc
    }, {} as Record<string, ICitationType[]>)
}

const CitationCard = ({ citation, onClick }: { citation: ICitationType; onClick: () => void }) => {
    // const IconComponent = getSourceIcon(citation.sourceType) || getSourceIcon('web');
    const iconConfig = getSourceIcon(citation.sourceType);
    return (
        <Card
            className="w-[180px] flex-shrink-0 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg cursor-pointer transition-all hover:bg-opacity-20"
            onClick={onClick}
        >
            <div className="p-4 space-y-2">
                <div className="flex items-center space-x-2">
                    {React.createElement(iconConfig.icon, {
                        className: iconConfig.className,
                        style: iconConfig.style
                    })}
                    <a
                        // href={citation.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold hover:underline truncate"
                    >
                        {citation.title}
                    </a>
                </div>
            </div>
        </Card>
    );
};

function DescriptionModal({
    citations,
    selectedIndex,
    onClose,
    onPrevious,
    onNext
}: {
    citations: ICitationType[];
    selectedIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}) {
    const citation = citations[selectedIndex]
    const IconComponent = getSourceIcon(citation.sourceType) || getSourceIcon('web');
    const iconConfig = getSourceIcon(citation.sourceType);
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg cursor-pointer transition-all max-w-2xl w-[90%] mx-auto px-2 max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{citation.title}</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <CustomScrollArea className="flex-grow">
                    <div className="p-4">
                        <p className="text-sm mb-4">{citation.description}</p>
                        <Link className="flex items-center space-x-2 text-sm text-muted-foreground" href={citation.sourceLink}>
                            {/* <IconComponent className="w-4 h-4" /> */}
                            {React.createElement(iconConfig.icon, {
                                className: iconConfig.className,
                                style: iconConfig.style
                            })}
                            <span>{getSourceTypeDisplay(citation.sourceType)} · {citation.sourceNumber}</span>
                        </Link>
                        {citation.startTime && citation.endTime && (
                            <div className="mt-2 text-sm text-muted-foreground">
                                Time: {citation.startTime} - {citation.endTime}
                            </div>
                        )}
                        <a href={citation.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 block">
                            View Source
                        </a>
                    </div>
                </CustomScrollArea>
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={onPrevious}
                        className="p-2 rounded-full bg-accent transition-colors disabled:opacity-50"
                        disabled={selectedIndex === 0}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                        {selectedIndex + 1} of {citations.length}
                    </span>
                    <button
                        onClick={onNext}
                        className="p-2 rounded-full bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
                        disabled={selectedIndex === citations.length - 1}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function Citations({ cards }: { cards: ICitationType[] }) {
    const [selectedGroup, setSelectedGroup] = useState<ICitationType[] | null>(null)
    const [selectedDescriptionIndex, setSelectedDescriptionIndex] = useState<number | null>(null)

    const groupedCitations = groupCitationsByMemoryId(cards)

    if (cards?.length === 0) return null

    return (
        <div className="w-full overflow-x-auto max-w-5xl mx-auto bg-background/80 backdrop-blur-sm text-foreground">
            <ScrollableContainer id="citation-container">
                {Object.entries(groupedCitations).map(([memoryId, group]) => (
                    <CitationCard
                        key={memoryId}
                        citation={{
                            ...group[0],
                            title: `${group[0].title} (${group.length})`,
                        }}
                        onClick={() => setSelectedGroup(group)}
                    />
                ))}
            </ScrollableContainer>

            <Dialog open={selectedGroup !== null && selectedDescriptionIndex === null} onOpenChange={() => setSelectedGroup(null)}>
                <DialogContent className="bg-white bg-opacity-10 rounded-lg cursor-pointer transition-all backdrop-blur-sm max-w-4xl w-[90%] mx-auto px-2 max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{selectedGroup?.[0].title}</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <CustomScrollArea className="flex-grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {selectedGroup?.map((citation, index) => (
                                <Card
                                    key={index}
                                    className="bg-card hover:bg-white hover:bg-opacity-20 cursor-pointer bg-blend-saturation transition-colors"
                                    onClick={() => setSelectedDescriptionIndex(index)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium truncate">
                                            <a href={citation.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {citation.title}
                                            </a>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{citation.description}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between pt-2">
                                        <div className="flex items-center space-x-2">
                                            {getSourceIcon(citation.sourceType) && React.createElement(getSourceIcon(citation.sourceType).icon, { className: "w-4 h-4 text-muted-foreground" })}
                                            <span className="text-xs text-muted-foreground">{citation.sourceType} · {citation.sourceNumber}</span>
                                            <div>
                                                {citation.startTime != 'undef' && <span className="text-xs text-muted-foreground">{citation.startTime} - {citation.endTime}</span>}
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </CustomScrollArea>
                </DialogContent>
            </Dialog>

            {selectedGroup && selectedDescriptionIndex !== null && (
                <DescriptionModal
                    citations={selectedGroup}
                    selectedIndex={selectedDescriptionIndex}
                    onClose={() => setSelectedDescriptionIndex(null)}
                    onPrevious={() => setSelectedDescriptionIndex(prev => (prev === null || prev === 0) ? selectedGroup.length - 1 : prev - 1)}
                    onNext={() => setSelectedDescriptionIndex(prev => (prev === null || prev === selectedGroup.length - 1) ? 0 : prev + 1)}
                />
            )}
        </div>
    )
}

const ScrollableContainer = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const containerRef = useRef(null);

    const scroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            (containerRef.current as HTMLDivElement).scrollBy({
                left: direction === 'left' ? -200 : 200,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full flex">
            <div className="justify-start items-center flex">
                <button
                    onClick={() => scroll('left')}
                    className="p-2 rounded-full"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            <div
                ref={containerRef}
                className="flex space-x-4 w-full overflow-x-auto"
            >
                <div className="grow flex space-x-4">
                    {children}
                </div>
            </div>

            <div className="justify-end items-center flex">
                <button
                    onClick={() => scroll('right')}
                    className="p-2 rounded-full"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export const CitationLoadingSkeleton = () => {
    return (
        <div className="w-full overflow-x-auto max-w-5xl mx-auto p-4 bg-background/80 backdrop-blur-sm text-foreground">
            <div className="flex space-x-4">
                {[1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="w-[180px] flex-shrink-0 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg animate-pulse"
                    >
                        <div className="p-4 space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-300/20 rounded-full" />
                                <div className="h-4 bg-gray-300/20 rounded w-[120px]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};