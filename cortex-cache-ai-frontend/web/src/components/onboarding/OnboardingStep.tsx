import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { FeatureIcon } from './FeatureIcon'

interface OnboardingStepProps {
    title: string
    description: string
    icon: LucideIcon
}

export function OnboardingStep({ title, description, icon: Icon }: OnboardingStepProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
        >
            <FeatureIcon icon={Icon} />
            <motion.h2
                className="text-3xl font-bold text-slate-100 mt-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                {title}
            </motion.h2>
            <motion.div
                className="text-slate-300 text-left max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                {description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2 leading-relaxed">
                        {paragraph}
                    </p>
                ))}
            </motion.div>
        </motion.div>
    )
}

