import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { FeatureIcon } from './FeatureIcon'

export function WelcomeStep() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
        >
            <FeatureIcon icon={Brain} />
            <motion.h2
                className="text-3xl font-bold text-slate-100 mt-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                Welcome to Mindkeeper AI
            </motion.h2>
            <motion.div
                className="text-slate-300 text-left max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <p className="text-lg mb-4">
                    Discover the ultimate AI-powered memory assistant!
                </p>
                <p className="mb-4">
                    Capture, organize, and interact with your digital memories like never before.
                </p>
                <p>
                    Mindkeeper makes it simple to create, search, and chat with your personal knowledge base.
                </p>
            </motion.div>
        </motion.div>
    )
}