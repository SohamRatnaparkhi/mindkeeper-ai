import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useCases } from './configs';

interface UseCase {
    title: string;
    description: string;
    benefit: string;
}

interface MobileCarouselProps {
    className?: string;
    onCardClick?: (useCase: UseCase) => void;
}

const MobileUsecasesCarousel: React.FC<MobileCarouselProps> = ({
    className = '',
    onCardClick = () => { }
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % useCases.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + useCases.length) % useCases.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
        setIsPaused(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        const SWIPE_THRESHOLD = 50;
        if (touchStart - touchEnd > SWIPE_THRESHOLD) {
            nextSlide();
        }
        if (touchStart - touchEnd < -SWIPE_THRESHOLD) {
            prevSlide();
        }
        setIsPaused(false);
    };

    // Auto-play functionality
    useEffect(() => {
        if (!isPaused) {
            autoPlayRef.current = setInterval(() => {
                nextSlide();
            }, 3000);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isPaused]);

    return (
        <div className={`md:hidden relative ${className} max-w-7xl `}>
            {/* Navigation Dots */}
            <div className="absolute -top-6 left-0 right-0 flex justify-center gap-1.5">
                {useCases.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 
              ${idx === currentIndex ? 'bg-purple-500 w-4' : 'bg-purple-500/40'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Carousel Container */}
            <div
                className="overflow-hidden touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {useCases.map((useCase, idx) => (
                        <div
                            key={idx}
                            className="w-full flex-shrink-0 px-4"
                            onClick={() => onCardClick(useCase)}
                        >
                            <div className="p-6 w-96 rounded-xl backdrop-blur-sm 
                bg-gradient-to-b sm:bg-gradient-to-r from-black to-[#371866] 
                transition-all duration-300 active:scale-95
                border border-purple-500/20"
                            >
                                <h3 className="text-xl font-bold text-white mb-3 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    {useCase.title}
                                </h3>
                                <p className="text-sm text-gray-300 mb-3">{useCase.description}</p>
                                <div className="pt-3 border-t border-purple-500/20">
                                    <p className="text-purple-300 text-xs font-semibold mb-1">Benefits:</p>
                                    <p className="text-gray-300 text-xs">{useCase.benefit}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full 
          bg-purple-900/70 border border-purple-500/30 backdrop-blur-sm 
          flex items-center justify-center hover:bg-purple-800/70 transition-all z-10"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full 
          bg-purple-900/70 border border-purple-500/30 backdrop-blur-sm 
          flex items-center justify-center hover:bg-purple-800/70 transition-all z-10"
                aria-label="Next slide"
            >
                <ChevronRight className="w-4 h-4 text-white" />
            </button>
        </div>
    );
};

export default MobileUsecasesCarousel;