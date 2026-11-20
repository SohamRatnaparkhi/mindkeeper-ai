"use client"

import SecondBrainModal from '@/app/new-memory/AddMemory'
import axios from 'axios'
import { Book, ChevronLeft, ChevronRight, Network, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import MindmapCard from './MindmapCard'
import { MindmapSkeleton } from './MindmapSkeleton'

export default function MindmapShowcase() {
    const [selectedMindmapId, setSelectedMindmapId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [mindmaps, setMindmaps] = useState<any[]>()
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9 // 3x3 grid
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState<number>(0)

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        setSelectedMindmapId(null)
    }

    useEffect(() => {
        const getAllMindmaps = async () => {
            setLoading(true)
            try {
                const { data, status } = await axios.get('/api/mindmaps')
                if (status === 200) {
                    setMindmaps(data.body)
                    const totalItems = data.body.length
                    setTotalPages(Math.ceil(totalItems / itemsPerPage))
                }
            } catch (error) {
                console.error('Error fetching mindmaps:', error)
            } finally {
                setLoading(false)
            }
        }
        getAllMindmaps()
    }, [])

    const getFilteredMindmaps = () => {
        if (!mindmaps) return []

        return mindmaps.filter(mindmap =>
            mindmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mindmap.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    const getCurrentPageItems = () => {
        const filteredMindmaps = getFilteredMindmaps()
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredMindmaps.slice(startIndex, endIndex)
    }

    const EmptyState = () => (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center text-left p-8 space-y-4">
                <Network className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-semibold text-slate-200">Create Your First Mindmap</h3>
                <div className="max-w-md space-y-4 text-slate-300">
                    <p>Mindmaps help you organize and connect related memories together. Consider them as folders. Use mindmaps for targeted talks with similar memories.</p>
                    <div className="space-y-2 text-sm">
                        <p className="font-medium text-slate-200">Examples of how to use mindmaps:</p>
                        <ul className="space-y-1 text-slate-400">
                            <li>• Combine YouTube video memories about a specific topic</li>
                            <li>• Group meeting notes from recurring meetings</li>
                            <li>• Collect related web articles and documentation</li>
                            <li>• Organize project-related resources and notes</li>
                        </ul>
                    </div>
                </div>
                <Button
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                    onClick={() => setIsModalOpen(true)}
                >
                    Create a Mindmap
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="h-screen text-white p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center text-slate-200">
                    <Book className="mr-3 ml-5 text-transparent sm:text-slate-400" size={28} />
                    Your Mindmaps
                </h1>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-700/50 border border-slate-600 text-slate-200 
                             hover:bg-slate-600/50 hover:border-slate-500
                             transition-all duration-200 flex items-center gap-2"
                >
                    <Network size={18} className="text-slate-300" />
                    <span className="hidden sm:inline">Add Mindmap</span>
                </Button>
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
                <div className="relative w-full lg:w-1/3">
                    <input
                        type="text"
                        placeholder="Search mindmaps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-400 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-slate-600 border border-slate-700"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="relative min-h-[500px] flex flex-col">
                    {loading ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4'>
                            <MindmapSkeleton />
                            <MindmapSkeleton />
                            <MindmapSkeleton />
                        </div>
                    ) : mindmaps?.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto mb-16">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                                    {getCurrentPageItems().map(mindmap => (
                                        <MindmapCard
                                            key={mindmap.id}
                                            mindmap={mindmap}
                                            selectedMindmapId={selectedMindmapId}
                                            setSelectedMindmapId={setSelectedMindmapId}
                                        />
                                    ))}
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="absolute bottom-1 left-0 right-0 backdrop-blur-sm border-t border-slate-800/50">
                                    <div className="flex justify-center items-center space-x-2 p-4">
                                        <Button
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                className={currentPage === page ?
                                                    'bg-slate-700 text-slate-200' :
                                                    'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
                                                }
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <SecondBrainModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentMainTab='mindmap' />
            </div>
        </div>
    )
}