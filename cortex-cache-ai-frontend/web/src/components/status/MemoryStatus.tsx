import { useToast } from "@/hooks/use-toast";
import type { ProcessingStatus } from '@/types/status';
import { useCallback, useEffect, useState } from 'react';
import { ProcessingStatusCard } from './ProcessingStatusCard';

const INITIAL_POLL_INTERVAL = 1000;
const MAX_POLL_INTERVAL = 5000;

export const MemoryStatus = () => {
    const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
    const [pollInterval, setPollInterval] = useState(INITIAL_POLL_INTERVAL);
    const [isPolling, setIsPolling] = useState(true);
    const { toast } = useToast();

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await fetch('/api/status');
            if (!response.ok) throw new Error('Failed to fetch status');

            const data = await response.json();
            setStatuses(data);

            console.log('Data:', data);

            // Check for any incomplete statuses
            const hasIncomplete = data.some((status: ProcessingStatus) =>
                !['COMPLETED', 'FAILED'].includes(status.status)
            );

            console.log('hasIncomplete:', hasIncomplete);

            if (!hasIncomplete) {
                setIsPolling(false);
                // Optionally cleanup completed statuses
                // fetch('/api/status', { method: 'DELETE' }).catch(console.error);
            } else {
                // Gradually increase poll interval for active processes
                setPollInterval(prev => Math.min(prev * 1.5, MAX_POLL_INTERVAL));
            }
        } catch (error) {
            console.error('Error fetching status:', error);
            toast({
                title: "Error fetching status",
                description: "Will retry shortly",
                variant: "destructive",
            });
            setIsPolling(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStatuses();

        if (isPolling) {
            const interval = setInterval(fetchStatuses, 2000);
            return () => clearInterval(interval);
        }
    }, [fetchStatuses, isPolling]);

    // Initial fetch
    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    return (
        <div className="space-y-4 p-4">
            {statuses.length === 0 && isPolling && (
                <div className="text-center text-gray-500">
                    Waiting for processing to begin...
                </div>
            )}

            {statuses.map((status) => (
                status && status?.document_id && <ProcessingStatusCard
                    key={status.document_id}
                    status={status}
                />
            ))}

            {statuses.length === 0 && !isPolling && (
                <div className="text-center text-gray-500">
                    No active processes found
                </div>
            )}
        </div>
    );
};