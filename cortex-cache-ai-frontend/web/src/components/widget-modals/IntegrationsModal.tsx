"use client";
import SecondBrainModal from "@/app/new-memory/AddMemory";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Github } from "lucide-react";
import { useState } from 'react';
import { DriveIcon, NotionIcon, YouTubeIcon } from "../conversation/CustomeIcons";

type Integration = {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
};

const integrations: Integration[] = [
    {
        id: "youtube",
        name: "YouTube",
        description: "Add any YouTube video",
        icon: <YouTubeIcon className="h-6 w-6 text-red-500" />,
    },
    {
        id: "notion",
        name: "Notion",
        description: "Import your Notion pages",
        icon: <NotionIcon className="h-6 w-6 text-slate-300" />,
    },
    {
        id: "google-drive",
        name: "Google Drive",
        description: "Add files from Google Drive",
        icon: <DriveIcon className="h-6 w-6 text-blue-400" />,
    },
    {
        id: "github",
        name: "GitHub",
        description: "Add your GitHub repositories",
        icon: <Github className="h-6 w-6 text-slate-300" />,
    }
];

interface IntegrationsInputModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const IntegrationsModal = ({ isOpen, onClose }: IntegrationsInputModalProps) => {
    const handleConnect = (id: string) => {
        if (id === "youtube") {
            onClose();
            setYoutubeModalOpen(true);
        }
        else if (id === "github") {
            onClose();
            setGithubModalOpen(true);
        } else if (id === "notion") {
            window.location.href = "https://www.mindkeeperai.com/add-page/notion"
        } else if (id === "google-drive") {
            window.location.href = "https://www.mindkeeperai.com/add-page/gdrive"
        };
    };

    const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
    const [githubModalOpen, setGithubModalOpen] = useState(false);
    return (
        <div>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-slate-100">
                            Available Integrations
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {integrations.map((integration) => (
                            <div
                                key={integration.id}
                                className="flex items-center gap-4 p-4 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/50 transition-colors"
                            >
                                <div className="flex-shrink-0">{integration.icon}</div>
                                <div className="flex-grow">
                                    <h3 className="font-medium text-slate-100">{integration.name}</h3>
                                    <p className="text-sm text-slate-400">{integration.description}</p>
                                </div>
                                <button
                                    onClick={() => handleConnect(integration.id)}
                                    className="px-3 py-1.5 bg-slate-700 text-slate-200 text-sm rounded-md hover:bg-slate-600 transition-colors"
                                >
                                    Add now
                                </button>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            <SecondBrainModal isOpen={youtubeModalOpen} onClose={() => setYoutubeModalOpen(false)} defaultTab="youtube" />
            <SecondBrainModal isOpen={githubModalOpen} onClose={() => setGithubModalOpen(false)} defaultTab="git" />

        </div>
    );
};

export default IntegrationsModal;