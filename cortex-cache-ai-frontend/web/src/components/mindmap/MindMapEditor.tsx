import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CustomScrollArea from "../ui/CustomScrollArea";

// Loading Skeleton Component
const Skeleton = ({ className }: {
    className: string;
}) => (
    <div className={cn("animate-pulse rounded-md bg-slate-800", className)} />
);

const MemorySkeleton = () => (
    <div className="flex items-center space-x-3 px-4 py-3">
        <Skeleton className="h-4 w-4" />
        <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
        </div>
    </div>
);

interface MindMap {
    id: string;
    title: string;
    description: string;
}

export default function MindMapEditor({ mindmapId }: { mindmapId: string }) {
    const router = useRouter();
    const [mindmap, setMindmap] = useState<MindMap>({ id: '', title: '', description: '' });
    const [memories, setMemories] = useState<Record<string, any>>({});
    const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Record<string, boolean>>({});

    const { toast } = useToast();

    useEffect(() => {
        if (mindmapId !== undefined) {
            fetchMindMap(mindmapId);
        }
        fetchMemories();
    }, [mindmapId]);

    const fetchMindMap = async (id: string) => {
        try {
            const response = await fetch(`/api/mindmaps/${id}`);
            const data = await response.json();
            if (response.ok) {
                setMindmap(data.body);
                setSelectedMemories(data.body.Memory.map((m: any) => m.memId));
            }
        } catch (error) {
            console.error('Error fetching mindmap:', error);
            // toast({
            //     variant: "destructive",
            //     title: "Error",
            //     description: "Failed to load mindmap",
            //     duration: 3000,
            // });
        }
    };

    const fetchMemories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/memories');
            if (response.ok) {
                const data = await response.json();
                setMemories(data.body);

                // Set initial filters based on memory types
                const memoryTypes = Array.from(new Set(Object.values(data.body).map((m: any) => m.mem_type)));
                setFilters(Object.fromEntries(memoryTypes.map(type => [type, false])));
            }
        } catch (error) {
            console.error('Error fetching memories:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load memories",
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMemories.length < 2) {
            toast({
                variant: "destructive",
                title: "Selection Required",
                description: "Please select at least 2 memories to create a mindmap.",
                duration: 3000,
            });
            return;
        }

        try {
            setSaving(true);
            const response = await fetch('/api/mindmaps/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...mindmap, memories: selectedMemories, id: mindmapId }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Your mindmap has been saved successfully.",
                    duration: 3000,
                });
                router.push('/mindmaps/');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save mindmap",
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    const filteredMemories = Object.entries(memories).filter(([_, memory]) => {
        const matchesSearch =
            memory.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            memory.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            Object.values(filters).every(v => v === false) || filters[memory.mem_type];
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="container mx-auto space-y-6 max-w-4xl">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>{mindmap.id ? 'Edit MindMap' : 'Create New MindMap'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Title"
                            name="title"
                            value={mindmap.title}
                            onChange={(e) => setMindmap(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-slate-800 border-slate-700"
                            required
                            disabled={saving}
                        />
                        <Textarea
                            placeholder="Description"
                            name="description"
                            value={mindmap.description}
                            onChange={(e) => setMindmap(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-slate-800 border-slate-700"
                            disabled={saving}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-slate-700 hover:bg-slate-600"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Mindmap'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>Select Memories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search memories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <CustomScrollArea className="h-[calc(100vh-32rem)] min-h-[400px] max-h-[600px]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <MemorySkeleton key={i} />
                                ))
                            ) : filteredMemories.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">
                                    No memories found
                                </div>
                            ) : (
                                filteredMemories.map(([memId, memory]) => (
                                    <div
                                        key={memId}
                                        className={cn(
                                            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                            "hover:bg-slate-800",
                                            selectedMemories.includes(memory.id) && "bg-slate-800"
                                        )}
                                    >
                                        <Checkbox
                                            id={memory.id}
                                            checked={selectedMemories.includes(memory.id)}
                                            onCheckedChange={() => setSelectedMemories(prev =>
                                                prev.includes(memory.id)
                                                    ? prev.filter(id => id !== memory.id)
                                                    : [...prev, memory.id]
                                            )}
                                            className="border-slate-600"
                                        />
                                        <Label htmlFor={memory.id} className="flex-grow cursor-pointer">
                                            <div className="font-medium text-slate-200">
                                                {memory.title}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                {memory.mem_type}
                                            </div>
                                        </Label>
                                    </div>
                                ))
                            )}
                        </CustomScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}