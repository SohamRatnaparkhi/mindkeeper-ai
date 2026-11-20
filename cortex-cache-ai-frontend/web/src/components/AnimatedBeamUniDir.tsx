"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import { DriveIcon, NotionIcon, YouTubeIcon } from "./conversation/CustomeIcons";

interface SearchBarProps {
    query: string;
    platform: string;
    position?: string;
    isActive?: boolean;
    hasBeenActivated?: boolean;
}

const SearchBar = ({ query, platform, position = 'right', isActive = false, hasBeenActivated = false }: SearchBarProps) => {
    const [currentQuery, setCurrentQuery] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (isActive) {
            const animateText = async () => {
                for (let i = 0; i <= query.length; i++) {
                    setCurrentQuery(query.slice(0, i));
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                setIsComplete(true);
            };
            animateText();
        } else if (hasBeenActivated && isComplete) {
            setCurrentQuery(query);
        }
    }, [isActive, query, hasBeenActivated]);

    const displayText = isActive
        ? currentQuery
        : hasBeenActivated
            ? currentQuery.slice(0, 35) + (currentQuery.length > 35 ? '...' : '')
            : currentQuery;

    return (
        <div className={cn(
            "absolute top-1/2 -translate-y-1/2",
            "backdrop-blur-md",
            "rounded-lg",
            "shadow-lg shadow-black/20",
            "border border-white/10",
            "transition-all duration-300",
            position === 'right' ? "left-full ml-4" : "right-full mr-4",
            // Container size based on state
            isActive ? (
                "min-w-48 max-w-64 px-4 py-2 bg-black/60"
            ) : hasBeenActivated ? (
                "min-w-40 max-w-48 px-3 py-1.5 bg-black/40"
            ) : (
                "min-w-32 max-w-40 px-2 py-1 bg-black/40 scale-90 origin-left"
            ),
            isActive ? "border-white/30 text-white" :
                hasBeenActivated ? "text-white/80" : "text-white/60"
        )}>
            <div className="flex items-center gap-2">
                <div className={cn(
                    "flex-shrink-0 rounded-full transition-all duration-300",
                    isActive ? "hidden" :
                        hasBeenActivated ? "w-1.5 h-1.5 bg-white/60" : "w-1.5 h-1.5 bg-white/40"
                )} />
                {
                    isActive ? <Search size={10} /> : null
                }
                <motion.div
                    className={cn(
                        "overflow-hidden whitespace-nowrap transition-all duration-300",
                        isActive ? "text-sm" : hasBeenActivated ? "text-xs" : "text-xs"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="block truncate">
                        {displayText}
                    </span>
                </motion.div>
            </div>
        </div>
    );
};


interface CircleProps {
    className?: string;
    children: React.ReactNode;
}

export const Circle = forwardRef<HTMLDivElement, CircleProps>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "relative flex size-8 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className,
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

export function AnimatedBeamUniDir({ initIndex, isMobile }: {
    initIndex: number;
    isMobile?: boolean;
}) {
    const containerRef = useRef(null);
    const div1Ref = useRef(null);
    const div2Ref = useRef(null);
    const div3Ref = useRef(null);
    const div4Ref = useRef(null);
    const div5Ref = useRef(null);
    const div6Ref = useRef(null);
    const div7Ref = useRef(null);

    const [activeIndex, setActiveIndex] = useState(initIndex);
    const [activatedIndexes, setActivatedIndexes] = useState(new Set());

    const services = [
        {
            ref: div1Ref,
            query: "Q4 Marketing Deck",
            platform: "Drive",
            position: "left"
        },
        {
            ref: div2Ref,
            query: "Team-A Sprint Plans",
            platform: "Notion",
            position: "left"
        },
        {
            ref: div3Ref,
            query: "Explain Lambda Functions from docs",
            platform: "Web",
            position: "left"
        },
        {
            ref: div5Ref,
            query: "Key points from Elon's podcast",
            platform: "YouTube",
            position: "right"
        },
        {
            ref: div6Ref,
            query: "Explain Ch. 3 from Atomic Habits",
            platform: "Files",
            position: "right"
        },
        {
            ref: div7Ref,
            query: "Auth Branch PRs",
            platform: "GitHub",
            position: "right"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => {
                const nextIndex = (prev + 1) % services.length;
                setActivatedIndexes(current => new Set([...Array.from(current), prev]));
                return nextIndex;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`relative flex ${isMobile ? 'h-[180px]' : 'h-[240px]'} w-full max-w-lg mx-auto items-center justify-center overflow-visible rounded-xl p-4`}
            ref={containerRef}>
            <div className="flex size-full my-2 flex-col max-w-[280px] max-h-[160px] items-stretch justify-between gap-6">
                <div className="flex flex-row items-center justify-between">
                    <div className="relative">
                        <SearchBar
                            query={services[0].query}
                            platform={services[0].platform}
                            position={services[0].position}
                            isActive={activeIndex === 0}
                            hasBeenActivated={activatedIndexes.has(0)}
                        />
                        <Circle ref={div1Ref}>
                            <Icons.googleDrive />
                        </Circle>
                    </div>
                    <div className="relative">
                        <Circle ref={div5Ref}>
                            <Icons.youtube />
                        </Circle>
                        <SearchBar
                            query={services[3].query}
                            platform={services[3].platform}
                            position={services[3].position}
                            isActive={activeIndex === 3}
                            hasBeenActivated={activatedIndexes.has(3)}
                        />
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between">
                    <div className="relative">
                        <Circle ref={div2Ref}>
                            <Icons.notion />
                        </Circle>
                        <SearchBar
                            query={services[1].query}
                            platform={services[1].platform}
                            position={services[1].position}
                            isActive={activeIndex === 1}
                            hasBeenActivated={activatedIndexes.has(1)}
                        />
                    </div>
                    <Circle ref={div4Ref} className="size-12 bg-black">
                        <Icons.mindkeeper />
                    </Circle>
                    <div className="relative">
                        <Circle ref={div6Ref}>
                            <Icons.files />
                        </Circle>
                        <SearchBar
                            query={services[4].query}
                            platform={services[4].platform}
                            position={services[4].position}
                            isActive={activeIndex === 4}
                            hasBeenActivated={activatedIndexes.has(4)}
                        />
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between">
                    <div className="relative">
                        <Circle ref={div3Ref}>
                            <Icons.web />
                        </Circle>
                        <SearchBar
                            query={services[2].query}
                            platform={services[2].platform}
                            position={services[2].position}
                            isActive={activeIndex === 2}
                            hasBeenActivated={activatedIndexes.has(2)}
                        />
                    </div>
                    <div className="relative">
                        <Circle ref={div7Ref}>
                            <Icons.github />
                        </Circle>
                        <SearchBar
                            query={services[5].query}
                            platform={services[5].platform}
                            position={services[5].position}
                            isActive={activeIndex === 5}
                            hasBeenActivated={activatedIndexes.has(5)}
                        />
                    </div>
                </div>
            </div>

            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div4Ref}
                curvature={-75}
                endYOffset={-10}
                pathWidth={1.5}
                pathColor="white"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div4Ref}
                pathWidth={1.5}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div4Ref}
                curvature={75}
                endYOffset={10}
                pathWidth={1.5}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={div4Ref}
                curvature={-75}
                endYOffset={-10}
                reverse
                pathWidth={1.5}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div4Ref}
                reverse
                pathWidth={1.5}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div7Ref}
                toRef={div4Ref}
                curvature={75}
                endYOffset={10}
                reverse
                pathWidth={1.5}
            />
        </div>
    );
}

export const Icons = {
    notion: () => (
        <NotionIcon />
    ),
    mindkeeper: () => (
        <Image
            src="/logo/final-no-name.png"
            alt="MindKeeper AI"
            width={100}
            height={100}
        />
    ),
    googleDrive: () => (
        <DriveIcon />
    ),
    web: () => (
        <Image
            src="/icons/web.svg"
            alt="Web"
            width={100}
            height={100} />
    ),
    youtube: () => (
        <YouTubeIcon className="text-red-500" />
    ),
    files: () => (
        <Image
            src="/icons/files.svg"
            alt="files"
            width={100}
            height={100}
        />
    ),
    github: () => (
        <GitHubLogoIcon
            width={36}
            height={36}
            className="text-black"
        />
    ),
};
