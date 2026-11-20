'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type ContentType = {
    icon: any;
    label: string;
    description: string;
    examples: string[];
    colors: {
        gradientFrom: string;
        gradientTo: string;
        borderColor: string;
        hoverBorderColor: string;
        iconColor: string;
        hoverIconColor: string;
        shadowColor: string;
    };
}

interface MobileContentCardProps extends ContentType {
    isSelected: boolean;
    onClick: () => void;
}

interface ContentTypeCardProps extends ContentType { }

interface ContentCarouselProps {
    contentTypes: ContentType[];
}

interface ResponsiveContentTypesProps {
    contentTypes: ContentType[];
}

const MobileContentCard: React.FC<MobileContentCardProps> = ({
    icon: Icon,
    label,
    description,
    examples,
    isSelected,
    onClick,
    colors
}) => {
    const controls = useAnimationControls();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    return (
        <motion.div
            onClick={onClick}
            initial="initial"
            animate={controls}
            onHoverStart={() => {
                setIsHovered(true);
                controls.start('hover');
            }}
            onHoverEnd={() => {
                setIsHovered(false);
                controls.start('initial');
            }}
            variants={{
                initial: {
                    scale: 1,
                    zIndex: 1,
                    transition: { duration: 0.3 }
                },
                hover: {
                    scale: 1.05,
                    zIndex: 10,
                    transition: { duration: 0.3 }
                }
            }}
            className="relative flex-shrink-0 w-48"
        >
            <motion.div
                className={`
                    flex flex-col items-center rounded-xl 
                    bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
                    backdrop-blur-sm border ${colors.borderColor}
                    transition-all duration-300 transform-gpu
                    ${isHovered || isSelected ? `${colors.hoverBorderColor} shadow-lg ${colors.shadowColor}` : ''}
                `}
            >
                <div className={`
                    p-4 flex flex-col items-center space-y-2
                    transition-all duration-300 relative
                    ${isSelected ? 'pb-2' : ''}
                `}>
                    <motion.div
                        variants={{
                            hover: {
                                y: -2,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }
                        }}
                        className="flex flex-col items-center"
                    >
                        <Icon className={`
                            w-6 h-6 transition-all duration-300
                            ${isSelected ? `${colors.hoverIconColor} scale-110` : colors.iconColor}
                        `} />
                    </motion.div>

                    <div className="flex items-center space-x-1.5">
                        <span className={`
                            text-sm font-medium transition-all duration-300
                            ${isSelected ? 'text-white' : 'text-gray-300'}
                        `}>
                            {label}
                        </span>
                        <motion.div
                            animate={{
                                rotate: isSelected ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className={`transition-colors duration-300 ${isSelected ? colors.hoverIconColor : colors.iconColor}`}
                        >
                            <ChevronDown size={16} />
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    variants={{
                        initial: {
                            opacity: 0,
                            height: 0,
                            padding: 0
                        },
                        selected: {
                            opacity: 1,
                            height: 'auto',
                            padding: '1rem',
                            transition: { duration: 0.3, ease: "easeOut" }
                        }
                    }}
                    initial="initial"
                    animate={isSelected ? "selected" : "initial"}
                    className={`w-full overflow-hidden border-t ${colors.borderColor}`}
                >
                    <p className={`text-xs mb-2 ${colors.hoverIconColor}`}>
                        {description}
                    </p>
                    <div className="space-y-1">
                        {examples.map((example, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className={`w-1 h-1 mt-1.5 rounded-full ${colors.iconColor}`} />
                                <p className={`text-xs ${colors.hoverIconColor}`}>{example}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
const ContentCarousel: React.FC<ContentCarouselProps> = ({ contentTypes }) => {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleCardClick = (index: number) => {
        if (selectedCard === index) {
            setSelectedCard(null);
            setIsAutoScrolling(true);
        } else {
            setSelectedCard(index);
            setIsAutoScrolling(false);
        }
    };

    const scrollTo = (index: number) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const cardWidth = (container.children[0] as HTMLDivElement).offsetWidth;
        container.scrollTo({
            left: index * cardWidth,
            behavior: 'smooth'
        });
        setCurrentIndex(index);
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const cardWidth = (container.children[0] as HTMLDivElement).offsetWidth;
        const index = Math.round(container.scrollLeft / cardWidth);
        setCurrentIndex(index);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoScrolling) {
            interval = setInterval(() => {
                const nextIndex = (currentIndex + 1) % contentTypes.length;
                scrollTo(nextIndex);
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [currentIndex, isAutoScrolling, contentTypes.length]);

    return (
        <div className="relative">
            <div className="relative overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {contentTypes.map((content, index) => (
                        <div key={index} className="snap-center px-2">
                            <MobileContentCard
                                {...content}
                                isSelected={selectedCard === index}
                                onClick={() => handleCardClick(index)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center mt-4 space-x-2">
                {contentTypes.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            scrollTo(index);
                            setIsAutoScrolling(false);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-purple-500 w-4' : 'bg-purple-500/30'
                            }`}
                    />
                ))}
            </div>

            {/* <button
                onClick={() => scrollTo((currentIndex - 1 + contentTypes.length) % contentTypes.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-purple-900/40 rounded-full border border-purple-500/20"
            >
                <ChevronLeft className="w-4 h-4 text-purple-200" />
            </button>
            <button
                onClick={() => scrollTo((currentIndex + 1) % contentTypes.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-purple-900/40 rounded-full border border-purple-500/20"
            >
                <ChevronRight className="w-4 h-4 text-purple-200" />
            </button> */}
        </div>
    );
};

// Main component with responsive layout
const ResponsiveContentTypes: React.FC<ResponsiveContentTypesProps> = ({ contentTypes }) => {
    return (
        <div className="mt-16 text-center  mx-auto">
            {/* Desktop View */}
            <div className="relative w-full">
                {/* Main gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />

                <div className="hidden lg:flex gap-6 relative">
                    {/* Left Card */}
                    <div className="w-full sm:w-1/3 p-6 rounded-lg border border-gray-800 bg-black relative overflow-hidden">
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                        {/* Content container */}
                        <div className="relative flex flex-col items-center">
                            {/* Image with tighter dimensions */}
                            <div className="w-3/4 h-3/4 mb-3">
                                <img
                                    src="./homepage/image.png"
                                    alt="MindKeeper AI"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Main heading - smaller and tighter spacing */}
                            <h3 className="text-lg font-semibold text-white mb-1.5">
                                Upload Once, Chat Forever
                            </h3>

                            {/* Description - styled as caption */}
                            <p className="text-sm text-slate-300 text-center leading-relaxed">
                                Everything you add gets stored in this digital brain that <span className='text-md text-white font-bold'>never forgets</span>.
                                Ask questions and get accurate answers from <span className='text-md text-white font-bold'>YOUR</span> data.
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="w-full sm:w-2/3 relative">
                        {/* Outer gradient with darker purple shades */}
                        <div className="bg-gradient-to-b from-black to-[#371866] p-1 rounded-lg min-h-[450px]">
                            {/* Inner darker gradient */}
                            <div className="bg-gradient-to-b from-black to-transparent rounded-lg w-11/12 h-[75%] absolute right-1 top-1">
                                <div className="p-6 relative h-full">
                                    {/* Dashboard Preview */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-white mb-2">Files, Web pages, Integrations and more...</h3>
                                        <p className="text-gray-300">
                                            Add anything you would want to add in your physical brain, MindKeeper digests it all.
                                        </p>
                                    </div>
                                    {/* Cards Grid */}
                                    <div className="hidden md:grid md:grid-cols-4 gap-4 max-w-full pr-4">
                                        {contentTypes?.map(({ description, icon, label, examples, colors }) => (
                                            <ContentTypeCard
                                                key={label}
                                                description={description}
                                                icon={icon}
                                                label={label}
                                                examples={examples}
                                                colors={colors}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* <div className="absolute bottom-8 left-8 max-w-sm">
                                <p className="text-gray-300 text-sm">
                                    
                                </p>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:hidden">
                <ContentCarousel contentTypes={contentTypes} />
            </div>
        </div>
    );
};

interface ContentTypeCardProps {
    icon: any
    label: string
    description: string
    examples: string[]
}

const ContentTypeCard = ({ icon: Icon, label, description, examples, colors }: ContentTypeCardProps) => {
    const controls = useAnimationControls()
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            initial="initial"
            animate={controls}
            onHoverStart={() => {
                setIsHovered(true)
                controls.start('hover')
            }}
            onHoverEnd={() => {
                setIsHovered(false)
                controls.start('initial')
            }}
            variants={{
                initial: {
                    scale: 1,
                    zIndex: 1,
                    transition: { duration: 0.3 }
                },
                hover: {
                    scale: 1.1,
                    zIndex: 10,
                    transition: { duration: 0.3 }
                }
            }}
            className="relative"
        >
            <motion.div
                className={`
                    flex flex-col items-center rounded-xl 
                    bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
                    backdrop-blur-sm border border-purple-500/20 ${colors.borderColor}
                    transition-all duration-300 transform-gpu 
                    ${isHovered ? 'border-purple-500/40 shadow-lg shadow-purple-500/20' : ''}
                `}
            >
                {/* Base Content (Always Visible) */}
                <div className={`
                    p-4 flex flex-col items-center space-y-2
                    transition-all duration-300
                    ${isHovered ? 'pb-2' : ''}
                `}>
                    <motion.div
                        variants={{
                            hover: {
                                y: -2,
                                transition: {
                                    duration: 0.2,
                                    ease: "easeOut"
                                }
                            }
                        }}
                    >
                        <Icon className={`
                            w-6 h-6 transition-all duration-300 ${colors.iconColor}
                            ${isHovered ? 'scale-110' : ''}
                        `} />
                    </motion.div>

                    <span className={`
                        text-sm font-medium transition-all duration-300
                        ${isHovered ? 'text-white' : 'text-gray-300'}
                    `}>
                        {label}
                    </span>
                </div>

                {/* Expanded Content (Visible on Hover) */}
                <motion.div
                    variants={{
                        initial: {
                            opacity: 0,
                            height: 0,
                            padding: 0
                        },
                        hover: {
                            opacity: 1,
                            height: 'auto',
                            padding: '1rem',
                            transition: {
                                duration: 0.3,
                                ease: "easeOut"
                            }
                        }
                    }}
                    className="w-full overflow-hidden border-t border-purple-500/20"
                >
                    <p className="text-xs text-purple-200/90 mb-2">
                        {description}
                    </p>
                    <div className="space-y-1">
                        {examples.map((example, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className="w-1 h-1 mt-1.5 rounded-full bg-purple-400/50" />
                                <p className="text-xs text-purple-200/70">{example}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export default ResponsiveContentTypes;