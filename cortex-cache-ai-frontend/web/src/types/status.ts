export interface ProcessingStatus {
    document_id: string;
    title: string;
    status: string;
    progress: number;
    start_time: string;
    last_updated: string;
    error?: string;
}