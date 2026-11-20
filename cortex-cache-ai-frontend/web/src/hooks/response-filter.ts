export interface ParsedContent {
    answer: string;
    keyInsights: string;
    practicalApplications: string;
    furtherExploration: string;
    summary: string;
    citations: { [key: string]: number };
}

export const processAIContentFinally = (rawContent: string): ParsedContent => {
    const extractContent = (tag: string): string => {
        const regex1 = new RegExp(`## ${tag}\\s*([\\s\\S]*?)(?=## |$)`, 'i');
        const regex2 = new RegExp(`# ${tag}\\s*([\\s\\S]*?)(?=## |$)`, 'i');
        const match1 = rawContent.match(regex1);
        const match2 = rawContent.match(regex2);

        const match = match1 || match2;

        return match ? match[1].trim() : '';
    };

    const extractAndReplaceCitations = (text: string): [string, { [key: string]: number }] => {
        const citations: { [key: string]: number } = {};
        let citationCount = 1;
        const processedText = text.replace(/<cite>\[(.*?)\]<\/cite>/g, (match, chunkId) => {
            if (!citations[chunkId]) {
                citations[chunkId] = citationCount++;
            }
            return `[${citations[chunkId]}]`;
        });
        return [processedText, citations];
    };

    const sanitizeMarkdown = (markdown: string): string => {
        // Remove any potential script tags
        markdown = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Escape any remaining HTML tags, except for code blocks
        markdown = markdown.replace(/<(?!\/?(code|pre))[^>]+>/g, '');

        // Add space after '#' in headers if missing
        markdown = markdown.replace(/(^|\n)(#+)([^\s])/g, '$1$2 $3');

        // Ensure proper spacing for lists
        markdown = markdown.replace(/(\n|^)([*+-])\s*/g, '$1$2 ');

        // Ensure proper spacing for numbered lists
        markdown = markdown.replace(/(\n|^)(\d+\.)\s*/g, '$1$2 ');

        return markdown.trim();
    };

    const [processedAnswer, answerCitations] = extractAndReplaceCitations(rawContent.split('## Key Insights')[0]);
    const [processedKeyInsights, keyInsightsCitations] = extractAndReplaceCitations(extractContent('Key Insights'));

    const parsedContent: ParsedContent = {
        answer: sanitizeMarkdown(processedAnswer),
        keyInsights: sanitizeMarkdown(processedKeyInsights),
        practicalApplications: sanitizeMarkdown(extractContent('Practical Applications')),
        furtherExploration: sanitizeMarkdown(extractContent('Further Exploration')),
        summary: sanitizeMarkdown(extractContent('Summary')),
        citations: { ...answerCitations, ...keyInsightsCitations }
    };
    console.log(parsedContent)
    return parsedContent;
};