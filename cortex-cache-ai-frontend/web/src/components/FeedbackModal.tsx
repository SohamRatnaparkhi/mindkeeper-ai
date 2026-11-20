import { uploadFileUsingPresignedUrl } from '@/actions/s3'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import { Loader2, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface FeedbackModalProps {
    open: boolean
    onClose: () => void
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [feedbackType, setFeedbackType] = useState<'bug' | 'feedback'>('feedback')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [email, setEmail] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let mediaUrl = ''

            if (file) {
                if (file.size > 4 * 1024 * 1024) {
                    toast({
                        title: "File too large",
                        description: "File size must be less than 4MB",
                        variant: "destructive",
                        className: "bg-slate-800 text-slate-100 border-slate-700"
                    })
                    setIsLoading(false)
                    return
                }

                const fileName = `feedback-${uuidv4()}-${file.name}`
                const { data } = await axios.post('/api/aws-presigned', {
                    fileName,
                    fileType: file.type,
                })
                const form = new FormData()
                form.append('file', file)
                await uploadFileUsingPresignedUrl(form, data.url)
                mediaUrl = fileName
            }

            await axios.post('/api/feedback', {
                type: "BUG",
                content: description,
                mediaUrl,
                email: email || undefined,
            })

            toast({
                title: "Thank you for your feedback!",
                description: "We'll review it and get back to you if needed.",
                className: "bg-slate-800 border-slate-700 text-slate-100"
            })

            onClose()
        } catch (error) {
            toast({
                title: "Error submitting feedback",
                description: "Please try again or email us directly.",
                variant: "destructive",
                className: "bg-slate-800 text-slate-100 border-slate-700"
            })
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-slate-100">Send Feedback</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Help us improve Mindkeeper AI. Your feedback matters!
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <RadioGroup
                        defaultValue="feedback"
                        onValueChange={(value) => setFeedbackType(value as 'bug' | 'feedback')}
                        className="flex flex-row space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="feedback" id="feedback" className="border-slate-600" />
                            <Label htmlFor="feedback" className="text-slate-300">Feedback</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bug" id="bug" className="border-slate-600" />
                            <Label htmlFor="bug" className="text-slate-300">Report Bug</Label>
                        </div>
                    </RadioGroup>

                    <Textarea
                        placeholder={feedbackType === 'bug' ?
                            "What went wrong? Steps to reproduce the issue..." :
                            "Share your thoughts, ideas, or suggestions..."}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-32 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        required
                    />

                    <div className="space-y-2">
                        <Label htmlFor="file" className="block text-slate-300">
                            Attach Screenshot/Video (optional)
                        </Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="file"
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('file')?.click()}
                                className="w-full bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {file ? file.name : 'Choose File'}
                            </Button>
                            {file && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Max file size: 4MB</p>
                    </div>

                    <div className="space-y-2">

                        <p className="text-sm text-slate-500">
                            Or email us directly at{' '}
                            <a
                                href="mailto:soham.ratnaparkhi@mindkeeperai.com"
                                className="text-blue-400 hover:text-blue-300"
                            >
                                soham.ratnaparkhi@mindkeeperai.com
                            </a>
                        </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Submit Feedback
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}