import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileAudio, Globe, Image, Notebook } from 'lucide-react';

import { DriveIcon, NotionIcon, YouTubeIcon } from '../conversation/CustomeIcons';

interface MemoryTypeCardProps {
    icon: any;
    title: string;
    description: string;
}

const MemoryTypeCard: React.FC<MemoryTypeCardProps> = ({ icon: Icon, title, description }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
        <Icon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
            <h4 className="font-medium text-slate-200">{title}</h4>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    </div>
);

export default function MemoryEmptyState() {
    return (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
                <div className="relative">
                    <Notebook className="h-16 w-16 text-slate-400" />
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-blue-500 animate-ping" />
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-blue-500" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-slate-200">Start Your Digital Memory Bank</h3>
                    <p className="text-slate-400 max-w-md">
                        Think of memories as your personal knowledge vault. Add anything you want to remember, reference, or revisit later.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    <MemoryTypeCard
                        icon={YouTubeIcon}
                        title="YouTube Videos"
                        description="Save videos from your watch later list, tutorials, or interesting content"
                    />

                    <MemoryTypeCard
                        icon={Globe}
                        title="Web Content"
                        description="Bookmark blog posts, documentation, articles, or any web pages"
                    />

                    <MemoryTypeCard
                        icon={NotionIcon}
                        title="Notion Workspace"
                        description="Connect and sync your Notion pages, docs, and workspaces"
                    />

                    <MemoryTypeCard
                        icon={DriveIcon}
                        title="Google Drive"
                        description="Import presentations, spreadsheets, or any important documents"
                    />

                    <MemoryTypeCard
                        icon={FileAudio}
                        title="Audio Content"
                        description="Store podcasts, voice notes, or audio bookmarks"
                    />

                    <MemoryTypeCard
                        icon={Image}
                        title="Visuals"
                        description="Save images, screenshots, diagrams, or visual references"
                    />
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 max-w-2xl w-full border border-slate-700">
                    <h4 className="font-medium text-slate-200 mb-2">Pro Tips:</h4>
                    <ul className="text-sm text-slate-400 space-y-2 text-left">
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>Regularly sync with MindKeeper to keep your knowledge base up to date</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>Ask for insights like spending analysis from your finance sheets</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>Group related memories into mindmaps for better organization</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>Use it as your second brain for anything you want to remember or analyze later</span>
                        </li>
                    </ul>
                </div>

                <div className="flex gap-4">
                    <Button
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                        size="lg"
                        onClick={() => window.location.href = '/memories/create'}
                    >
                        Add Your First Memory
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}