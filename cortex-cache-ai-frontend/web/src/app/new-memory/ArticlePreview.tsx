import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
    AlertCircle,
    Globe,
    Link2,
    Loader2,
    User
} from "lucide-react";
import { useEffect, useState } from 'react';

interface ArticlePreviewProps {
    url: string;
    setUrl: (url: string) => void;
}

interface ArticleData {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    author?: string;
    url?: string;
}

const ArticlePreview = ({ url, setUrl }: ArticlePreviewProps) => {
    const [articleData, setArticleData] = useState<{
        data: ArticleData | null;
        error: string | null;
        loading: boolean;
    }>({
        data: null,
        error: null,
        loading: false
    });

    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const getArticleDetails = async (articleUrl: string) => {
            setArticleData(prev => ({ ...prev, loading: true, error: null }));

            try {
                const response = await fetch(`/api/article/preview?url=${encodeURIComponent(articleUrl)}`);
                const data = await response.json();

                if (data.error) {
                    setArticleData({
                        data: null,
                        loading: false,
                        error: data.error
                    });
                    return;
                }

                setArticleData({
                    data,
                    error: null,
                    loading: false
                });
            } catch (error) {
                setArticleData({
                    data: null,
                    loading: false,
                    error: 'Failed to fetch article details'
                });
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(() => {
            if (url && isValidUrl(url)) {
                getArticleDetails(url);
            } else if (url) {
                setArticleData(prev => ({
                    ...prev,
                    error: 'Invalid URL',
                    loading: false,
                    data: null
                }));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [url]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Input
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-gray-800 text-gray-300 border-gray-700 pl-10"
                />
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {articleData.loading && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            )}

            {articleData.error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{articleData.error}</AlertDescription>
                </Alert>
            )}

            {articleData.data && (
                <div className="bg-gray-800 p-4 rounded-lg shadow-sm space-y-4">
                    {/* Article Preview Card */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        {articleData.data.image && (
                            <div className="flex-shrink-0 w-full md:w-48">
                                <img
                                    src={articleData.data.image}
                                    alt={articleData.data.title || 'Article thumbnail'}
                                    className="w-full h-32 md:h-24 object-cover rounded-md"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {articleData.data.title && (
                                <h3 className="font-semibold text-gray-300 line-clamp-2">
                                    {articleData.data.title}
                                </h3>
                            )}

                            {articleData.data.description && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                    {articleData.data.description}
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                {articleData.data.siteName && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        <span>{articleData.data.siteName}</span>
                                    </div>
                                )}

                                {articleData.data.author && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{articleData.data.author}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <p className="text-xs text-yellow-400">
                Note: Use this for websites other than YouTube.
            </p>
        </div>
    );
};

export default ArticlePreview;