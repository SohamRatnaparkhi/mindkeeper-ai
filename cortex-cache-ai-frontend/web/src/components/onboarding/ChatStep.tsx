import { motion } from 'framer-motion'
import { Globe, History, MessageCircle, RefreshCcw } from 'lucide-react'
import { FeatureIcon } from './FeatureIcon'

export function ChatStep() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
        >
            <FeatureIcon icon={MessageCircle} />
            <motion.h2
                className="text-3xl font-bold text-slate-100 mt-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                Chatting with Your Digital Brain
            </motion.h2>
            <motion.div
                className="text-slate-300 text-left max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Starting Conversations</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-blue-400" />
                                <span>Click the New Chat icon in sidebar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Type your question in natural language</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Features</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-green-400" />
                                <span>Toggle the Web Option to include web search results</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="w-5 h-5 text-orange-400" />
                                <span>Click the Recycle Button for alternative answers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Adjust agents or settings for tailored responses</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Past Conversations</h3>
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-400" />
                            <span>Access them via the History icon in the sidebar</span>
                        </div>
                    </div>

                    <p className="text-center text-slate-200 italic mt-4">
                        The more memories you add, the smarter and more helpful MindKeeper becomes!
                    </p>

                    <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Next Steps</h3>
                        <div className="flex items-center gap-2">
                            <span className=" w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span>Click the Add memory to add a new memory</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className=" w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span>Click the New Chat icon to start a new conversation</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}