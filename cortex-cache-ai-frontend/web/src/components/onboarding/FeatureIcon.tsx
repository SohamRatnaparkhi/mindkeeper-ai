import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

export function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
    return (
        <motion.div
            className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            <Icon className="w-12 h-12 text-white" />
        </motion.div>
    )
}

