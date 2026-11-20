type MemoryMetadata = {
    source?: string;
    specific_desc?: {
        url?: string;
        start_time?: string;
        end_time?: string;
    };
};

type MemoryCitation = {
    id: string;
    content: string;
    type: 'memory';
    chunkId: string;
    metadata: any;
    memId?: string;
    memType?: string;
    memData?: string;
    title?: string;
};

type WebCitation = {
    id: string;
    url: string;
    title: string;
    content: string;
    type: 'web';
    source: string;
};

type Citation = MemoryCitation | WebCitation;

type FormattedCitation = {
    title: string;
    description: string;
    link: string;
    sourceType: string;
    sourceNumber: number;
    sourceLink: string;
    memoryId: string;
    startTime?: string;
    endTime?: string;
};