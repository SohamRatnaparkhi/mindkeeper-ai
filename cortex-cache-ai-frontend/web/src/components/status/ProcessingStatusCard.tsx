import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import React from 'react';

interface ProcessingStatus {
    document_id: string;
    title: string;
    status: string;
    progress: number;
    error?: string;
}

interface ProcessingStatusCardProps {
    status: ProcessingStatus;
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-emerald-500/80 hover:bg-emerald-500';
        case 'FAILED':
            return 'bg-rose-500/80 hover:bg-rose-500';
        default:
            return 'bg-blue-500/80 hover:bg-blue-500';
    }
};


const getStatusDisplay = (status: string): string => {
    switch (status) {
        case 'QUEUED':
            return 'In Queue';
        case 'PROCESSING':
            return 'Processing';
        case 'STORING_DOCUMENT':
            return 'Storing Document';
        case 'CREATING_EMBEDDINGS':
            return 'Creating Embeddings';
        case 'STORING_VECTORS':
            return 'Storing Vectors';
        case 'COMPLETED':
            return 'Completed';
        case 'FAILED':
            return 'Failed';
        default:
            return status;
    }
};

const truncateTitle = (title: string, maxLength: number = 40): string => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
};

export const ProcessingStatusCard: React.FC<ProcessingStatusCardProps> = ({ status }) => {
    const isProcessing = !['COMPLETED', 'FAILED'].includes(status.status);

    return (
        <Card className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-lg shadow-slate-900/20">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                            <h4 className="text-sm font-medium text-slate-200">
                                {status.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                                <Badge
                                    variant="secondary"
                                    className={`${getStatusColor(status.status)} text-white font-medium transition-colors duration-150`}
                                >
                                    {getStatusDisplay(status.status)}
                                </Badge>
                                {isProcessing && (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Progress
                            value={status.progress}
                        />
                        <p className="text-xs text-slate-400 text-right">
                            {Math.round(status.progress)}%
                        </p>
                    </div>

                    {status.error && (
                        <p className="text-sm text-rose-400 mt-2 font-medium">
                            Error: {status.error}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};