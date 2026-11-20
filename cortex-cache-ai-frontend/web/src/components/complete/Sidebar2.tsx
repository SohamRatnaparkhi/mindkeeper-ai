import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import ConvoHistoryByMemory from "./ConvoHistoryByMemory";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
    memId: string;
}

export default function Sidebar2({ isOpen, toggleSidebar, isMobile, memId }: SidebarProps) {
    return (
        <div>
            {/* Closed State Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="fixed top-1/2 right-0 -translate-y-1/2 z-50"
                    >
                        <div className="bg-gray-900 rounded-l-lg shadow-lg">
                            <button
                                onClick={toggleSidebar}
                                className="flex flex-col items-center gap-4 p-3 text-gray-300 hover:text-white transition-colors"
                            >
                                <Search size={20} />
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed top-0 right-0 h-full w-80 bg-gray-900 z-40 shadow-lg"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Chevron Control */}
                            <div className="absolute top-1/2 -left-4 -translate-y-1/2">
                                <button
                                    onClick={toggleSidebar}
                                    className="flex items-center justify-center w-8 h-16 bg-gray-900 rounded-l-lg text-gray-300 hover:text-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Conversation History */}
                            <ConvoHistoryByMemory memId={memId} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}