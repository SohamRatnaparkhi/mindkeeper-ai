import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Edit, MessageCircle, Network, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Mindmap {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

interface MindmapCardProps {
    mindmap: Mindmap;
    selectedMindmapId: string | null;
    setSelectedMindmapId: (id: string | null) => void;
    onDelete?: () => void;
}

const MindmapCard: React.FC<MindmapCardProps> = ({
    mindmap,
    selectedMindmapId,
    setSelectedMindmapId,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const formatDate = (dateString: string | number | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/mindmaps/${mindmap.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete mindmap ');
            }

            toast({
                title: "Success",
                description: "Mindmap deleted successfully",
                duration: 3000,
                className: "bg-green-500",
            });

            onDelete?.();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete mindmap",
                duration: 3000,
                className: "bg-red-500",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className={`
                relative
                flex flex-col 
                bg-slate-900/50 backdrop-blur-sm 
                p-4 rounded-lg 
                cursor-pointer 
                transition-all duration-200 ease-in-out
                hover:bg-slate-800/50
                ${mindmap.id === selectedMindmapId ? 'ring-1 ring-slate-400/50 bg-slate-800/50' : ''}
                group
            `}
            onClick={() => setSelectedMindmapId(mindmap.id === selectedMindmapId ? null : mindmap.id)}
        >
            {/* Loading Overlay */}
            {isDeleting && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
                    <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-200 rounded-full animate-spin"></div>
                </div>
            )}

            <div className='flex-none space-y-2'>
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors duration-200">
                        <span className="bg-gradient-to-r from-slate-200 to-white bg-clip-text text-transparent group-hover:from-slate-100 group-hover:to-white transition-all duration-300">
                            {mindmap.title}
                        </span>
                    </h3>
                </div>
            </div>

            <div className="grow my-2.5">
                <p className="text-slate-300 text-sm leading-relaxed">
                    {mindmap.id === selectedMindmapId
                        ? mindmap.description
                        : mindmap.description.length > 150
                            ? `${mindmap.description.substring(0, 150)}...`
                            : mindmap.description}
                </p>
            </div>

            <div className="flex-none mt-1">
                <div className="flex items-center justify-between">
                    <div>
                        <Network size={18} className="text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar size={14} className="text-blue-400" />
                            <span>{formatDate(mindmap.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/mindmaps/chat/${mindmap.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="pointer-events-auto"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center text-xs gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200"
                                >
                                    <MessageCircle size={14} />
                                    <span className="hidden sm:inline">Chat</span>
                                </Button>
                            </Link>
                            <Link
                                href={`/mindmaps/mutate/${mindmap.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                            >
                                <Edit size={14} />
                            </Link>

                            <AlertDialog>
                                <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border border-slate-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-slate-200">Delete Mindmap</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                            Are you sure you want to delete "{mindmap.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel
                                            className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete();
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MindmapCard;