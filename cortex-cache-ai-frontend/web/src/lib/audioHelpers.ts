export interface AudioResponse {
    text: string;
    error?: string;
}

// types/audio.ts
export interface AudioResponse {
    text: string;
    error?: string;
}

// utils/audioHelpers.ts
export const blobToBase64 = (blob: Blob, callback: (base64data: string) => void): void => {
    const reader = new FileReader();
    reader.onload = function () {
        const base64data = reader?.result?.toString().split(",")[1];
        if (base64data) {
            callback(base64data);
        }
    };
    reader.readAsDataURL(blob);
};

export const getPeakLevel = (analyzer: AnalyserNode): number => {
    const array = new Uint8Array(analyzer.fftSize);
    analyzer.getByteTimeDomainData(array);
    return (
        array.reduce((max, current) => Math.max(max, Math.abs(current - 127)), 0) /
        128
    );
};

export const createMediaStream = (
    stream: MediaStream,
    isRecording: boolean,
    callback: (level: number) => void
): void => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyzer = context.createAnalyser();
    source.connect(analyzer);

    const tick = () => {
        const peak = getPeakLevel(analyzer);
        if (isRecording) {
            callback(peak);
            requestAnimationFrame(tick);
        }
    };

    tick();
};