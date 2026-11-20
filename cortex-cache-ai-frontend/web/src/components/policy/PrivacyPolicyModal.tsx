import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrivacyPolicy from "./PrivacyPolicy";

export default function PrivacyPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white backdrop-blur-sm rounded-lg cursor-pointer transition-all hover:bg-opacity-20">
                <ScrollArea className="mt-6 max-h-[60vh]" >
                    <PrivacyPolicy />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}