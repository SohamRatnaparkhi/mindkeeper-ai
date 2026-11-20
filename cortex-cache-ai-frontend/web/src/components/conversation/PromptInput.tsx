"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Brain, ChevronDown, Globe, HelpCircle, Settings2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PromptHelpModal from "../memory/PromptHelpModal";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import AgentLLMSelector from "./AgentsLLMSelected";


interface WebSource {
    id: string;
    name: string;
    icon?: string;
}

interface PromptInputProps {
    showShortcuts: boolean;
    isProMode: boolean;
    setIsProMode: (value: boolean) => void;
    useMemory: boolean;
    setUseMemory: (value: boolean) => void;
    useWeb: boolean;
    setUseWeb: (value: boolean) => void;
    selectedWebSources: string[];
    setSelectedWebSources: React.Dispatch<React.SetStateAction<string[]>>;
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
    getSelectedAgentLabel: () => string;
    getSelectedLLMLabel: () => string;
    agents: any[];
    llms: any[];
    setSelectedAgent: (agent: any) => void;
    setSelectedLLM: (llm: any) => void;
    inputValue: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent, repeatQueryId?: string) => Promise<void>;
    isStreaming: boolean;
}

const WEB_SOURCES: WebSource[] = [
    { id: 'web', name: 'Full Web Search', icon: '🔍' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'reddit', name: 'Reddit', icon: '🤖' },
    { id: 'github', name: 'GitHub', icon: '💻' },
    { id: 'arxiv', name: 'arXiv', icon: '📚' },
    { id: 'images', name: 'Images', icon: '🖼️' },
];

export function PromptInput({
    showShortcuts,
    isProMode,
    setIsProMode,
    useMemory,
    setUseMemory,
    useWeb,
    setUseWeb,
    selectedWebSources,
    setSelectedWebSources,
    isDialogOpen,
    setIsDialogOpen,
    getSelectedAgentLabel,
    getSelectedLLMLabel,
    agents,
    llms,
    setSelectedAgent,
    setSelectedLLM,
    inputValue,
    handleInputChange,
    handleKeyDown,
    handleSubmit,
    isStreaming
}: PromptInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isWebSourcesOpen, setIsWebSourcesOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const handleWebSourceToggle = (sourceId: string) => {
        setSelectedWebSources((prev: string[]) => {
            if (sourceId === 'web') return ['web'];
            const newSources = prev.filter(id => id !== 'web');
            if (newSources.includes(sourceId)) {
                const filteredSources = newSources.filter(id => id !== sourceId);
                return filteredSources.length === 0 ? ['web'] : filteredSources;
            }
            const updatedSources = [...newSources, sourceId];
            if (updatedSources.length > 3) updatedSources.shift();
            return updatedSources;
        });
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 350); // Max height of 400px
            textarea.style.height = `${Math.max(10, newHeight)}px`; // Minimum height of 80px
        }
    }, [inputValue]);

    const handleKeyDownModified = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Allow new line
                return;
            } else {
                // Submit on plain Enter
                e.preventDefault();
                handleSubmit(e);
            }
        }
        // Call original handler for other keys
        // handleKeyDown(e);
    };

    const removeWebSource = (sourceId: string) => {
        setSelectedWebSources((prev: string[]) => {
            const newSources = prev.filter(id => id !== sourceId);
            return newSources.length === 0 ? ['web'] : newSources;
        });
    };

    const getSourceDetails = (sourceId: string): WebSource | undefined => {
        return WEB_SOURCES.find(source => source.id === sourceId);
    };

    return (
        <div className="w-full max-w-5xl mx-auto z-40">
            <div className="relative">
                <div className="bg-white bg-opacity-10 backdrop-blur-3xl border border-gray-600 rounded-md shadow-sm">
                    {/* Main Controls - Desktop */}
                    <div className="hidden md:flex items-center px-3 py-1 justify-between">
                        <div className="flex items-center gap-3">
                            <ModeToggle
                                label="Pro"
                                checked={isProMode}
                                onChange={setIsProMode}
                            />
                            <ModeToggle
                                label="Memory"
                                checked={useMemory}
                                onChange={setUseMemory}
                            />
                            <ModeToggle
                                label="Web"
                                checked={useWeb}
                                onChange={(checked: boolean) => {
                                    setUseWeb(checked);
                                    if (checked && selectedWebSources.length === 0) {
                                        setSelectedWebSources(['web']);
                                    } else {
                                        setSelectedWebSources([]);
                                    }
                                }}
                            />
                            <div className="flex items-center space-x-2">
                                {useWeb && (
                                    <WebSourcesPopover
                                        isOpen={isWebSourcesOpen}
                                        setIsOpen={setIsWebSourcesOpen}
                                        selectedSources={selectedWebSources}
                                        onSourceToggle={handleWebSourceToggle}
                                    />
                                )}
                                {/* {showShortcuts && (
                                    <div className="bg-inherit px-4">
                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                            {useWeb && selectedWebSources.length > 0 && (
                                                <div className="flex flex-col flex-wrap gap-2">
                                                    {selectedWebSources.map(sourceId => {
                                                        const source = getSourceDetails(sourceId);
                                                        return source && (
                                                            <Badge
                                                                key={sourceId}
                                                                variant="secondary"
                                                                className="px-2 py-1 bg-slate-700 text-white"
                                                            >
                                                                {source.icon}
                                                                <button
                                                                    onClick={() => removeWebSource(sourceId)}
                                                                    className="ml-2 hover:text-red-500 transition-colors"
                                                                    disabled={selectedWebSources.length === 1}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <span className="flex gap-2 text-sm text-muted-foreground">
                                            <Sparkles className="h-4 w-4 text-green-500" />
                                            {getSelectedAgentLabel()} / {getSelectedLLMLabel()}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Choose Agent and LLM</DialogTitle>
                                    </DialogHeader>
                                    <div className="custom-scrollbar-horizontal h-fit max-h-[calc(100vh-12rem)] overflow-auto">
                                        <AgentLLMSelector
                                            agents={agents}
                                            llms={llms}
                                            setSelectedAgent={setSelectedAgent}
                                            setSelectedLLM={setSelectedLLM}
                                            setIsDialogOpen={setIsDialogOpen}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={() => setIsHelpOpen(!isHelpOpen)} variant="ghost" size="sm" className="h-8">
                                <span>
                                    <HelpCircle className="h-4 w-4 text-yellow-400" />
                                </span>
                            </Button>
                        </div>

                    </div>

                    {/* Mobile Settings Button */}
                    <div className="md:hidden flex items-center justify-between px-3 pt-1">
                        <div className="flex items-center justify-between w-full ">

                            <ModeToggle
                                label="Pro"
                                checked={isProMode}
                                onChange={setIsProMode}
                            />

                            <ModeToggle
                                icon={<Brain className="h-4 w-4" />}
                                checked={useMemory}
                                onChange={setUseMemory}
                            />

                            <ModeToggle
                                icon={<Globe className="h-4 w-4" />}
                                checked={useWeb}
                                onChange={setUseWeb}
                                color="blue"
                                onCustomClick={() => {
                                    setUseWeb(!useWeb);
                                    if (!useWeb && selectedWebSources.length === 0) {
                                        setSelectedWebSources(['web']);
                                    }
                                }}
                            />
                            {useWeb && (
                                <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 px-2">
                                            <Settings2 className="h-4 w-4" />
                                        </Button>

                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3 bg-slate-700">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium mb-2">Web Sources</div>
                                            <div className="space-y-2">
                                                {WEB_SOURCES.map((source) => (
                                                    <div key={source.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`source-${source.id}-mobile`}
                                                            checked={selectedWebSources.includes(source.id)}
                                                            onCheckedChange={() => handleWebSourceToggle(source.id)}
                                                            disabled={
                                                                !selectedWebSources.includes(source.id) &&
                                                                selectedWebSources.length >= 3 &&
                                                                source.id !== 'web'
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`source-${source.id}-mobile`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {source.icon} {source.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                            <div className="flex items-center space-x-1">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <ModeToggle
                                            icon={<Sparkles className="h-4 w-4 text-green-500" />}
                                            checked={isDialogOpen}
                                            onChange={setIsDialogOpen}
                                            color="blue"
                                        />
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-800 sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Choose Agent and LLM</DialogTitle>
                                        </DialogHeader>
                                        <div className="custom-scrollbar-horizontal h-fit max-h-[calc(100vh-12rem)] overflow-auto">
                                            <AgentLLMSelector
                                                agents={agents}
                                                llms={llms}
                                                setSelectedAgent={setSelectedAgent}
                                                setSelectedLLM={setSelectedLLM}
                                                setIsDialogOpen={setIsDialogOpen}
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Button
                                onClick={() => setIsHelpOpen(true)}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                            >
                                <HelpCircle className="h-4 w-4 text-yellow-400" />
                            </Button>
                        </div>

                    </div>
                    <PromptHelpModal isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />

                    {/* Input Area */}
                    <div className="relative flex items-end">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDownModified}
                            placeholder="Ask anything..."
                            className="w-full resize-none bg-transparent px-4 py-2 pr-12 focus:outline-none text-sm"
                            style={{
                                minHeight: '44px',
                            }}
                        />
                        <div className="absolute right-2 bottom-2">
                            <Button
                                size="icon"
                                type="submit"
                                onClick={handleSubmit}
                                className={`${isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
                                    } transition-colors duration-200 h-8 w-8 rounded-md flex items-center justify-center`}
                            >
                                {isStreaming ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


interface WebSource {
    id: string;
    name: string;
    icon?: string;
}

interface WebSourcesPopoverProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedSources: string[];
    onSourceToggle: (sourceId: string) => void;
}

export function WebSourcesPopover({
    isOpen,
    setIsOpen,
    selectedSources,
    onSourceToggle
}: WebSourcesPopoverProps) {
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="text-sm">Sources</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-64 p-3 bg-slate-700 border border-slate-600 shadow-lg"
                align="start"
            >
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-200 mb-2">Select Sources</h3>
                    <div className="space-y-2">
                        {WEB_SOURCES.map((source) => (
                            <div
                                key={source.id}
                                className="flex items-center space-x-2 hover:bg-slate-600 rounded-md p-1 transition-colors"
                            >
                                <Checkbox
                                    id={`source-${source.id}`}
                                    checked={selectedSources.includes(source.id)}
                                    onCheckedChange={() => onSourceToggle(source.id)}
                                    disabled={
                                        !selectedSources.includes(source.id) &&
                                        selectedSources.length >= 3 &&
                                        source.id !== 'web'
                                    }
                                    className="border-slate-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                />
                                <label
                                    htmlFor={`source-${source.id}`}
                                    className="text-sm font-medium leading-none cursor-pointer flex items-center space-x-2 flex-1 text-slate-200"
                                >
                                    <span className="text-base">{source.icon}</span>
                                    <span>{source.name}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    {selectedSources.length >= 3 && !selectedSources.includes('web') && (
                        <p className="text-xs text-slate-400 mt-2">
                            Maximum 3 sources can be selected
                        </p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export const ModeToggle = ({
    label,
    checked,
    onChange,
    icon,
    color = 'blue',
    onCustomClick
}: {
    label?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    icon?: React.ReactNode;
    color?: 'blue' | 'purple';
    onCustomClick?: () => void;
}) => {
    const activeColors = {
        blue: {
            bg: 'bg-blue-500/25',
            text: 'text-blue-100',
            hover: 'hover:bg-blue-500/40',
            ring: 'ring-blue-400/40',
            glow: 'after:bg-blue-500/15',
            shadow: 'shadow-[0_0_12px_-3px_rgba(59,130,246,0.4)]'
        },
        purple: {
            bg: 'bg-purple-500/25',
            text: 'text-purple-100',
            hover: 'hover:bg-purple-500/40',
            ring: 'ring-purple-400/40',
            glow: 'after:bg-purple-500/15',
            shadow: 'shadow-[0_0_12px_-3px_rgba(147,51,234,0.4)]'
        }
    }[color];

    const handleClick = () => {
        if (onCustomClick) {
            onCustomClick();
        } else {
            onChange(!checked);
        }
    };

    return (
        <Button
            variant="ghost"
            size={label ? "sm" : "icon"}
            onClick={handleClick}
            className={`
                relative h-7 m-0 text-xs 
                transition-all duration-300 ease-out
                rounded-md
                ${checked
                    ? `
                        ${activeColors.bg} 
                        ${activeColors.text} 
                        ${activeColors.hover} 
                        ${activeColors.shadow}
                        ring-1 ${activeColors.ring}
                        after:absolute 
                        after:inset-0 
                        after:rounded-md 
                        after:blur-sm 
                        after:opacity-50
                        after:-z-10
                        ${activeColors.glow}
                    `
                    : `
                        bg-slate-800/40 
                        text-slate-400
                        hover:text-slate-200 
                        hover:bg-slate-700/60
                        hover:shadow-md
                        hover:scale-[1.02]
                        active:scale-[0.98]
                    `
                }
                backdrop-blur-sm
                group
            `}
        >
            {checked && (
                <span className="absolute inset-0 rounded-md bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
            )}
            <span className="relative flex items-center justify-center gap-1">
                {label ? (
                    <span className={`
                        font-medium tracking-wide
                        ${checked ? 'scale-105' : 'scale-100'}
                        transition-all duration-300
                        ${checked ? 'text-white' : ''}
                    `}>
                        {label}
                    </span>
                ) : (
                    <span className={`
                        ${checked ? 'scale-110' : 'scale-100'}
                        transition-all duration-300
                        ${checked ? 'text-white' : ''}
                    `}>
                        {icon}
                    </span>
                )}
            </span>
        </Button>
    );
};

