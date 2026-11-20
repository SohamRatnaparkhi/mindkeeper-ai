import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    AlertCircle,
    Clock,
    Code,
    GitFork,
    Github,
    Loader2,
    Scale,
    Star
} from "lucide-react";
import { useEffect, useState } from 'react';

interface GitHubPreviewProps {
    url: string;
    setUrl: (url: string) => void;
}

interface RepoData {
    name: string;
    fullName: string;
    owner: {
        login: string;
        avatarUrl: string;
    };
    description: string;
    stars: number;
    forks: number;
    language: string;
    topics: string[];
    url: string;
    updatedAt: string;
    license: string;
}

const GitHubPreview = ({ url, setUrl }: GitHubPreviewProps) => {
    const [repoData, setRepoData] = useState<{
        data: RepoData | null;
        error: string | null;
        loading: boolean;
    }>({
        data: null,
        error: null,
        loading: false
    });

    useEffect(() => {
        const getRepoDetails = async (repoUrl: string) => {
            setRepoData(prev => ({ ...prev, loading: true, error: null }));

            try {
                const response = await fetch(`/api/github/repo?url=${encodeURIComponent(repoUrl)}`);
                const data = await response.json();

                if (data.error) {
                    setRepoData({
                        data: null,
                        loading: false,
                        error: data.error
                    });
                    return;
                }

                setRepoData({
                    data,
                    error: null,
                    loading: false
                });
            } catch (error) {
                setRepoData({
                    data: null,
                    loading: false,
                    error: 'Failed to fetch repository details'
                });
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(() => {
            if (url && url.includes('github.com')) {
                getRepoDetails(url);
            } else if (url) {
                setRepoData(prev => ({
                    ...prev,
                    error: 'Invalid GitHub repository URL',
                    loading: false,
                    data: null
                }));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [url]);

    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Input
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-gray-800 text-gray-300 border-gray-700 pl-10"
                />
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {repoData.loading && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            )}

            {repoData.error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{repoData.error}</AlertDescription>
                </Alert>
            )}

            {repoData.data && (
                <div className="bg-gray-800 p-4 rounded-lg shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <img
                            src={repoData.data.owner.avatarUrl}
                            alt={repoData.data.owner.login}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-300">
                                {repoData.data.fullName}
                            </h3>
                            {repoData.data.description && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {repoData.data.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            <span>{formatNumber(repoData.data.stars)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <GitFork className="h-4 w-4" />
                            <span>{formatNumber(repoData.data.forks)}</span>
                        </div>
                        {repoData.data.language && (
                            <div className="flex items-center gap-1">
                                <Code className="h-4 w-4" />
                                <span>{repoData.data.language}</span>
                            </div>
                        )}
                        {repoData.data.license && (
                            <div className="flex items-center gap-1">
                                <Scale className="h-4 w-4" />
                                <span>{repoData.data.license}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Updated {formatDate(repoData.data.updatedAt)}</span>
                        </div>
                    </div>

                    {/* Topics */}
                    {repoData.data.topics && repoData.data.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {repoData.data.topics.map(topic => (
                                <Badge
                                    key={topic}
                                    className="bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                                >
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <p className="text-xs text-yellow-400">
                Note: Its in active development and not accurate.
            </p>
        </div>
    );
};

export default GitHubPreview;