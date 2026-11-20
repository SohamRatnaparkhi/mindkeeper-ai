import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Globe, Loader2, Mail, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShareModalProps {
    conversationId: string;
}

type SharedUser = {
    email: string;
    permission: 'VIEW' | 'EDIT';
    type: 'public' | 'private';
};

export const ShareConversationModal = ({ conversationId }: ShareModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('share');
    const [shareType, setShareType] = useState<'public' | 'private'>('private');
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [isLoadingShares, setIsLoadingShares] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && activeTab === 'manage') {
            fetchSharedUsers();
        }
    }, [isOpen, activeTab]);

    const fetchSharedUsers = async () => {
        try {
            setIsLoadingShares(true);
            const response = await fetch(`/api/share/convo?conversationId=${conversationId}`);
            if (!response.ok) throw new Error('Failed to fetch shares');
            const { shares } = await response.json();
            console.log('Fetched shares:', shares);

            const users: SharedUser[] = shares.map((share: any) => ({
                email: share.toUserId === 'public-access'
                    ? 'Anyone with link'
                    : share.User_SharedConversation_toUserIdToUser.email,
                permission: share.permission,
                type: share.toUserId === 'public-access' ? 'public' : 'private'
            }));

            setSharedUsers(users);
        } catch (error) {
            console.error('Error fetching shares:', error);
            toast({
                title: "Error fetching shares",
                description: "Could not load sharing information",
                variant: "destructive",
                className: "bg-red-500",
            });
        } finally {
            setIsLoadingShares(false);
        }
    };

    const handleShare = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/share/convo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId,
                    isPublic: shareType === 'public',
                    sharedEmails: shareType === 'private' ? emails : undefined,
                    permission: 'VIEW',
                }),
            });

            if (!response.ok) throw new Error('Failed to share conversation');

            toast({
                title: "Conversation shared successfully",
                description: shareType === 'public'
                    ? "Anyone with the link can now view this conversation"
                    : "Please share the conversation link with the selected users.",
            });
            setEmails([]);
            setActiveTab('manage');
            fetchSharedUsers();
        } catch (error) {
            console.log(error)
            toast({
                title: "Error sharing conversation",
                description: "Please try again later",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveAccess = async (email: string | null, type: 'public' | 'private' | 'all') => {
        try {
            let url = `/api/share/convo?conversationId=${conversationId}`;

            if (type === 'all') {
                url += '&removeAll=true';
            } else {
                const targetUserId = type === 'public' ? 'public-access' : email;
                url += `&userId=${targetUserId}`;
            }

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to remove access');

            toast({
                title: type === 'all' ? "All access withdrawn" : "Access removed successfully",
                description: type === 'all'
                    ? "No one can access this conversation anymore"
                    : "The selected user can no longer access this conversation",
            });

            fetchSharedUsers();
        } catch (error) {
            toast({
                title: "Error removing access",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-slate-100">Share Management</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                        <TabsTrigger value="share" className="data-[state=active]:bg-slate-700">
                            Share New
                        </TabsTrigger>
                        <TabsTrigger value="manage" className="data-[state=active]:bg-slate-700">
                            Manage Access
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="share" className="mt-4">
                        <div className="space-y-6">
                            <RadioGroup
                                value={shareType}
                                onValueChange={(value) => setShareType(value as 'public' | 'private')}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="flex items-center space-x-2 text-slate-200">
                                    <RadioGroupItem value="private" id="private" className="border-slate-600" />
                                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                                        <Mail className="h-4 w-4" />
                                        Specific people
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 text-slate-200">
                                    <RadioGroupItem value="public" id="public" className="border-slate-600" />
                                    <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                                        <Globe className="h-4 w-4" />
                                        Anyone with link
                                    </Label>
                                </div>
                            </RadioGroup>

                            {shareType === 'private' && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="Add email address"
                                            value={currentEmail}
                                            onChange={(e) => setCurrentEmail(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && setEmails([...emails, currentEmail])}
                                            className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                                        />
                                        <Button
                                            onClick={() => setEmails([...emails, currentEmail])}
                                            type="button"
                                            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
                                        >
                                            Add
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {emails.map((email) => (
                                            <Badge
                                                key={email}
                                                variant="secondary"
                                                className="px-2 py-1 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                            >
                                                {email}
                                                <X
                                                    className="ml-1 h-3 w-3 cursor-pointer hover:text-slate-400"
                                                    onClick={() => setEmails(emails.filter(e => e !== email))}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-sm text-slate-400">Access</Label>
                                <div className="text-sm text-slate-500">
                                    View access only (Edit access coming soon)
                                </div>
                            </div>

                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={handleShare}
                                    disabled={isLoading || (shareType === 'private' && emails.length === 0)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Share'}
                                </Button>

                                <Button
                                    onClick={async () => {
                                        const url = `https://www.mindkeeperai.com/chat/${conversationId}`;

                                        try {
                                            // Try using modern navigator.clipboard API first
                                            if (navigator.clipboard && window.isSecureContext) {
                                                await navigator.clipboard.writeText(url);
                                            } else {
                                                // Fallback for older browsers and non-HTTPS contexts
                                                const textArea = document.createElement('textarea');
                                                textArea.value = url;
                                                textArea.style.position = 'fixed';
                                                textArea.style.left = '-999999px';
                                                textArea.style.top = '-999999px';
                                                document.body.appendChild(textArea);
                                                textArea.focus();
                                                textArea.select();

                                                try {
                                                    document.execCommand('copy');
                                                    textArea.remove();
                                                } catch (error) {
                                                    console.error('Fallback: Oops, unable to copy', error);
                                                    textArea.remove();
                                                    throw error;
                                                }
                                            }

                                            // Show success state
                                            setCopied(true);
                                            toast({
                                                title: "Link copied to clipboard",
                                                description: "You can now share the link with others",
                                                variant: "default",
                                                className: "bg-green-500",
                                            })
                                            setTimeout(() => setCopied(false), 2000);
                                        } catch (error) {
                                            console.error('Failed to copy:', error);
                                            toast({
                                                title: "Failed to copy link",
                                                description: "Please try copying manually",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                    variant="outline"
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                                    disabled={isLoading}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="manage" className="mt-4">
                        <div className="space-y-4">
                            {isLoadingShares ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            ) : sharedUsers.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveAccess(null, 'all')}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Withdraw All Access
                                        </Button>
                                    </div>
                                    {sharedUsers.map((user, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {user.type === 'public' ? (
                                                    <Globe className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Mail className="h-4 w-4 text-slate-400" />
                                                )}
                                                <span className="text-slate-200">{user.email}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveAccess(user.email, user.type)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 py-4">
                                    No shares found. Share your conversation to see them here.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};