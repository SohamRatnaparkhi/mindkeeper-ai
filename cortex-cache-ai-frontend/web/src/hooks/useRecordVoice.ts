import { useEffect, useRef, useState } from "react";

interface UseRecordVoiceReturn {
    recording: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    text: string;
    error: string | null;
    isInitialized: boolean;
    initializeRecording: () => Promise<void>;
}

export const useRecordVoice = (): UseRecordVoiceReturn => {
    const [text, setText] = useState<string>("");
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recording, setRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const chunks = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const initializeRecording = async (): Promise<void> => {
        console.log("Initializing recording...");
        try {
            // Stop any existing stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                console.log("Data available:", e.data.size);
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            recorder.onstart = () => {
                console.log("Started recording");
                setRecording(true);
                setError(null);
                chunks.current = [];
            };

            recorder.onstop = async () => {
                console.log("Stopped recording");
                setRecording(false);

                if (chunks.current.length > 0) {
                    const blob = new Blob(chunks.current, { type: 'audio/webm' });
                    console.log("Processing audio blob:", blob.size);

                    const formData = new FormData();
                    formData.append('audio', blob);

                    try {
                        const response = await fetch('/api/speechToText', {
                            method: 'POST',
                            body: formData
                        });

                        const data = await response.json();
                        if (data.text) {
                            setText(prev => prev + ' ' + data.text);
                        }
                    } catch (err) {
                        console.error("API error:", err);
                        setError('Failed to convert speech to text');
                    }
                }
            };

            setMediaRecorder(recorder);
            setIsInitialized(true);
            setError(null);
            console.log("Recording initialized successfully");
        } catch (err) {
            console.error("Initialization error:", err);
            setError('Failed to access microphone');
            setIsInitialized(false);
        }
    };

    const startRecording = async () => {
        console.log("Starting recording...");
        if (!isInitialized || !mediaRecorder) {
            await initializeRecording();
        }

        if (mediaRecorder && !recording) {
            try {
                mediaRecorder.start(1000); // Collect data every second
                console.log("Started mediaRecorder");
            } catch (err) {
                console.error("Start recording error:", err);
                setError('Failed to start recording');
            }
        }
    };

    const stopRecording = () => {
        console.log("Stopping recording...");
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            try {
                mediaRecorder.stop();
                console.log("Stopped mediaRecorder");
            } catch (err) {
                console.error("Stop recording error:", err);
                setError('Failed to stop recording');
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return {
        recording,
        startRecording,
        stopRecording,
        text,
        error,
        isInitialized,
        initializeRecording
    };
};