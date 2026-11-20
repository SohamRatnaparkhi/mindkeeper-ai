'use client'

import { Button } from "@/components/ui/button"
import { useState } from 'react'
import SecondBrainModal from './AddMemory'

export default function Page() {
    const [isModalOpen, setIsModalOpen] = useState(true)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/chat/bg4-min.png')" }}
            />
            <div className="relative z-10">
                <Button onClick={openModal}>Add to Second Brain</Button>
            </div>
            <SecondBrainModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}