import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Brain, Globe, MousePointer, Power, Repeat, Settings2, Sparkles } from "lucide-react";
import Link from "next/link";
import CustomScrollArea from "../ui/CustomScrollArea";

interface HelpModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}
interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    hasLink?: boolean;
    showClickHint?: boolean;
}

const PromptHelpModal = ({ isOpen, setIsOpen }: HelpModalProps) => {

    const FeatureCard = ({
        title,
        description,
        icon,
        hasLink = false,
        showClickHint = false
    }: FeatureCardProps) => (
        <div className="group relative flex items-start justify-between p-3 rounded-md hover:bg-slate-600/20 transition-colors">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-100">{title}</h4>
                    {showClickHint && (
                        <div className="hidden group-hover:flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                                <MousePointer className="h-3 w-3" />
                                <span>Find and click</span>
                            </div>
                            <div className="flex items-center text-purple-300">
                                <span className="font-medium">{title}</span>
                            </div>
                            <span className="text-slate-400">in top bar</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-300">
                    {hasLink ? (
                        <>
                            Uses your <Link href="/memories" className="font-medium underline decoration-slate-400 underline-offset-2 hover:text-slate-100 transition-colors">memories</Link> for responses
                        </>
                    ) : description}
                </p>
                {/* Visual hint for prompt section */}
                <div className="hidden group-hover:block mt-2 px-2 py-1.5 bg-slate-700/30 rounded text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span>Looks like:</span>
                        <div className="px-2 py-0.5 bg-slate-800/60 rounded flex items-center gap-1">
                            {icon && <div className="opacity-75 scale-75">{icon}</div>}
                            {!icon && <span>{title}</span>}
                        </div>
                        <span>in the top bar</span>
                    </div>
                </div>
            </div>
            {icon && (
                <div className="flex-shrink-0 ml-4 group-hover:animate-bounce">
                    {icon}
                </div>
            )}
        </div>
    );
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-slate-800 max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Quick Guide</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                    <CustomScrollArea className="h-[calc(80vh-80px)]">
                        <div className="space-y-4 pr-4">
                            {/* Core Features */}
                            <section className="p-4 bg-slate-700/50 rounded-lg space-y-2">
                                <div className="flex flex-col gap-2 mb-4 p-3 bg-slate-800/40 rounded-md text-sm">
                                    <div className="flex items-center gap-2 text-slate-200">
                                        <Power className="h-4 w-4 text-purple-400 animate-pulse" />
                                        <span className="font-medium">How to use modes:</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-300 ml-6">
                                        <span className="flex items-center gap-2">
                                            1. Select modes below before entering your prompt
                                            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-300 ml-6">
                                        <span className="items-center gap-2">
                                            2. To change modes mid-conversation, select mode and click
                                            <span className="inline-flex items-center justify-center p-1 bg-slate-700/50 rounded">
                                                <Repeat className="h-3 w-3 mx-1" />
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <FeatureCard
                                    title="Pro Mode"
                                    description="Advanced AI features & detailed responses"
                                    showClickHint={true}
                                />

                                <div className="h-px bg-slate-600/50 my-2" />

                                <FeatureCard
                                    title="Memory"
                                    description=""
                                    icon={<Brain className="h-5 w-5 text-slate-300" />}
                                    hasLink={true}
                                    showClickHint={true}
                                />

                                <div className="h-px bg-slate-600/50 my-2" />

                                <FeatureCard
                                    title="Web Search"
                                    description="Real-time internet information"
                                    icon={<Globe className="h-5 w-5 text-slate-300" />}
                                    showClickHint={true}
                                />

                                <div className="mt-4 px-3">
                                    <p className="text-xs text-slate-400 italic">
                                        Note: You can use the Memory mode and Web Search mode together.
                                    </p>
                                </div>
                            </section>

                            {/* Web Sources */}
                            <section className="p-3 bg-slate-700/50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Globe className="h-4 w-4" />
                                    <span className="font-medium">Sources (Max 3)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-slate-600">🔍 Web</Badge>
                                    <Badge className="bg-slate-600">📺 YouTube</Badge>
                                    <Badge className="bg-slate-600">🤖 Reddit</Badge>
                                    <Badge className="bg-slate-600">💻 GitHub</Badge>
                                    <Badge className="bg-slate-600">📚 arXiv</Badge>
                                    <Badge className="bg-slate-600">🖼️ Images</Badge>
                                </div>
                            </section>

                            {/* Agents */}
                            <section className="p-3 bg-slate-700/50 rounded-lg">
                                <h4 className="font-medium mb-2">Available Assistants</h4>
                                <div className="text-sm text-slate-300 space-y-1.5">
                                    <p>• Default Agent - General tasks</p>
                                    <p>• Code Assistant - Development help</p>
                                    <p>• Social Media - LinkedIn, X, Facebook, Instagram</p>
                                    <p>• Blogger - Content creation</p>
                                </div>
                            </section>

                            {/* Controls & Shortcuts */}
                            <section className="p-3 bg-slate-700/50 rounded-lg space-y-3">
                                <h4 className="font-medium">Controls & Shortcuts</h4>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex items-center space-x-3 p-1.5">
                                        <Settings2 className="h-4 w-4" />
                                        <span className="text-slate-300">Sources menu (mobile only)</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-1.5">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-slate-300">Manage web sources</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-1.5">
                                        <Sparkles className="h-4 w-4 text-green-500" />
                                        <span className="text-slate-300">Select AI model & agent</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-1.5">
                                        <kbd className="px-2 py-1 bg-slate-600 rounded text-xs">Shift + Enter</kbd>
                                        <span className="text-slate-300">New line</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-1.5">
                                        <kbd className="px-2 py-1 bg-slate-600 rounded text-xs">Enter or Ctrl + Enter</kbd>
                                        <span className="text-slate-300">Submit message</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </CustomScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PromptHelpModal;