"use client"

import SecondBrainModal from "@/app/new-memory/AddMemory";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Book, BrainCircuit, Bug, ChevronLeft, ChevronRight, HelpCircle, History, LogOut, Menu, MessageCircle, Network, Settings } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import React, { useState } from "react";
import { FeedbackModal } from "../FeedbackModal";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

type ActiveComponent = 'chatbot' | 'settings' | 'memories' | 'mindmaps' | 'conversations';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    onItemClick: (component: ActiveComponent) => void;
    isMobile: boolean;
    onLogout: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar, onItemClick, isMobile, onLogout }: SidebarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const pathname = usePathname();
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const isPathActive = (path: string) => {
        if (path === '/') {
            return pathname === '/' || pathname.startsWith('/chat');
        }
        return pathname.startsWith(path);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleLogoutClick = () => {
        setShowLogoutAlert(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutAlert(false);
        onLogout();
    };

    const sidebarVariants = {
        initial: {
            width: isMobile ? 0 : "4rem",
            transition: { duration: 0.3 }
        },
        animate: {
            width: isMobile ? "16rem" : isOpen ? "16rem" : "4rem",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        exit: {
            width: isMobile ? 0 : "4rem",
            transition: { duration: 0.3 }
        }
    };

    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.05
            }
        }
    };

    const menuItems = [
        {
            icon: <MessageCircle className="h-7 w-7" />,
            label: "New chat",
            action: () => onItemClick('chatbot'),
            path: '/'
        },
        {
            icon: <BrainCircuit className="h-7 w-7" />,
            label: "Add memory",
            action: openModal
        },
        {
            icon: <Book className="h-7 w-7" />,
            label: "View Memories",
            action: () => onItemClick('memories'),
            path: '/memories'
        },
        {
            icon: <Network className="h-7 w-7" />,
            label: "View Mindmaps",
            action: () => onItemClick('mindmaps'),
            path: '/mindmaps'
        },
        {
            icon: <History className="h-7 w-7" />,
            label: "Past Conversations",
            action: () => onItemClick('conversations'),
            path: '/conversations'
        },
        {
            icon: <HelpCircle className="h-7 w-7" />,
            label: "Help",
            action: () => setShowHelpModal(true)
        }
    ];

    const bottomItems = [
        {
            icon: <Bug className="h-7 w-7" />,
            label: "Report bug/Contact",
            action: () => setShowFeedbackModal(true)
        },
        {
            icon: <Settings className="h-7 w-7" />,
            label: "Settings",
            action: () => onItemClick('settings'),
            path: '/settings'
        },
        {
            icon: <LogOut className="h-7 w-7" />,
            label: "Logout",
            action: handleLogoutClick
        }
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed top-4 left-4 z-50"
            >
                <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center
                   w-10 h-10
                   bg-slate-800/50 
                   hover:bg-slate-700/50
                   rounded-lg
                   border border-slate-700/50
                   backdrop-blur-sm
                   transition-all duration-200 z-50"
                >
                    <Menu size={20} className="text-slate-300" />
                </button>
            </motion.div>
            <AnimatePresence mode="wait">
                {(isOpen || !isMobile) && (
                    <motion.div
                        className="fixed top-0 left-0 h-full bg-gray-900 md:bg-gray-900/70 z-50 border-r border-gray-700 shadow-lg overflow-hidden"
                        variants={sidebarVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <div className="flex flex-col h-full p-4 relative">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-8"
                            >
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src="/logo/final-no-name.png"
                                        alt="Logo"
                                        width={36}
                                        height={36}
                                        className="w-10 h-10"
                                    />
                                    {(isOpen || isMobile) && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="ml-3 text-xl font-semibold text-white"
                                        >
                                            MindKeeper AI
                                        </motion.span>
                                    )}
                                </Link>
                            </motion.div>

                            <div className="flex flex-col h-full">
                                <motion.div
                                    className="space-y-3 flex-grow"
                                    variants={containerVariants}
                                    initial="initial"
                                    animate="animate"
                                >
                                    {menuItems.map((item, index) => (
                                        <SidebarItem
                                            key={index}
                                            icon={item.icon}
                                            label={item.label}
                                            onClick={item.action}
                                            isOpen={isOpen || isMobile}
                                            index={index}
                                            isActive={item.path ? isPathActive(item.path) : false}
                                        />
                                    ))}
                                </motion.div>

                                <motion.div
                                    className="mt-auto space-y-3"
                                    variants={containerVariants}
                                    initial="initial"
                                    animate="animate"
                                >
                                    {bottomItems.map((item, index) => (
                                        <SidebarItem
                                            key={index}
                                            icon={item.icon}
                                            label={item.label}
                                            onClick={item.action}
                                            isOpen={isOpen || isMobile}
                                            index={index}
                                            isActive={item.path ? isPathActive(item.path) : false}
                                        />
                                    ))}
                                </motion.div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full shadow-md hover:bg-gray-700 transition-colors"
                            >
                                {isOpen ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
                <SecondBrainModal isOpen={isModalOpen} onClose={closeModal} />
                {showHelpModal && <OnboardingModal onClose={() => setShowHelpModal(false)} />}
                <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
            </AnimatePresence>
            <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogoutConfirm}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isOpen: boolean;
    index: number;
    isActive: boolean;
}

function SidebarItem({ icon, label, onClick, isOpen, index, isActive }: SidebarItemProps) {
    const itemVariants = {
        initial: {
            opacity: 0,
            x: -20
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div variants={itemVariants}>
                        <Button
                            variant="ghost"
                            className={`
                                w-full justify-start transition-all duration-200 
                                ${isOpen ? 'px-4' : 'px-0'}
                                ${isActive
                                    ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 text-white shadow-sm'
                                    : 'hover:bg-gray-800/30 text-gray-300 hover:text-white'
                                }
                                relative overflow-hidden group
                            `}
                            onClick={onClick}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-blue-500/10" />
                            )}
                            <div className={`
                                relative
                                ${!isOpen ? 'mx-auto' : ''}
                                ${isActive ? 'text-blue-400' : 'text-gray-100 group-hover:text-white'}
                            `}>
                                {icon}
                            </div>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className={`
                                        ml-3 text-base
                                        ${isActive ? 'font-medium' : ''}
                                    `}
                                >
                                    {label}
                                </motion.span>
                            )}
                        </Button>
                    </motion.div>
                </TooltipTrigger>
                {!isOpen && (
                    <TooltipContent side="right" className="text-sm font-medium">
                        {label}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}