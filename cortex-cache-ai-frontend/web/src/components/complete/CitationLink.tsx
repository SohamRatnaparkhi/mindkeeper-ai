import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface CitationContentProps {
    citationNumber: string;
    title: string;
    description: string;
    baseUrl: string;
    source?: string;
}

const CitationContent = ({ citationNumber, title, description, baseUrl, source }: CitationContentProps) => (
    <div className="flex flex-col h-[400px]">
        {/* Header section with citation number */}
        <div className="border-b border-slate-800 p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                    Citation {citationNumber}
                </span>
            </div>
        </div>

        {/* Content section */}
        <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-4">
                {/* Title */}
                <h4 className="font-medium text-sm text-slate-200">
                    {title}
                </h4>

                {/* Description - no line clamp */}
                <p className="text-xs text-slate-400">
                    {description}
                </p>

                {/* URL preview */}
                <div className="pt-1">
                    <p className="text-xs text-slate-500 break-all">
                        {source || ''}
                    </p>
                </div>
            </div>
        </div>

        {/* Footer with actions - stays fixed */}
        <div className="flex-none border-t border-slate-800 p-3 flex justify-end gap-2 bg-slate-900">
            <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                onClick={() => window.open(baseUrl, '_blank')}
            >
                Go to citation
            </Button>
            <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                onClick={() => window.open(source, '_blank')}
            >
                <ExternalLink size={12} className="mr-1" />
                View source
            </Button>
        </div>
    </div>
);

interface CitationLinkProps {
    href: string;
    citationNumber: string;
    title: string;
    description: string;
    source?: string;
}

const CitationLink = ({ href, citationNumber, title, description, source }: CitationLinkProps) => {
    const baseUrl = href.split('#citation-')[0];
    const [showHover, setShowHover] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <span
            className="inline-block relative"
            onMouseEnter={() => setShowHover(true)}
            onMouseLeave={() => setShowHover(false)}
        >
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <button
                        onClick={() => setShowHover(false)}
                        className="inline-flex items-center -mt-0.5"
                    >
                        <span className="inline-flex items-center justify-center min-w-[20px] text-blue-300 hover:text-blue-100 font-semibold text-[11px] px-1.5 p-[2px] rounded-md bg-blue-500/[0.08] hover:bg-blue-500/[0.12] border border-blue-500/[0.12] hover:border-blue-500/[0.18] shadow-sm hover:shadow transition-all duration-150">
                            {citationNumber}
                        </span>
                    </button>
                </DialogTrigger>
                <DialogContent className="w-80 bg-slate-900 border border-slate-800 shadow-xl rounded-lg p-0 sm:max-w-[425px]">
                    <CitationContent
                        citationNumber={citationNumber}
                        title={title}
                        description={description}
                        baseUrl={baseUrl}
                        source={source}
                    />
                </DialogContent>
            </Dialog>

            {/* Hover preview - only shown on non-touch devices */}
            {showHover && (
                <div onClick={() => {
                    setShowHover(false);
                    setDialogOpen(true);
                }} className="hidden md:block fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-slate-900 border border-slate-800 shadow-xl rounded-lg z-50">
                    <div className="p-3 space-y-2">
                        <span className="text-xs font-medium text-slate-400">
                            Citation {citationNumber}
                        </span>
                        <h4 className="font-medium text-sm text-slate-200">
                            {title}
                        </h4>
                        <p className="text-xs text-slate-400">
                            Click here or on the number to view more details
                        </p>
                    </div>
                </div>
            )}
        </span>
    );
};

export default CitationLink;