"use client"


import SecondBrainModal from '@/app/new-memory/AddMemory';
import { User } from '@prisma/client';
import {
    BookOpen,
    Cable,
    FileText,
    Globe2,
    History,
    Mic,
    Network,
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import IntegrationsModal from '../widget-modals/IntegrationsModal';
import VoiceInputModal from '../widget-modals/VoiceInputModal';

const MemoryWidget = ({ currentUser }: {
    currentUser: User
}) => {
    const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [isWebModalOpen, setIsWebModalOpen] = useState(false);
    const [isIntegrationModalOpen, setIsIntegrationsModalOpen] = useState(false);
    const router = useRouter();

    const handleSave = (content: string) => {
        console.log('Saved content:', content);
        // Handle the saved content
    };
    return (
        <div className="w-full max-w-5xl mx-auto mt-4 bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="mb-3 text-sm font-medium text-slate-300">
                <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Memory From:
                </span>
            </div>
            {/* Icons Row */}
            <div className="grid grid-cols-4 gap-2 mb-4 px-2">
                <button onClick={() => setIsAudioModalOpen(true)} className="group flex flex-col items-center justify-center transition-colors hover:text-purple-400">
                    <Mic className="w-5 h-5 mb-1" />
                    <span className="text-xs opacity-70 group-hover:opacity-100">Note</span>
                </button>

                <button onClick={() => {
                    setIsFilesModalOpen(true);
                }} className="group flex flex-col items-center justify-center transition-colors hover:text-purple-400">
                    <FileText className="w-5 h-5 mb-1" />
                    <span className="text-xs opacity-70 group-hover:opacity-100">Files</span>
                </button>

                <button onClick={() => {
                    setIsWebModalOpen(true);
                }} className="group flex flex-col items-center justify-center transition-colors hover:text-purple-400">
                    <Globe2 className="w-5 h-5 mb-1" />
                    <span className="text-xs opacity-70 group-hover:opacity-100">Web</span>
                </button>

                <button onClick={() => setIsIntegrationsModalOpen(true)} className="group flex flex-col items-center justify-center transition-colors hover:text-purple-400">
                    <Cable className="w-5 h-5 mb-1" />
                    <span className="text-xs opacity-70 group-hover:opacity-100">Addons</span>
                </button>
            </div>
            <div className="relative w-full mb-3">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800 px-2 text-gray-400">Or View</span>
                </div>
            </div>
            {/* Buttons Row for larger devices */}
            <div className="hidden sm:flex gap-4 px-2">
                <button onClick={() => router.push('/memories')} className="flex flex-1 items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-md text-sm transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span>Memories</span>
                </button>
                <button onClick={() => router.push('/mindmaps')} className="flex flex-1 items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-md text-sm transition-colors">
                    <Network className="w-4 h-4" />
                    <span>Mindmaps</span>
                </button>

                <button onClick={() => router.push('/conversations')} className="flex flex-1 items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-md text-sm transition-colors">
                    <History className="w-4 h-4" />
                    <span>Chats</span>
                </button>
            </div>
            {/* Buttons Row for smaller devices */}
            <div className="flex sm:hidden gap-2 px-2">
                <button onClick={() => router.push('/memories')} className="flex-1 group py-2 rounded-md flex flex-col items-center justify-center bg-slate-700/50 hover:bg-slate-700 transition-colors hover:text-purple-400">
                    <BookOpen className="w-4 h-4 mb-1" />
                    <span className="text-xs">Memories</span>
                </button>
                <button onClick={() => router.push('/mindmaps')} className="flex-1 group py-2 rounded-md flex flex-col items-center justify-center bg-slate-700/50 hover:bg-slate-700 transition-colors hover:text-purple-400">
                    <Network className="w-4 h-4 mb-1" />
                    <span className="text-xs">Mindmaps</span>
                </button>
                <button onClick={() => router.push('/conversations')} className="flex-1 group py-2 rounded-md flex flex-col items-center justify-center bg-slate-700/50 hover:bg-slate-700 transition-colors hover:text-purple-400">
                    <History className="w-4 h-4 mb-1" />
                    <span className="text-xs">Chats</span>
                </button>
            </div>
            <VoiceInputModal
                currentUser={currentUser}
                isOpen={isAudioModalOpen}
                onClose={() => setIsAudioModalOpen(false)}
                onSave={handleSave}
            />
            <SecondBrainModal
                isOpen={isFilesModalOpen}
                onClose={() => setIsFilesModalOpen(false)}
                defaultTab='media'
            />
            <SecondBrainModal
                isOpen={isWebModalOpen}
                onClose={() => setIsWebModalOpen(false)}
                defaultTab='article'
            />
            <IntegrationsModal
                isOpen={isIntegrationModalOpen}
                onClose={() => setIsIntegrationsModalOpen(false)}
            />
        </div>
    );
};

export default MemoryWidget;