import { motion } from 'framer-motion'
import { BrainCircuit, FileText, Github, Globe, PlusCircle, Youtube } from 'lucide-react'
import { FeatureIcon } from './FeatureIcon'

export function AddMemoriesStep() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
        >
            <FeatureIcon icon={PlusCircle} />
            <motion.h2
                className="text-3xl font-bold text-slate-100 mt-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                Adding Memories
            </motion.h2>
            <motion.div
                className="text-slate-300 text-left max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-slate-100 mb-3">How to Add Memories</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-2">
                                <PlusCircle className="w-5 h-5 text-blue-400" />
                                <span>or</span>
                                <BrainCircuit className="w-5 h-5 text-blue-400" />
                            </div>
                            <span>Click the icons to start</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <Youtube className="w-5 h-5 text-red-400" />
                                <Globe className="w-5 h-5 text-green-400" />
                                <Github className="w-5 h-5 text-purple-400" />
                                <FileText className="w-5 h-5 text-orange-400" />
                            </div>
                            <span>Choose your content type</span>
                        </div>
                        <p>Add a title (required) and optional description/tags</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-3">Upload Process</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span>Uploads take 30 seconds to 15 minutes based on content size</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span>You'll receive an email when done</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span>Monitor progress in the Status section</span>
                        </li>
                    </ul>
                </div>
            </motion.div>
        </motion.div>
    )
}