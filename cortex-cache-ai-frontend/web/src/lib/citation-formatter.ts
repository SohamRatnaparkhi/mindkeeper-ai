
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatCitation = (citation: Citation, i: number): FormattedCitation => {
    if (citation.type === 'web') {
        return formatWebCitation(citation, i);
    }
    return formatMemoryCitation(citation, i);
};

const formatWebCitation = (citation: WebCitation, i: number): FormattedCitation => {
    const FRONTEND_URL = process.env.FRONTEND_SERVER_URL;
    console.log("Web citation", citation);
    return {
        title: citation.title,
        description: removeTags(citation.content),
        link: citation.url,
        sourceType: citation.source,
        sourceNumber: i,
        sourceLink: citation.url,
        memoryId: citation.id,
    };
};

const formatMemoryCitation = (citation: MemoryCitation, i: number): FormattedCitation => {
    const FRONTEND_URL = process.env.FRONTEND_SERVER_URL;
    const memoryLink = `${FRONTEND_URL}/memories/${citation.memId || citation.id}`;
    const titleLink = `${memoryLink}#chunk-${citation.chunkId}`;

    const formattedCitation: FormattedCitation = {
        title: citation.title || '',
        description: removeTags(citation.content),
        link: titleLink,
        sourceType: citation.memType || 'memory',
        sourceNumber: i,
        sourceLink: citation.metadata?.source || citation.metadata?.specific_desc?.url || "",
        memoryId: citation.memId || citation.chunkId.split('_')[0],
    };

    // Handle YouTube-specific data
    if (citation.memType === 'youtube' && citation.metadata?.specific_desc) {
        const { start_time, end_time } = citation.metadata.specific_desc;
        formattedCitation.startTime = start_time?.toString().substring(0, 5) || "";
        formattedCitation.endTime = end_time?.toString().substring(0, 5) || "";
    }

    return formattedCitation;
};

const removeTags = (content: string): string => {
    return content.replace(/<[^>]*>?/gm, '');
};
