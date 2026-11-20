import { motion } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'
import { FeatureIcon } from './FeatureIcon'

export function ExploreMemoriesStep() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
        >
            <FeatureIcon icon={BookOpen} />
            <motion.h2
                className="text-3xl font-bold text-slate-100 mt-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                Exploring Memories
            </motion.h2>
            <motion.div
                className="text-slate-300 text-left max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Viewing Memories</h3>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            <span>Click the Book icon in sidebar to view all memories</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Search Features</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-green-400" />
                                <span>Search by memory title</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-purple-400" />
                                <span>AI Search: Use keywords or descriptions to find memories</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Chat with Memories</h3>
                        <p>Click on any memory to start a focused conversation using its contents</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}