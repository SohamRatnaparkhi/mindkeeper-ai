import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface Conversation {
    id: string;
    title: string;
}

interface ConvoHistoryProps {
    memId: string;
}

const ConvoHistoryByMemory: React.FC<ConvoHistoryProps> = ({ memId }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchConversations = async () => {
            if (!memId || memId === "") return;

            setIsLoading(true);
            try {
                const response = await fetch(`/api/convo-history/memory/${memId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch conversations');
                }
                const data = await response.json();
                setConversations(data.body);
                setFilteredConversations(data.body);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [memId]);

    useEffect(() => {
        const filtered = conversations.filter(convo =>
            convo.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredConversations(filtered);
    }, [searchQuery, conversations]);

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400 pr-8"
                    />
                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400 text-center">
                        {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </div>
                ) : (
                    <ul className="p-2 space-y-1">
                        {filteredConversations.map((conversation) => (
                            <li key={conversation.id}>
                                <Link
                                    href={`/chat/${conversation.id}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-200 hover:bg-gray-700/50 transition-colors group"
                                >
                                    <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-gray-200 transition-colors" />
                                    <span className="text-sm truncate">{conversation.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConvoHistoryByMemory;