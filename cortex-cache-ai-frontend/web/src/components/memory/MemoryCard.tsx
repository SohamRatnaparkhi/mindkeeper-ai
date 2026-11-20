import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Calendar, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getSourceIcon, SourceType } from './MemoryHeader';

interface Memory {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    type: string
}

interface MemoryCardProps {
    memory: Memory;
    selectedMemoryId: string | null;
    setSelectedMemoryId: (id: string | null) => void;
    onDelete?: (memoryId: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
    memory,
    selectedMemoryId,
    setSelectedMemoryId,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toast } = useToast();

    const formatDate = (dateString: string | number | Date) => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }) + `, '${year}`; // Format like "Jan 1, '25"
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const sourceIcon = getSourceIcon(memory.type.toLowerCase() as unknown as SourceType);
    const Icon = sourceIcon.icon;

    const deleteMemory = async () => {
        try {
            setIsDeleting(true);
            const { status } = await axios.delete(`/api/memories/${memory.id}`);

            if (status === 200) {
                toast({
                    title: "Memory deleted",
                    description: "The memory has been successfully deleted.",
                    variant: "default",
                    className: "bg-green-500"
                });

                window.location.reload();
                // Wait for animation to complete before calling onDelete
                setTimeout(() => {
                    setSelectedMemoryId(null);
                    onDelete?.(memory.id);
                }, 5000);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: "Error",
                description: "Failed to delete memory. Please try again.",
                variant: "destructive",
                className: "bg-red-500"
            });
            setIsDeleting(false);
        } finally {
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <div
                className={`
                    flex flex-col 
                    bg-white/5 backdrop-blur-sm 
                    p-4 rounded-lg 
                    cursor-pointer 
                    transition-all duration-200 ease-in-out
                    hover:bg-white/10
                    ${memory.id === selectedMemoryId ? 'ring-1 ring-purple-500/50 bg-white/10' : ''}
                    ${isDeleting ? 'relative opacity-50 pointer-events-none animate-pulse' : ''}
                    ${isDeleting ? 'after:absolute after:inset-0 after:bg-purple-500/10 after:animate-pulse after:rounded-lg' : ''}
                    group
                `}
                onClick={() => !isDeleting && setSelectedMemoryId(memory.id === selectedMemoryId ? null : memory.id)}
            >
                <div className='flex-none space-y-2'>
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium text-white/90 group-hover:text-white transition-colors duration-200">
                            <span className="bg-gradient-to-r from-white/90 to-white bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-white transition-all duration-300">
                                {memory.title} {memory.type}
                            </span>
                        </h3>
                    </div>
                </div>

                <div className="grow my-2.5">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {memory.id === selectedMemoryId
                            ? memory.description
                            : memory.description.length > 150
                                ? `${memory.description.substring(0, 150)}...`
                                : memory.description}
                    </p>
                </div>

                <div className="flex-none mt-1">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <Icon className={sourceIcon.className} />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar size={14} className="text-blue-400" />
                                <span>{formatDate(memory.createdAt)}</span>
                            </div>
                            <Link
                                href={`/memories/chat/${memory.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className={isDeleting ? 'pointer-events-none' : ''}
                            >
                                <Button
                                    variant="secondary"
                                    className="flex items-center text-xs gap-2 hover:bg-purple-500/20 transition-colors duration-200"
                                    disabled={isDeleting}
                                >
                                    <MessageCircle size={16} />
                                    Chat
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                className="text-sm hover:bg-white/10 hover:text-white transition-colors duration-200"
                            >
                                <Trash2 className="text-red-400" size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-slate-900 border border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-200">Delete Memory</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete &quot;{memory.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteMemory}
                            disabled={isDeleting}
                            className="bg-red-900 hover:bg-red-800"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default MemoryCard;