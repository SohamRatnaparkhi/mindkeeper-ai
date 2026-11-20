import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const CollapsibleReasoning = ({ content }: {
    content: string;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // // Function to check if content is reasoning
    // const isReasoningContent = (text: string) => {
    //     return text.toLowerCase().startsWith('reasoning: ');
    // };

    // Only show the component if there's reasoning content
    // if (!content || !isReasoningContent(content)) {
    //     return null;
    // }

    content = content.replace('reasoning: ', '');

    return (
        <div className="w-full mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-t-lg hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Brain className="text-white" size={24} />
                    <span className="text-white font-mono">Reasoning</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="text-white" size={20} />
                ) : (
                    <ChevronDown className="text-white" size={20} />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 bg-gray-700 rounded-b-lg">
                    <div className="text-white text-sm">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};