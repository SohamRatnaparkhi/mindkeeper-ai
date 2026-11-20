"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

interface HeaderProps {
    interactionTitle: string
    handleButtonClicked: () => void
    central?: string
}

export default function Header({
    interactionTitle,
    handleButtonClicked,
    central = ""
}: HeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)
    return (
        <div className="sticky top-0 mx-4 z-50 w-full bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container flex items-center justify-between py-4"
            >
                {central == "MindKeeper AI" ? (
                    <h2 className="text-2xl font-bold truncate flex-grow text-center"><Link href={"http://home.mindkeeperai.com"}>MindKeeper AI</Link></h2>

                ) : <h2 className="text-2xl font-bold truncate flex-grow text-center">
                    {central}
                </h2>}
                {/* <Button
                    onClick={openModal}
                    className="bg-purple-900 text-white border-2 border-[#9855FF] hover:bg-purple-800 transition-colors duration-300"
                >
                    <PlusCircle className="md:mr-2" />
                    <span className="hidden sm:inline">{interactionTitle}</span>
                </Button> */}
                {/* <SecondBrainModal isOpen={isModalOpen} onClose={closeModal} /> */}
            </motion.div>
        </div>
    )
}
