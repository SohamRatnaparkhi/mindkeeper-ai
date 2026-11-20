'use client'

import { deleteUserAndRelatedData, getUserNotificationPreference, updateUserNameByEmail } from "@/actions/userCrud"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeys, ConnectedGDriveFiles, ConnectedNotionPages, Memory, MindMap, NotificationType, SocialUser, User } from "@prisma/client"
import { Key, Laptop, User as UserIcon } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import NotificationSettings from "./NotificationSettings"

export interface FullUser extends User {
    SocialUser: SocialUser[]
    ConnectedNotionPages: ConnectedNotionPages[]
    ConnectedGDriveFiles: ConnectedGDriveFiles[]
    ApiKeys: ApiKeys[]
    Memory: Memory[]
    MindMap: MindMap[]
}

export default function UserSettings({ user }: { user: FullUser }) {
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    type TabKey = 'personal' | 'account' | 'api' | 'notifications';
    const [activeTab, setActiveTab] = useState<TabKey>('personal')
    const isDesktop = useMediaQuery({ minWidth: 768 })
    const [deleting, setDeleting] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    type NotificationState = {
        [K in keyof typeof NotificationType]: boolean
    }

    const defaultNotifications: NotificationState = {
        NEW_MEMORY_SUCCESS: true,
        NEW_MEMORY_FAILURE: true,
        NEW_SHARED_MEMORY: true,
        NEW_SHARED_CONVERSATION: true,
        NEW_SHARED_MINDMAP: true,
        PROMOTIONAL: true,
        FEATURE_UPDATE: true
    }

    const [notifications, setNotifications] = useState<NotificationState>(defaultNotifications)

    useEffect(() => {
        const getUserNotifications = async () => {
            if (user.email) {
                const prefs = await getUserNotificationPreference(user.email)
                for (const pref of prefs) {
                    setNotifications((prev) => ({
                        ...prev,
                        [pref.type]: false
                    }))
                }
            }
        }
        getUserNotifications()
    })

    useEffect(() => {
        if (isDesktop) {
            setActiveTab('personal')
        }
    }, [isDesktop])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        // console.log('Form submitted', { name, email })
        setUpdating(true)
        await updateUserNameByEmail(email, name)
        setUpdating(false)
    }

    const handleDelete = async () => {
        setDeleting(true);
        localStorage.clear();
        await deleteUserAndRelatedData(user.id);
        window.location.href = '/auth/sign-in';
    };

    const tabContent = {
        personal: (
            <Card className="border-none shadow-none bg-background/40">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <UserIcon className="w-5 h-5 text-primary" />
                        <CardTitle>Personal Information</CardTitle>
                    </div>
                    <CardDescription>Manage your personal details and profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                            <Avatar className="w-24 h-24 border-2 border-primary/20">
                                <AvatarImage src={user.pfp || './public/placeholder/pfp.jpeg'} alt={user.name} />
                                <AvatarFallback className="bg-secondary">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <Separator className="bg-border/60" />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="max-w-md bg-secondary/50 border-border/60 bg-gray-800 text-gray-300 border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={true}
                                    className="max-w-md bg-secondary/50 border-border/60 bg-gray-800 text-gray-300 border-gray-700"
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button disabled={updating} onClick={handleSubmit} type="submit" className="w-full md:w-auto bg-purple-600 text-white hover:bg-purple-700">Save Changes {updating &&
                        <div className="w-5 h-5 border-2 border-t-2 border-purple-950 rounded-full animate-spin"></div>
                    }</Button>
                </CardFooter>
            </Card>
        ),
        account: (
            <>
                <Card className="border-none shadow-none bg-background/40">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Laptop className="w-5 h-5 text-primary" />
                            <CardTitle>Account Information</CardTitle>
                        </div>
                        <CardDescription>View and manage your account details and usage statistics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-4 p-6 rounded-lg bg-secondary/50 border border-border/60">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Account Type</span>
                                    <Badge variant="secondary" className="font-medium bg-background/60">
                                        {user.accountType}
                                    </Badge>
                                </div>
                                <Separator className="bg-border/60" />
                                {/* <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Current Balance</span>
                                    <span className="font-mono">{user.currentBalance} tokens</span>
                                </div>
                                <Separator className="bg-border/60" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total Used Tokens</span>
                                    <span className="font-mono">{user.totalUsedTokens} tokens</span>
                                </div> */}
                            </div>
                        </div>
                        <div className="my-2">
                            Check out the connected <Link className="text-blue-500" href="/add-page/notion">Notion pages</Link> and <Link href="/add-page/gdrive" className="text-blue-500">Google Drive</Link> files
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="default"
                            className="w-full md:w-auto bg-green-500 m-4"
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            Upgrade Account
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full md:w-auto bg-red-500"
                            onClick={() => setShowDeleteAlert(true)}
                            disabled={deleting}
                        >
                            Delete Account
                        </Button>
                    </CardFooter>
                </Card>

                {/* Upgrade Account Modal */}
                <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Account Upgrade</DialogTitle>
                            <DialogDescription className="pt-4">
                                We are not currently accepting upgrades at this time. For inquiries, please email us at:{' '}
                                <a href="mailto:info@mindkeeperai.com" className="text-blue-500 hover:underline">
                                    info@mindkeeperai.com
                                </a>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

                {/* Delete Account Alert Dialog */}
                <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                                <ul className="list-disc pl-6 mt-2">
                                    <li>All connected integrations</li>
                                    <li>Usage history and statistics</li>
                                    <li>Personal settings and preferences</li>
                                    <li>Saved memories</li>
                                    <li>Past Conversations</li>
                                </ul>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete Account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        ),
        api: (
            <Card className="border-none shadow-none bg-background/40">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Key className="w-5 h-5 text-primary" />
                        <CardTitle>API Keys</CardTitle>
                    </div>
                    <CardDescription>Securely manage your API keys for development.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {user.ApiKeys.map((key, index) => (
                            <div key={index} className="p-4 rounded-lg border border-border/60 bg-secondary/50">
                                <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
                                    <div className="space-y-1">
                                        <div className="font-mono text-sm bg-background/60 px-2 py-1 rounded">
                                            {key.apiKey}
                                        </div>
                                        {key.isPrimary && (
                                            <Badge variant="secondary" className="text-xs bg-background/60">
                                                Primary Key
                                            </Badge>
                                        )}
                                    </div>
                                    <Button variant="destructive" size="sm">Revoke Access</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full md:w-auto">
                        Generate New API Key
                    </Button>
                </CardFooter>
            </Card>
        ),
        notifications: (
            <NotificationSettings
                notifications={notifications}
                setNotifications={setNotifications}
                updating={updating}
                handleSubmit={handleSubmit}
            />
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="space-y-8">
                <div className="text-center w-full">
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account preferences and connected services.
                    </p>
                </div>

                {isDesktop ? (
                    <Tabs defaultValue="personal" className="space-y-8  bg-gray-900 text-gray-100 border border-gray-800 " onValueChange={(value) => setActiveTab(value as TabKey)}>
                        <TabsList className="w-full justify-start bg-black/40 border-b rounded-none p-0">
                            <TabsTrigger
                                value="personal"
                                className="data-[state=active]:bg-background/60 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                            >
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="account"
                                className="data-[state=active]:bg-background/60 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                            >
                                Account
                            </TabsTrigger>
                            {/* <TabsTrigger
                                value="api"
                                className="data-[state=active]:bg-background/60 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                            >
                                API Keys
                            </TabsTrigger> */}
                            <TabsTrigger
                                value="notifications"
                                className="data-[state=active]:bg-background/60 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                            >
                                Notifications
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeTab} className="mt-6">
                            {tabContent[activeTab]}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-6 bg-gray-900 text-gray-100 border border-gray-800">
                        <Select onValueChange={(value) => setActiveTab(value as TabKey)} defaultValue="personal">
                            <SelectTrigger className="w-full z-50 bg-slate-900 border-border/60">
                                <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800">
                                <SelectItem value="personal">Personal Info</SelectItem>
                                <SelectItem value="account">Account</SelectItem>
                                <SelectItem value="notifications">Notifications</SelectItem>
                            </SelectContent>
                        </Select>
                        {tabContent[activeTab]}
                    </div>
                )}
            </div>
        </div>
    )
}