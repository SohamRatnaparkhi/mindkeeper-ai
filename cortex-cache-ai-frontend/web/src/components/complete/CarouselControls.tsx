import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';

interface CarouselControlsProps {
    activeSlide: number;
    isStopped: boolean;
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
    videoRef: React.RefObject<HTMLVideoElement>;
    setActiveSlide: (slide: number) => void;
    setTimeLeft: (time: number) => void;
    setIsStopped: (stopped: boolean) => void;
    DURATIONS: { IMAGE: number; VIDEO: number };
}

import React from 'react';

const SliderControls = ({
    activeSlide,
    isStopped,
    timeoutRef,
    videoRef,
    setActiveSlide,
    setTimeLeft,
    setIsStopped,
    DURATIONS
}: CarouselControlsProps) => {
    return (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {/* Progress indicators */}
            {[0, 1].map(index => (
                <button
                    key={index}
                    className="group"
                    onClick={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        if (index === 1 && videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play().catch(console.error);
                        }
                        setActiveSlide(index);
                        setTimeLeft(index === 0 ? DURATIONS.IMAGE : DURATIONS.VIDEO);
                    }}
                >
                    <div className={`
                        h-1 rounded-full transition-all duration-300 
                        hover:bg-[#9855FF] hover:shadow-[0_0_4px_#9855FF]
                        ${activeSlide === index
                            ? 'w-6 bg-[#9855FF] shadow-[0_0_4px_#9855FF]'
                            : 'w-3 bg-white/30'
                        }
                    `} />
                </button>
            ))}

            {/* Play/Pause button */}
            {activeSlide === 1 && <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setIsStopped(!isStopped)}
            >
                {isStopped ? (
                    <Play className="w-4 h-4 text-white" />
                ) : (
                    <Pause className="w-4 h-4 text-white" />
                )}
            </motion.button>}
        </div>
    );
};

export default SliderControls;