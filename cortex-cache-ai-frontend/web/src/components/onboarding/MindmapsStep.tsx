import { motion } from 'framer-motion'
import { BrainCircuit, Network, PlusCircle } from 'lucide-react'
import { FeatureIcon } from './FeatureIcon'

export function MindmapsStep() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
        >
            <FeatureIcon icon={Network} />
            <motion.h2
                className="text-3xl font-bold text-slate-100 mt-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                Creating Mindmaps
            </motion.h2>
            <motion.div
                className="text-slate-300 text-left max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Steps to Create Mindmaps</h3>
                        <ol className="space-y-3">
                            <li className="flex items-center gap-2">
                                <span className="flex gap-2">
                                    <PlusCircle className="w-5 h-5 text-blue-400" />
                                    <span>or</span>
                                    <BrainCircuit className="w-5 h-5 text-blue-400" />
                                </span>
                                <span>Click icons to start</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center text-blue-400">2</div>
                                <span>Go to the Mindmap Tab</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center text-blue-400">3</div>
                                <span>Select two or more related memories</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center text-blue-400">4</div>
                                <span>Add a title (required) and description (optional)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center text-blue-400">5</div>
                                <span>Click Create Mindmap to link memories</span>
                            </li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Access Mindmaps</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Network className="w-5 h-5 text-purple-400" />
                                <span>Use the Network icon in sidebar to view and manage mindmaps</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Chat with mindmaps for cross-memory insights</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-center text-slate-200 italic">
                        Mindmaps let you see the bigger picture and draw powerful connections.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}