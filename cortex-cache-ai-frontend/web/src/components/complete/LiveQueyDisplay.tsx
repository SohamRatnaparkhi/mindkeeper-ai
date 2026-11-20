import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Circle, Icons } from '../AnimatedBeamUniDir';

export const LiveQueryDisplay = () => {
    type IconPlatform = keyof typeof Icons;

    const queries = [
        { platform: "googleDrive" as IconPlatform, query: "Q4 Marketing Deck" },
        { platform: "notion" as IconPlatform, query: "Team-A Sprint Plans" },
        { platform: "web" as IconPlatform, query: "Explain Lambda Functions" },
        { platform: "youtube" as IconPlatform, query: "Key points from Elon's podcast" },
        { platform: "files" as IconPlatform, query: "Explain Design Patterns ch.4" },
        { platform: "github" as IconPlatform, query: "Auth Branch PRs" }
    ];

    // Calculate number of pairs
    const numPairs = Math.floor(queries.length / 2);

    const [pairIndex, setPairIndex] = useState(0);
    const [visibleQueries, setVisibleQueries] = useState([
        {
            id: Date.now(),
            ...queries[0]
        },
        {
            id: Date.now() + 1,
            ...queries[1]
        }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPairIndex(prev => {
                const nextIndex = (prev + 1) % numPairs;
                const firstQueryIndex = nextIndex * 2;
                const secondQueryIndex = firstQueryIndex + 1;

                setVisibleQueries([
                    {
                        id: Date.now(),
                        ...queries[firstQueryIndex]
                    },
                    {
                        id: Date.now() + 1,
                        ...queries[secondQueryIndex]
                    }
                ]);

                return nextIndex;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="my-2 mt-4">
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {visibleQueries.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                height: 'auto',
                            }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1
                            }}
                            className={cn(
                                "flex items-center gap-3",
                                "py-2 px-4 rounded-lg",
                                "border-l-2",
                                index === 0
                                    ? "border-l-white/60 bg-white/10"
                                    : "border-l-white/20 bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={cn(
                                    "text-sm font-medium whitespace-nowrap",
                                    index === 0 ? "text-white/90" : "text-white/60"
                                )}>

                                    {/* Icons[item.platform]() */}
                                    <Circle className="size-9" >
                                        {Icons[item.platform]()}
                                    </Circle>

                                </span>
                                {/* <span className="text-white/20">→</span> */}
                                <span className={cn(
                                    "text-sm truncate",
                                    index === 0 ? "text-white/90" : "text-white/60"
                                )}>
                                    {item.query}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default LiveQueryDisplay;