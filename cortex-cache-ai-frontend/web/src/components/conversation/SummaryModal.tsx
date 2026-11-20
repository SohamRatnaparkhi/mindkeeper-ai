import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LightningBoltIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"
import { RefObject, useState } from "react"
import FixedMarkdown from "../complete/FixedMarkdown"

export default function SummaryModal({ conversationId }: { conversationId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchSummary = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/summary/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId })
            })
            const data = await res.json()
            setSummary(data.body?.summary)
        } catch (error) {
            console.error('Error fetching summary:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleShowSummary = async () => {
        await fetchSummary()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={async () => {
                        await handleShowSummary()
                        setIsOpen(true)
                    }}
                    className="bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors duration-300 p-2 flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LightningBoltIcon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Summary</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border border-slate-800 w-[90%] mx-auto text-slate-200 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-100">
                        Interaction Summary
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="no-scroll-bar">
                            <FixedMarkdown
                                processedContent={summary || ''}
                                codeRef={{} as RefObject<HTMLElement>}
                                copyCodeToClipboard={() => { }}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}