export const processAIContent = (
    rawContent: string,
    isStreaming: boolean,
    citations: any[] | null = null
): string => {
    if (isStreaming || !citations) {
        return rawContent;
    }

    let processedContent = rawContent;

    // Handle both citation formats:
    // 1. [cite:1, cite:2] or [cite:1]
    // 2. [cite:1, 2]
    const citationRegex = /\[(?:cite:\s*\d+(?:\s*(?:,\s*(?:cite:\s*)?\d+)*)\s*)\]/g;

    const matches = processedContent.match(citationRegex);
    if (matches) {
        matches.forEach(match => {
            // Extract numbers whether they follow 'cite:' or not
            const citationNumbers = match
                .match(/\d+/g)
                ?.map(num => parseInt(num))
                .filter(num => num > 0 && num <= citations.length);

            if (citationNumbers) {
                // Process each citation and join them
                const processedCitations = citationNumbers
                    .map(num => {
                        if (citations[num - 1]) {
                            return `${citations[num - 1].link}#citation-${num}`;
                        }
                        return '';
                    })
                    .filter(Boolean)
                    .join(', ');

                // Replace the entire citation group
                processedContent = processedContent.replace(match, processedCitations);
            }
        });
    }

    return processedContent;
};