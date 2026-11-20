import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface SearchTipCardProps {
    title: string;
    points: string[];
}

const SearchTipCard = ({ title, points }: SearchTipCardProps) => (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h4 className="font-medium text-slate-200 mb-2">{title}</h4>
        <ul className="space-y-2">
            {points.map((point, index) => (
                <li key={index} className="flex text-left items-start space-x-2 text-slate-400 text-sm">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{point}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function AiSearchEmptyState() {
    return (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center text-center p-8 space-y-8">
                <div className="relative">
                    <div className="bg-blue-500/10 rounded-full p-4">
                        <Sparkles className="h-12 w-12 text-blue-400" />
                    </div>
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-blue-500 animate-ping" />
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-blue-500" />
                </div>

                <div className="space-y-2 max-w-xl">
                    <h3 className="text-2xl font-semibold text-slate-200">AI based Memory Search</h3>
                    <p className="text-slate-400">
                        Use AI search when you remember the content but not the title. Just describe what you're
                        looking for in your own words, and let MindKeeper find it for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    <SearchTipCard
                        title="What You Can Search"
                        points={[
                            "Content from meetings or presentations",
                            "Saved articles and web pages",
                            "YouTube videos and playlists",
                            "Document contents and spreadsheets",
                            "Images and visual references",
                            "Audio content and podcasts"
                        ]}
                    />

                    <SearchTipCard
                        title="How People Remember"
                        points={[
                            "marketing meeting discussion with Alpha team",
                            "pitch deck for Series A funding",
                            "analytics dashboard requirements",
                            "Medium article on 'design thinking'",
                            "feedback from the design team",
                            "expense report in Google Drive"
                        ]}
                    />
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-lg p-4 max-w-2xl w-full border border-slate-700">
                    <h4 className="font-medium text-slate-200 mb-3">How to Get Better Results:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium text-slate-300">Do:</h5>
                            <ul className="text-sm text-slate-400 space-y-1">
                                <li className="flex items-start space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Use natural language</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Include relevant context</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Mention specific topics</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Add time references</span>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium text-slate-300">Don't:</h5>
                            <ul className="text-sm text-slate-400 space-y-1">
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-400">×</span>
                                    <span>Use single keywords</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-400">×</span>
                                    <span>Be too vague</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-400">×</span>
                                    <span>Skip important details</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-400">×</span>
                                    <span>Worry about exact titles</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}