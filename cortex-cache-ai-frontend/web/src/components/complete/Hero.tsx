"use client"
import { addUserToWaitlist } from '@/actions/userCrud'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { Bell, Clock, Send } from 'lucide-react'
import { Inter, Outfit } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CoolMode } from '../ui/cool-mode'
import Carousel from './Carousel'
import CTAButton from './GlowButton'
import ProgramModal from './ProgramSelectionModal'

const inter = Inter(
    {
        subsets: ['latin'],
        weight: ['400', '500', '600', '700', '800'],
    }
)

const outfit = Outfit(
    {
        subsets: ['latin'],
        weight: ['400', '500', '600', '700', '800'],
    }
)

export default function Hero() {
    const calculateTimeLeft = (): {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } => {
        const deadline = new Date('January 30, 2025 00:01:00');
        const now = new Date();
        const difference = deadline.getTime() - now.getTime();

        let timeLeft: { days: number; hours: number; minutes: number; seconds: number };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        } else {
            timeLeft = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    const { toast } = useToast()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleNotifyMe = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsModalOpen(true)
    }

    const handleProgramSelect = async (programType: 'alpha' | 'beta') => {
        console.log('Selected program:', programType, 'Email:', email)
        // setIsModalOpen(false)
        try {
            setLoading(true)
            const user = await addUserToWaitlist(email, programType)
            console.log(user)
            if (user) {
                toast({
                    title: 'Success!',
                    description: `You have been added to the waitlist for the ${programType} program. You will soon receive an email with more details.`,
                    duration: 5000,
                    className: 'bg-green-500 text-white'
                })
            } else {
                toast({
                    title: 'Error!',
                    description: 'An error occurred while adding you to the waitlist. Please try again later.',
                    duration: 5000,
                    className: 'bg-red-500 text-white'
                })
            }
        } catch (error) {
            toast({
                title: 'Error!',
                description: 'An error occurred while adding you to the waitlist. Please try again later.',
                duration: 5000,
                className: 'bg-red-500 text-white'
            })
        }
        setLoading(false)
        setIsModalOpen(false)
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime.seconds > 0) {
                    return { ...prevTime, seconds: prevTime.seconds - 1 }
                } else if (prevTime.minutes > 0) {
                    return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 }
                } else if (prevTime.hours > 0) {
                    return { ...prevTime, hours: prevTime.hours - 1, minutes: 59, seconds: 59 }
                } else if (prevTime.days > 0) {
                    return { ...prevTime, days: prevTime.days - 1, hours: 23, minutes: 59, seconds: 59 }
                } else {
                    clearInterval(timer)
                    return prevTime
                }
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div
            className="w-full h-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/landing/app--mask@2x.jpg')" }}
        >
            <motion.div
                className="w-full  h-full p-8 rounded-lg text-white text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-full mt-10 mb-3  px-4 sm:px-6 md:px-8">
                    <div className="w-fit max-w-3xl mx-auto">
                        <div className="bg-neutral-950 rounded-full border border-purple-500/20 px-3 sm:px-4 py-2 flex items-center gap-2 shadow-lg">
                            <span className="inline-flex items-center bg-purple-600 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full text-white">
                                NEW
                            </span>
                            <span className="text-purple-400 text-xs sm:text-base font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
                                Alpha is LIVE — <Link className='underline' href={'/auth/register'}>Try now</Link> 🎊
                            </span>
                        </div>
                    </div>
                </div>
                <motion.h1
                    className={`${inter.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl sm:mt-6 font-medium mb-2 text-white`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    MindKeeper AI
                </motion.h1>
                <motion.h2
                    className={`${inter.className} text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-4 bg-gradient-to-b from-white to-[#b372cf] text-transparent bg-clip-text`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Your AI Powered Second-Brain
                </motion.h2>
                <motion.h3
                    className="text-2xl md:text-4xl text-white mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    Capture, Query, Recall
                </motion.h3>

                <motion.div
                    className="text-xl mb-4 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    <p className={`${outfit.className} md:hidden`}>
                        Give your brain a break—upload it to MindKeeper and let it do the rest!
                    </p>
                    <p className={`${outfit.className} hidden md:block`}>
                        Give your brain a break—upload it to MindKeeper and let it do the rest!
                    </p>
                </motion.div>
                <CTAButton />

                <div className='hidden'>
                    <motion.div
                        className="bg-purple-900/0 rounded-2xl p-6 max-w-2xl mx-auto relative border-2 border-solid border-[#9855FF]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        <div className="bg-purple-950 rounded-xl p-4 mb-8 flex items-center justify-center space-x-2 absolute -top-6 left-1/2 transform -translate-x-1/2 w-3/4 max-w-xs border-2 border-solid  border-[#9855FF]">
                            <Clock className="w-6 h-6 flex-shrink-0" />
                            <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">β-LAUNCHING IN</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 sm:mt-8">
                            {[
                                { value: timeLeft.days, label: "Days" },
                                { value: timeLeft.hours, label: "Hours" },
                                { value: timeLeft.minutes, label: "Minutes" },
                                { value: timeLeft.seconds, label: "Seconds" },
                            ].map((item, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold">
                                        {item.value.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-xs sm:text-sm uppercase">{item.label}</div>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                </div>

                <div className='md:block hidden'>
                    <Carousel />
                </div>
                <div className='md:hidden relative'>
                    <Carousel aspectRatio='9/16' />
                </div>
                <ProgramModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        console.log('Modal closed')
                    }}
                    isLoading={loading}
                    onSelect={handleProgramSelect}
                />
                <motion.div className="flex mt-6 flex-col items-center">
                    <motion.form
                        onSubmit={handleNotifyMe}
                        className="relative max-w-md w-full mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john.doe@abc.xyz"
                            className="w-full px-4 py-3 rounded-full bg-purple-800/50 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 border-2 border-[#9855FF] border-solid"
                            required
                        />
                        <CoolMode>
                            <button
                                type="submit"
                                className="absolute right-0 top-0 bottom-0 px-6 bg-white text-purple-800 rounded-full font-semibold hover:bg-purple-100 transition-colors duration-300 flex items-center"
                            >
                                <span className="mr-2 hidden sm:inline">Notify Me</span>
                                <Bell size={18} className="sm:hidden" />
                                <Send size={18} className="hidden sm:inline" />
                            </button>
                        </CoolMode>
                    </motion.form>


                </motion.div>
                {/* <br /> */}
                {/* <br /> */}
            </motion.div>
        </div>
    )
}
