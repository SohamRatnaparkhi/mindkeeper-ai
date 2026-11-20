import { addMemoryBasedOnContentType } from "@/actions/memory-adder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@prisma/client";
import { Loader2, Mic, MicOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
interface VoiceInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string) => void;
    currentUser: User;
}

interface SpeechToTextResponse {
    text: string;
    error?: string;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, onSave, currentUser }) => {
    const [content, setContent] = useState<string>('');
    const [recording, setRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [volume, setVolume] = useState<number>(0);
    const [processing, setProcessing] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<boolean>(false);
    const [recordingInitiated, setRecordingInitiated] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const { toast } = useToast()

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyzer = useRef<AnalyserNode | null>(null);
    const dataArray = useRef<Uint8Array | null>(null);
    const animationFrame = useRef<number | null>(null);
    const chunks = useRef<Blob[]>([]);
    const spacebarPressed = useRef<boolean>(false);

    const analyzeVolume = () => {
        if (analyzer.current && dataArray.current) {
            analyzer.current.getByteFrequencyData(dataArray.current);
            const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
            const normalizedVolume = Math.min(100, (average / 128) * 100);
            setVolume(normalizedVolume);
            animationFrame.current = requestAnimationFrame(analyzeVolume);
        }
    };

    const setupAudioAnalyzer = (stream: MediaStream) => {
        audioContext.current = new AudioContext();
        analyzer.current = audioContext.current.createAnalyser();
        analyzer.current.fftSize = 256;
        const source = audioContext.current.createMediaStreamSource(stream);
        source.connect(analyzer.current);
        dataArray.current = new Uint8Array(analyzer.current.frequencyBinCount);
        analyzeVolume();
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to convert to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const cleanupAudioResources = () => {
        if (mediaRecorder.current?.state === 'recording') {
            mediaRecorder.current.stop();
        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
        if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
        }
        setMicPermission(false);
        setRecording(false);
        setVolume(0);
    };

    const initializeRecording = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            mediaStream.current = stream;
            setupAudioAnalyzer(stream);
            setMicPermission(true);

            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            recorder.ondataavailable = (e: BlobEvent) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                setProcessing(true);
                try {
                    const blob = new Blob(chunks.current, { type: 'audio/webm' });
                    const base64Audio = await blobToBase64(blob);

                    const response = await fetch('/api/speechToText', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audio: base64Audio })
                    });

                    const data = await response.json() as SpeechToTextResponse;

                    if (data.error) throw new Error(data.error);
                    if (data.text) {
                        setContent(prev => prev + (prev ? ' ' : '') + data.text);
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to convert speech to text');
                } finally {
                    setProcessing(false);
                    chunks.current = [];
                    setRecording(false);
                    setVolume(0);
                }
            };

            mediaRecorder.current = recorder;
            setError(null);
        } catch (err) {
            setError('Failed to access microphone');
            setMicPermission(false);
        }
    };

    const startRecording = async (): Promise<void> => {
        if (!mediaRecorder.current || !mediaStream.current) {
            await initializeRecording();
        }

        if (mediaRecorder.current && !recording) {
            try {
                mediaRecorder.current.start(1000);
                setRecording(true);
                setError(null);
            } catch (err) {
                setError('Failed to start recording');
            }
        }
    };

    const stopRecording = (): void => {
        if (mediaRecorder.current?.state === 'recording') {
            mediaRecorder.current.stop();
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            initializeRecording();
        }
        return () => cleanupAudioResources();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            // Start recording with Ctrl + Space
            if (e.code === 'Space' && e.ctrlKey && !recording && !spacebarPressed.current) {
                e.preventDefault();
                await startRecording();
                setRecordingInitiated(true);
                spacebarPressed.current = true;
            }
            // Continue recording with Space after Ctrl+Space initiated it
            else if (e.code === 'Space' && recordingInitiated && !e.repeat && !spacebarPressed.current) {
                e.preventDefault();
                spacebarPressed.current = true;
                if (!recording) {
                    await startRecording();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            console.log(e.code)
            if (e.code === 'Space') {
                e.preventDefault();
                spacebarPressed.current = false;

                // Only stop if we're currently recording
                if (recording) {
                    stopRecording();
                }

                // If Ctrl key is not pressed, reset the recording initiated state
                if (!e.ctrlKey) {
                    setRecordingInitiated(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            setRecordingInitiated(false);
        };
    }, [isOpen]);

    const handleClose = async () => {
        if (recording) stopRecording();
        cleanupAudioResources();
        setContent('');
        setTitle('');
        setDescription('');
        setError(null);
        setRecordingInitiated(false);
        onClose();
    };

    const handleSave = async () => {
        if (recording) stopRecording();
        onSave(content);
        setContent('');
        const { data: _, status } = await addMemoryBasedOnContentType(
            "note",
            {
                title,
                description,
                ["tags"]: [],
                link: content
            },
            "low-priority-queue",
            currentUser?.id as string,
            ""
        )
        if (status === 200) {
            // alert('Memory added successfully.')
            toast({
                title: 'Memory will soon be added. ',
                description: 'You will receive an email once it is done. By then you can continue adding more memories!.',
                duration: 15000,
                className: 'bg-green-500 text-white'
            })
        } else {
            alert('Failed to add memory.')
            toast({
                title: 'Failed to add memory.',
                description: 'Failed to add memory.',
                duration: 5000,
                className: 'bg-red-500 text-white'
            })
        }
        handleClose();
    };

    const handleMicClick = async (): Promise<void> => {
        if (recording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-sm border-slate-800 p-4 md:p-6">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Quick Note</span>
                    </DialogTitle>
                    {(recording || processing) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            {recording && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-red-500 animate-pulse">Recording...</span>
                                </div>
                            )}
                            {processing && (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                    <span className="text-purple-500">Processing...</span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                            <div className={`
                                absolute -inset-0.5 rounded-full 
                                ${recording ? 'bg-gradient-to-br from-red-500 to-orange-500 animate-pulse' :
                                    'bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-600 group-hover:to-pink-600'}
                                blur opacity-30 group-hover:opacity-50 transition
                            `} />
                            <button
                                onClick={handleMicClick}
                                disabled={!micPermission || processing}
                                className={`
                                    relative flex items-center justify-center
                                    h-20 w-20 rounded-full transition-all duration-300
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${recording
                                        ? 'bg-slate-900 text-red-500 border-2 border-red-500 hover:bg-slate-800'
                                        : 'bg-slate-800 text-purple-400 hover:text-purple-300 hover:bg-slate-700'}
                                `}
                            >
                                {recording ? (
                                    <MicOff className="h-8 w-8" />
                                ) : (
                                    <Mic className="h-8 w-8" />
                                )}
                            </button>

                            {recording && (
                                <div className="absolute -bottom-8 w-full flex justify-center">
                                    <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
                                            style={{ width: `${volume}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-center mt-8">
                            <div className="text-slate-400">
                                {recording ? (
                                    <p className="animate-pulse">Recording... Click mic to stop</p>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-purple-400">Press Ctrl + Space or Mic to start recording</p>
                                        <p className="text-xs text-slate-500">Hold spacebar to continue</p>
                                        <p className="text-xs text-slate-500">or click mic to stop recording</p>
                                    </div>
                                )}
                            </div>
                            {error && (
                                <div className="mt-2 p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Input
                            placeholder="Title *"
                            value={title}
                            required={true}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-800 text-gray-300 border-gray-700"
                        />
                        {/* <Input
                                        placeholder="Tags (comma-separated)"
                                        value={tags.join(', ')}
                                        onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
                                        className="w-full bg-gray-800 text-gray-300 border-gray-700"
                                    /> */}
                        <Textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[100px] bg-gray-800 text-gray-300 border-gray-700"
                        />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-48 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg 
                                     resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                                     placeholder-slate-500 transition-all"
                            placeholder="Your recorded text will appear here..."
                            disabled={recording || processing}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={recording || processing}
                            className="border-slate-700 hover:bg-slate-800 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!content.trim() || recording || processing || title === ''}
                            className="bg-purple-500 hover:bg-purple-600 text-white disabled:bg-purple-500/50"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VoiceInputModal;