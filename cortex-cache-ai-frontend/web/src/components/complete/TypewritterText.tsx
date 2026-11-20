"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterText = ({ text, className, isVisible }: {
    text: string;
    className?: string;
    isVisible: boolean;
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (!isVisible) {
            setDisplayText('');
            return;
        }
        if (isTyping) {
            if (displayText.length < text.length) {
                timeout = setTimeout(() => {
                    setDisplayText(text.slice(0, displayText.length + 1));
                }, 100);
            }
        }
        return () => clearTimeout(timeout);
    }, [displayText, isTyping, text]);

    return (
        <motion.div
            key={isVisible ? 'visible' : 'hidden'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
        >
            <h1 className={`${className} font-bold text-white`}>
                {displayText}
                <span className="animate-pulse">|</span>
            </h1>
        </motion.div>
    );
};