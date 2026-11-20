import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Youtube } from "lucide-react";
import React, { useCallback, useEffect, useState } from 'react';

interface YouTubePreviewProps {
    url: string;
    setUrl: (url: string) => void;
}

interface VideoData {
    title: string | null;
    author_name: string | null;
    thumbnail_url: string | null;
    html: string | null;
}

function YouTubePreview({ url, setUrl }: YouTubePreviewProps) {
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Memoize the URL change handler
    const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
    }, [setUrl]);

    // Extract video ID from various YouTube URL formats
    const extractVideoId = useCallback((url: string): string | null => {
        try {
            const urlObj = new URL(url);

            // Handle youtube.com URLs
            if (urlObj.hostname.includes('youtube.com')) {
                if (urlObj.pathname === '/watch') {
                    return urlObj.searchParams.get('v');
                }
                if (urlObj.pathname.startsWith('/v/')) {
                    return urlObj.pathname.split('/')[2];
                }
                if (urlObj.pathname.startsWith('/embed/')) {
                    return urlObj.pathname.split('/')[2];
                }
            }

            // Handle youtu.be URLs
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }

            return null;
        } catch (error) {
            return null;
        }
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | undefined = undefined;

        const getVideoDetails = async (videoUrl: string) => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/youtube/embed?url=${encodeURIComponent(videoUrl)}`);
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                    setVideoData(null);
                } else {
                    setVideoData({
                        title: data.title,
                        author_name: data.author_name,
                        thumbnail_url: data.thumbnail_url,
                        html: data.html
                    });
                }
            } catch (error) {
                setError('Failed to fetch video details');
                setVideoData(null);
            } finally {
                setLoading(false);
            }
        };

        // Clean up previous timeout
        if (timeoutId != undefined) {
            clearTimeout(timeoutId);
        }

        // Only make the API call if we have a valid URL
        if (url) {
            timeoutId = setTimeout(() => {
                const videoId = extractVideoId(url);
                if (videoId) {
                    getVideoDetails(url);
                } else {
                    setError('No preview available or invalid YouTube URL');
                    setVideoData(null);
                    setLoading(false);
                }
            }, 5000);
        } else {
            // Reset state when URL is empty
            setVideoData(null);
            setError(null);
            setLoading(false);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [url, extractVideoId]);

    const VideoInput = React.memo(() => (
        <div className="relative">
            <Input
                type="url"
                placeholder="https://youtu.be/video-id or https://youtube.com/watch?v=video-id"
                value={url}
                onChange={handleUrlChange}
                className="w-full bg-gray-800 text-gray-300 border-gray-700 pl-10"
            />
            <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
        </div>
    ));
    VideoInput.displayName = 'VideoInput';

    return (
        <div className="space-y-4">
            <VideoInput />

            {loading && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {url && videoData?.title && !error && (
                <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-300">
                                {videoData.title}
                            </h3>
                            {videoData.author_name && (
                                <p className="text-sm text-gray-400 mt-1">
                                    by {videoData.author_name}
                                </p>
                            )}
                        </div>

                        {videoData.html && (
                            <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-md overflow-hidden">
                                <div
                                    className="absolute inset-0"
                                    dangerouslySetInnerHTML={{
                                        __html: videoData.html
                                            .replace('height="113"', 'height="100%"')
                                            .replace('width="200"', 'width="100%"')
                                    }}
                                />
                            </div>
                        )}

                        {!videoData.html && videoData.thumbnail_url && (
                            <img
                                src={videoData.thumbnail_url}
                                alt="Video thumbnail"
                                className="w-full rounded-md shadow-sm"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

YouTubePreview.displayName = 'YouTubePreview';

export default React.memo(YouTubePreview);