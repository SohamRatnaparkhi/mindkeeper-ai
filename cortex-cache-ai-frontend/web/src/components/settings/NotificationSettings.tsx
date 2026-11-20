import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { NotificationType } from "@prisma/client";
import { AlertCircle, Loader2, Megaphone, Share2 } from 'lucide-react';

type NotificationState = {
    [K in keyof typeof NotificationType]: boolean
}
interface NotificationSettingsProps {
    notifications: Record<string, boolean>;
    setNotifications: React.Dispatch<React.SetStateAction<NotificationState>>;
    updating: boolean;
    handleSubmit: (e: any) => Promise<void>;
}

const NotificationSettings = ({ notifications, setNotifications, updating, handleSubmit }: NotificationSettingsProps) => {
    interface NotificationItemProps {
        label: string;
        description: string;
        settingKey: string;
    }

    const NotificationItem = ({ label, description, settingKey }: NotificationItemProps) => (
        <div className="flex items-center justify-between py-2.5">
            <div className="flex-1 pr-6">
                <Label className="text-sm font-medium text-gray-200">{label}</Label>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
            <Switch
                checked={!notifications[settingKey]}
                onCheckedChange={(checked) =>
                    setNotifications(prev => ({
                        ...prev,
                        [settingKey]: !checked
                    }))
                }
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-700"
            />
        </div>
    );

    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center space-x-2 mb-3">
            <Icon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        </div>
    );

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden lg:block">
                <div className="grid grid-cols-3 gap-4">
                    {/* Memory Section */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                        <SectionHeader icon={AlertCircle} title="Memory Notifications" />
                        <div className="space-y-1">
                            <NotificationItem
                                label="Memory Creation Success"
                                description="Get notified when your memories are successfully created"
                                settingKey="NEW_MEMORY_SUCCESS"
                            />
                            <Separator className="bg-gray-800" />
                            <NotificationItem
                                label="Memory Creation Failures"
                                description="Get notified when there are issues creating memories"
                                settingKey="NEW_MEMORY_FAILURE"
                            />
                        </div>
                    </div>

                    {/* Sharing Section */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                        <SectionHeader icon={Share2} title="Sharing Notifications" />
                        <div className="space-y-1">
                            <NotificationItem
                                label="Shared Memories"
                                description="When someone shares a memory with you"
                                settingKey="NEW_SHARED_MEMORY"
                            />
                            <Separator className="bg-gray-800" />
                            <NotificationItem
                                label="Shared Conversations"
                                description="When someone shares a conversation with you"
                                settingKey="NEW_SHARED_CONVERSATION"
                            />
                            <Separator className="bg-gray-800" />
                            <NotificationItem
                                label="Shared Mind Maps"
                                description="When someone shares a mind map with you"
                                settingKey="NEW_SHARED_MINDMAP"
                            />
                        </div>
                    </div>

                    {/* System Section */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                        <SectionHeader icon={Megaphone} title="System Updates" />
                        <div className="space-y-1">
                            <NotificationItem
                                label="Feature Updates"
                                description="Get notified about new features and improvements"
                                settingKey="FEATURE_UPDATE"
                            />
                            <Separator className="bg-gray-800" />
                            <NotificationItem
                                label="Promotional Updates"
                                description="Receive promotional content and special offers"
                                settingKey="PROMOTIONAL"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden space-y-4">
                {/* Memory Section */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <SectionHeader icon={AlertCircle} title="Memory Notifications" />
                    <div className="space-y-1">
                        <NotificationItem
                            label="Memory Creation Success"
                            description="Get notified when your memories are successfully created"
                            settingKey="NEW_MEMORY_SUCCESS"
                        />
                        <Separator className="bg-gray-800" />
                        <NotificationItem
                            label="Memory Creation Failures"
                            description="Get notified when there are issues creating memories"
                            settingKey="NEW_MEMORY_FAILURE"
                        />
                    </div>
                </div>

                {/* Sharing Section */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <SectionHeader icon={Share2} title="Sharing Notifications" />
                    <div className="space-y-1">
                        <NotificationItem
                            label="Shared Memories"
                            description="When someone shares a memory with you"
                            settingKey="NEW_SHARED_MEMORY"
                        />
                        <Separator className="bg-gray-800" />
                        <NotificationItem
                            label="Shared Conversations"
                            description="When someone shares a conversation with you"
                            settingKey="NEW_SHARED_CONVERSATION"
                        />
                        <Separator className="bg-gray-800" />
                        <NotificationItem
                            label="Shared Mind Maps"
                            description="When someone shares a mind map with you"
                            settingKey="NEW_SHARED_MINDMAP"
                        />
                    </div>
                </div>

                {/* System Section */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <SectionHeader icon={Megaphone} title="System Updates" />
                    <div className="space-y-1">
                        <NotificationItem
                            label="Feature Updates"
                            description="Get notified about new features and improvements"
                            settingKey="FEATURE_UPDATE"
                        />
                        <Separator className="bg-gray-800" />
                        <NotificationItem
                            label="Promotional Updates"
                            description="Receive promotional content and special offers"
                            settingKey="PROMOTIONAL"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={updating}
                    className="w-full md:w-auto m-2 p-2 bg-purple-600 text-white hover:bg-purple-700 lg:w-auto"
                >
                    {updating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving changes...
                        </>
                    ) : (
                        'Save changes'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default NotificationSettings;