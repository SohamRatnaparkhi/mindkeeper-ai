"use client";
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AnimatedBeamUniDir } from '../AnimatedBeamUniDir';
import CarouselControls from './CarouselControls';
import { LiveQueryDisplay } from './LiveQueyDisplay';
import { TypewriterText } from './TypewritterText';

const Carousel = ({
    aspectRatio = '16/9'
}) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const intervalRef = useRef<NodeJS.Timeout>();
    const [isStopped, setIsStopped] = useState(false);

    const [DURATIONS, setDURATIONS] = useState({
        IMAGE: 15,
        VIDEO: 32
    });

    useEffect(() => {
        if (aspectRatio === '9/16') {
            setDURATIONS({
                IMAGE: 15,
                VIDEO: 45
            })
        }
    }, [aspectRatio]);

    useEffect(() => {
        const startTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);

            setTimeLeft(activeSlide === 0 ? DURATIONS.IMAGE : DURATIONS.VIDEO);

            if (!isStopped) {  // Only start new timers if not stopped
                intervalRef.current = setInterval(() => {
                    setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
                }, 1000);

                timeoutRef.current = setTimeout(() => {
                    setActiveSlide(prev => (prev === 0 ? 1 : 0));
                }, (activeSlide === 0 ? DURATIONS.IMAGE : DURATIONS.VIDEO) * 1000);
            }
        };

        startTimer();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [activeSlide, isStopped]);

    useEffect(() => {
        if (activeSlide === 1 && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(console.error);
        }
    }, [activeSlide]);

    useEffect(() => {
        if (!videoRef.current) return;

        if (isStopped) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(console.error);
        }
    }, [isStopped]);

    return (
        <div style={{ width: '100%', aspectRatio: aspectRatio }} className="relative bg-gradient-to-br mt-6 from-[#0A081A] to-[#1A0F2F] max-w-4xl mx-auto flex items-center justify-center p-8 rounded-3xl">
            {/* TV Frame Container */}
            <div className="absolute inset-0 rounded-[20px] border-2 border-[#0A081A] shadow-[
    inset_0_45px_60px_-30px_rgba(152,85,255,0.2),  // Top inner glow
    inset_0_-30px_40px_-30px_rgba(0,0,0,0.6),      // Bottom inner darkness
    0_25px_60px_-15px_rgba(152,85,255,0.3),        // Top outer glow
    0_50px_80px_-30px_rgba(152,85,255,0.15)        // Bottom outer fade
] overflow-hidden z-10">

                {/* Top Bar */}
                {aspectRatio == '16/9' && <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#1A0F2F] to-[#0A081A] border-b-2 border-[#9855FF]/30 flex items-center px-4 z-20">
                    <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_3px_#FF5F56]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_3px_#FFBD2E]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_0_3px_#27C93F]"></div>
                    </div>
                </div>}

                {/* Main Content Area */}
                <div className={`${aspectRatio == '16/9' ? 'pt-8' : ''} h-full w-full relative bg-gradient-to-b from-black via-slate-900 to-slate-800`}>
                    {/* Media Container with Safe Area */}
                    <div className="h-full w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent" />

                        {/* Animated Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)]" />

                        {/* Content Container */}
                        <div className="flex flex-col justify-evenly gap-4 container mx-auto px-4 my-auto">
                            {/* Tagline Section */}
                            <div className="mb-4 md:mb-8 pt-6">
                                <TypewriterText className='z-30 text-2xl md:text-4xl' text="Connect and search across all your tools" isVisible={true} />
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="text-sm md:text-lg text-gray-400 text-center mt-3 max-w-2xl mx-auto"
                                >
                                    Seamlessly integrate and search through all your workspace tools in one place.
                                </motion.p>
                            </div>

                            {/* Media Container with Safe Area */}
                            <div className="h-full w-full relative overflow-hidden">
                                {/* Beam Animation */}
                                <div className="transition-opacity duration-1000 opacity">
                                    <AnimatedBeamUniDir initIndex={0} isMobile={
                                        aspectRatio == '9/16'
                                    } />
                                </div>
                            </div>
                            <div className='sm:hidden mt-2'>
                                <LiveQueryDisplay />
                            </div>
                        </div>


                        {/* Video Slide - Properly contained below top bar */}
                        <div className={`absolute inset-0 transition-opacity duration-1000 ${activeSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
                            <video
                                ref={videoRef}
                                className="w-full h-full object-fill"
                                muted
                                loop
                                playsInline
                                // use isStoped to pause video and continue it
                                autoPlay={!isStopped}
                            >
                                <source src={aspectRatio == '16/9' ? "https://dkedzrt1xmtkb.cloudfront.net/public/homepage/mk4_edit.mp4" : "https://dkedzrt1xmtkb.cloudfront.net/public/homepage/mk_mobile_final.mp4"} />
                                {/* <source src={aspectRatio == '16/9' ? "/homepage/mk4_edit.mp4" : "/homepage/mk_mobile_final.mp4"} /> */}
                            </video>
                        </div>
                    </div>

                    {/* Visual Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_30px_5px_rgba(0,0,0,0.5)]"></div>
                    </div>

                    {/* Controls */}
                    <CarouselControls
                        DURATIONS={DURATIONS}
                        activeSlide={activeSlide}
                        isStopped={isStopped}
                        setActiveSlide={setActiveSlide}
                        setIsStopped={setIsStopped}
                        setTimeLeft={setTimeLeft}
                        timeoutRef={timeoutRef}
                        videoRef={videoRef}
                    />

                    {/* Countdown Timer */}
                    {activeSlide == 1 && <div className="absolute top-10 right-4 text-purple-300 text-sm bg-[#1E1434]/90 px-3 py-1 rounded-lg backdrop-blur-sm border border-[#9855FF]/30 z-20">
                        {`${timeLeft}s`}
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default Carousel;