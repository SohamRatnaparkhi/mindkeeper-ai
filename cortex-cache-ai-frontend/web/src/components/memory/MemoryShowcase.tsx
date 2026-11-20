/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import axios from 'axios'
import { ChevronLeft, ChevronRight, Search, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Tabs, TabsContent } from '../ui/tabs'
import AiSearchEmptyState from './AiSearchEmptyState'
import MemoryCard from './MemoryCard'
import MemoryEmptyState from './MemoryEmptyState'
import MemoryHeader from './MemoryHeader'
import { MemorySkeleton } from './MemorySkeleton'

const memoryTypes = ['All', 'Image', 'PDF', 'Youtube', 'Web', 'Git', 'Drive', 'Notion', 'Video', 'Audio', 'Note']



export default function MemoryShowcase() {
    const [activeType, setActiveType] = useState('All')
    const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [aiSearchQuery, setAiSearchQuery] = useState('')
    const [allMemories, setAllMemories] = useState<any[]>()
    const [aiMemories, setAiMemories] = useState<any[]>()
    const [memories, setMemories] = useState<any[]>()
    const [activeTab, setActiveTab] = useState<'ai' | 'regular'>('regular')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(9);

    const itemWidth = 400;
    const itemHeight = 300;
    const [normalLoading, setNormalLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)

    const calculateItemsPerPage = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const availableHeight = viewportHeight * 0.80; // Using 3/4 of viewport height

        const columnsCount = Math.floor(viewportWidth / (itemWidth + 24)) + 1; // 24px for gap
        const rowsCount = Math.floor(availableHeight / (itemHeight + 24)) + 1;

        const totalItems = columnsCount * rowsCount;

        return Math.max(3, Math.min(48, totalItems));
    };

    useEffect(() => {
        setItemsPerPage(calculateItemsPerPage());

        const handleResize = () => {
            setItemsPerPage(calculateItemsPerPage());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        setSelectedMemoryId(null) // Reset selected memory when changing page
    }
    useEffect(() => {
        const getAllMemories = async () => {
            setNormalLoading(true)
            const { data, status } = await axios.get('/api/memories')
            if (status === 200) {
                setMemories(data.body)
                setAllMemories(data.body)
                setNormalLoading(false)
            } else {
                console.log('Error fetching memories')

            }
        }
        getAllMemories()
    }, [])
    const [totalPages, setTotalPages] = useState<number>(0)
    let filteredMemories: any[] = []

    const filterMemories = () => {
        if (memories != null && memories.length > 0 && memories !== undefined) {
            // console.log(typeof memories)
            filteredMemories = memories
                .filter(memory => activeType === 'All' || memory.type === activeType.toLowerCase())
                .filter(memory => memory.title.toLowerCase().includes(searchQuery.toLowerCase()))

            setTotalPages(Math.ceil(filteredMemories.length / itemsPerPage))
            return filterMemories
        }
    }
    // Get current page items
    const getCurrentPageItems = () => {
        filterMemories()
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredMemories?.slice(startIndex, endIndex)
    }

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const navigateTypes = (direction: number) => {
        const currentIndex = memoryTypes.indexOf(activeType)
        const newIndex = (currentIndex + direction + memoryTypes.length) % memoryTypes.length
        setActiveType(memoryTypes[newIndex])
        const container = scrollContainerRef.current
        if (container) {
            container.scrollBy({ left: direction * 90, behavior: 'smooth' })
        }
    }

    const getAiSearchResults = async () => {
        setAiLoading(true)
        const { data, status } = await axios.post('/api/memories', {
            query: aiSearchQuery,
        })
        if (status === 200) {
            setMemories(data.body)
            setAiMemories(data.body)
        }
        setAiLoading(false)
    }
    return (
        <div className="h-screen text-white p-4">
            {/* <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                        <Book className="mr-3 text-purple-400" size={28} />
                        Your Memories
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-xl p-1.5 relative">
                            <ChevronLeft
                                className="cursor-pointer text-gray-400 hover:text-purple-400 transition-colors absolute left-2 z-10"
                                onClick={() => navigateTypes(-1)}
                            />
                            <div
                                ref={scrollContainerRef}
                                className="overflow-x-auto flex space-x-2 px-8 scrollbar-none"
                            >
                                {memoryTypes.map(type => (
                                    <button
                                        key={type}
                                        className={`
                                        flex-shrink-0 px-4 py-1.5 rounded-lg transition-all duration-200
                                        text-sm font-medium
                                        ${type === activeType
                                                ? 'bg-purple-500/20 text-purple-200 shadow-purple-500/20 shadow-sm'
                                                : 'bg-white/10 hover:bg-white/15 text-gray-200'
                                            }
                                    `}
                                        onClick={() => setActiveType(type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <ChevronRight
                                className="cursor-pointer text-gray-400 hover:text-purple-400 transition-colors absolute right-2 z-10"
                                onClick={() => navigateTypes(1)}
                            />
                        </div>
                    </div>

                    <div className="relative lg:w-72">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search memories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 
                                 rounded-xl py-2.5 pl-10 pr-4 
                                 focus:outline-none focus:ring-2 focus:ring-purple-500/40 
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
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                Regular search
                            </TabsTrigger>
                            <TabsTrigger
                                value="ai"
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                AI search
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div> */}
            <MemoryHeader
                activeType={activeType}
                setActiveType={setActiveType}
                memoryTypes={memoryTypes}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                aiMemories={aiMemories}
                allMemories={allMemories}
                setMemories={setMemories}
            />
            {/* Scrollable Content */}
            {
                memories && memories.length === 0 && (
                    <MemoryEmptyState />
                )
            }
            <div className="flex-1 overflow-hidden">
                <div className="h-3/4">
                    <div className="">
                        <Tabs value={activeTab}>
                            <TabsContent value="ai">
                                <div className="flex p-2 pb-4 flex-row w-full min-w-3/4 lg:w-3/4 mx-auto items-center space-x-2">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Let MindKeeper AI find memories for you..."
                                            value={aiSearchQuery}
                                            onChange={(e) => setAiSearchQuery(e.target.value)}
                                            className="w-full bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
                                    </div>
                                    <button onClick={getAiSearchResults} className="z-50 bg-purple-500 text-white p-2 rounded-lg focus:outline-none" onKeyDown={(e) => {
                                        if (e.ctrlKey && e.key === 'Enter') {
                                            getAiSearchResults();
                                        }
                                    }}>
                                        <Send size={18} />
                                    </button>
                                </div>

                                {
                                    !aiLoading && <MemoryGrid
                                        currentPage={currentPage}
                                        getCurrentPageItems={getCurrentPageItems}
                                        handlePageChange={handlePageChange}
                                        selectedMemoryId={selectedMemoryId}
                                        setSelectedMemoryId={setSelectedMemoryId}
                                        totalPages={totalPages}
                                    />
                                }
                                {
                                    aiLoading && (
                                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                            <MemorySkeleton />
                                            <MemorySkeleton />
                                            <MemorySkeleton />
                                            <MemorySkeleton />
                                        </div>
                                    )
                                }

                            </TabsContent>
                            <TabsContent value='regular'>
                                {
                                    !normalLoading && <MemoryGrid
                                        currentPage={currentPage}
                                        getCurrentPageItems={getCurrentPageItems}
                                        handlePageChange={handlePageChange}
                                        selectedMemoryId={selectedMemoryId}
                                        setSelectedMemoryId={setSelectedMemoryId}
                                        totalPages={totalPages}
                                    />
                                }
                                {
                                    normalLoading && (
                                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                            <MemorySkeleton />
                                            <MemorySkeleton />
                                            <MemorySkeleton />
                                            <MemorySkeleton />
                                        </div>
                                    )
                                }
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}



const MemoryGrid = ({
    getCurrentPageItems,
    selectedMemoryId,
    setSelectedMemoryId,
    currentPage,
    handlePageChange,
    totalPages
}: {
    getCurrentPageItems: () => any[] | undefined;
    selectedMemoryId: string | null;
    setSelectedMemoryId: (id: string | null) => void;
    currentPage: number;
    handlePageChange: (newPage: number) => void;
    totalPages: number;
}) => {
    const items = getCurrentPageItems();
    return (
        <div className="relative min-h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto mb-16">
                {
                    items?.length === 0 && (
                        <AiSearchEmptyState />
                    )
                }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                    {items?.map(memory => (
                        <MemoryCard
                            key={memory.id}
                            memory={memory}
                            selectedMemoryId={selectedMemoryId}
                            setSelectedMemoryId={setSelectedMemoryId}
                        />
                    ))}
                </div>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};



const Pagination = ({
    currentPage,
    totalPages,
    onPageChange
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void
}) => {
    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = [];
        pages.push(1);
        if (currentPage <= 3) {
            pages.push(2, 3, 4, 'ellipsis', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
        }
        return pages;
    };

    return (
        <div className="absolute bottom-1 left-0 right-0 backdrop-blur-sm border-t border-slate-800">
            <div className="flex justify-center items-center space-x-1.5 p-4">
                <Button
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600"
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {getVisiblePages().map((page, index) => (
                    page === 'ellipsis' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="text-slate-400 px-2 select-none"
                        >
                            •••
                        </span>
                    ) : (
                        <Button
                            key={page}
                            className={
                                currentPage === page
                                    ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-400'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                            }
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </Button>
                    )
                ))}

                <Button
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600"
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};