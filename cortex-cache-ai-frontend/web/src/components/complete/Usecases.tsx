import React, { useEffect, useRef, useState } from 'react';
import { UseCase, useCases } from './configs';



const QuickNav: React.FC<{
    cases: UseCase[];
    onSelect: (index: number) => void;
    currentIndex: number;
}> = ({ cases, onSelect, currentIndex }) => {
    return (
        <div className="hidden md:flex justify-center mb-8 flex-wrap gap-2">
            {cases.map((useCase, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(idx)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-300
  ${currentIndex === idx
                            ? 'bg-gradient-to-r from-[#371866] via-purple-700 to-[#371866] text-white scale-105'
                            : 'bg-purple-900/40 hover:bg-gradient-to-r hover:from-[#371866] hover:to-purple-600 text-gray-300 hover:text-white'
                        } border border-purple-500/30 backdrop-blur-sm`}
                >
                    {useCase.title}
                </button>
            ))}
        </div>
    );
};

const UseCasesSection: React.FC = () => {
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoScrollPosition, setAutoScrollPosition] = useState(0);
    const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const updateCurrentIndex = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const cardWidth = 400;
            const centerOffset = scrollRef.current.offsetWidth / 2;
            const centerPosition = scrollLeft + centerOffset;
            const newIndex = Math.floor((centerPosition - (cardWidth / 2)) / cardWidth) % useCases.length;

            if (newIndex >= 0 && newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
                setAutoScrollPosition(scrollLeft);
            }
        }
    };

    const scrollToIndex = (index: number) => {
        if (scrollRef.current) {
            const cardWidth = 400;
            const containerWidth = scrollRef.current.offsetWidth;
            const scrollPosition = (index * cardWidth) - (containerWidth / 2) + (cardWidth / 2);

            // Clear any existing timeout
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
            }

            // Temporarily pause scrolling
            setIsPaused(true);

            scrollRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });

            setCurrentIndex(index);
            setAutoScrollPosition(scrollPosition);

            // Resume scrolling after animation completes
            pauseTimeoutRef.current = setTimeout(() => {
                setIsPaused(false);
            }, 1000); // Adjust timing to match scroll-behavior: smooth duration
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        const newIndex = direction === 'left'
            ? (currentIndex - 1 + useCases.length) % useCases.length
            : (currentIndex + 1) % useCases.length;
        scrollToIndex(newIndex);
    };

    useEffect(() => {
        const scroll = scrollRef.current;
        let animationId: number | undefined;
        let lastUpdate = 0;

        const animate = (timestamp: number) => {
            if (!isPaused && scroll) {
                if (timestamp - lastUpdate > 20) {
                    setAutoScrollPosition(prev => {
                        const newPosition = prev + 1;

                        if (newPosition >= scroll.scrollWidth / 2) {
                            return 0;
                        }

                        scroll.scrollLeft = newPosition;
                        return newPosition;
                    });

                    lastUpdate = timestamp;
                }
                animationId = requestAnimationFrame(animate);
            }
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
            }
        };
    }, [isPaused]);

    useEffect(() => {
        const scroll = scrollRef.current;
        if (scroll) {
            const handleScroll = () => {
                requestAnimationFrame(() => {
                    updateCurrentIndex();
                });
            };

            scroll.addEventListener('scroll', handleScroll, { passive: true });
            return () => scroll.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div id='usecases' className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
                Optimize Any Workflow
            </h2>

            <QuickNav
                cases={useCases}
                onSelect={scrollToIndex}
                currentIndex={currentIndex}
            />

            <div className="hidden sm:flex">
                {/* <button
                    onClick={() => scroll('left')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-900/70 border border-purple-500/30 backdrop-blur-sm flex items-center justify-center hover:bg-purple-800/70 transition-all z-10"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-900/70 border border-purple-500/30 backdrop-blur-sm flex items-center justify-center hover:bg-purple-800/70 transition-all z-10"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button> */}

                <div
                    ref={scrollRef}
                    className="overflow-hidden relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="flex py-8">
                        {[...useCases, ...useCases].map((useCase, idx) => (
                            <div
                                key={`${useCase.title}-${idx}`}
                                className={`flex flex-col flex-shrink-0 w-96 p-8 mx-4 rounded-xl backdrop-blur-sm 
                  bg-gradient-to-b from-black to-[#371866] 
                  transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20`}
                            >
                                <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    {useCase.title}
                                </h3>
                                <p className="grow text-gray-300 mb-4">{useCase.description}</p>
                                <div className="mt-4 pt-4 border-t border-purple-500/20 bottom-1">
                                    <p className="text-purple-300 text-sm font-semibold mb-2">Benefits:</p>
                                    <p className="text-gray-300 text-sm">{useCase.benefit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UseCasesSection;