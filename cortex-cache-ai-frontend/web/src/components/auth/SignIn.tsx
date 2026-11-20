"use client"

import { handleCredentialsAuth, handleGithubAuth, handleGoogleAuth, handleMagicLinkAuth } from "@/actions/social-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { GithubIcon, Lock, Mail, Wand2 } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useState } from 'react'

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [magicLinkEmail, setMagicLinkEmail] = useState('')
    const [loginStarted, setLoginStarted] = useState(false)
    const [magicLinkSent, setMagicLinkSent] = useState(false)
    const { toast } = useToast()

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginStarted(true)
        if (email === 'test@test.com' && password === 'test') {
            toast({
                title: 'Logged in successfully',
                duration: 5000,
                className: 'bg-green-500 text-white'
            })
            return;
        }
        const res = await handleCredentialsAuth(email, password)
        if (res?.status === 401) {
            toast({
                title: 'Invalid credentials',
                duration: 5000,
                className: 'bg-red-500 text-white'
            })
            setLoginStarted(false)
            return;
        } else if (res?.status === 404) {
            toast({
                title: 'User not found',
                duration: 5000,
                className: 'bg-red-500 text-white'
            })
            setLoginStarted(false)
            return;
        } else {
            if (res?.status === 200) {
                toast({
                    title: 'Logged in successfully',
                    duration: 5000,
                    className: 'bg-green-500 text-white'
                })
                window.location.href = '/'
            } else {
                toast({
                    title: 'An error occurred',
                    duration: 5000,
                    className: 'bg-red-500 text-white'
                })
                window.location.href = '/'
            }
            setLoginStarted(false)
            return;
        }
    }

    const handleMagicLinkSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setMagicLinkSent(true)
        const res = await handleMagicLinkAuth(magicLinkEmail)
        if (res?.status === 404) {
            alert('User not found')
        }
        console.log('Magic link sign-in:', magicLinkEmail)
        setMagicLinkSent(false)
    }

    const handleGoogleSignIn = async () => {
        // console.log('Google sign-in')
        console.log('clicked')
        await handleGoogleAuth()
        console.log('done')
    }

    const handleGitHubSignIn = async () => {
        await handleGithubAuth()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="mb-8 text-center">
                <Link href={"https://home.mindkeeperai.com"}>
                    <div className="inline-flex items-center gap-2 mb-2">
                        <Image
                            src="/logo/final-no-name.png"
                            alt="Mindkeeper Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10 md:w-[60px] md:h-[60px] rounded-lg"
                        />
                        <h1 className="text-3xl md:text-5xl font-bold text-primary">MindKeeper AI</h1>
                    </div>
                </Link>
                <p className="text-muted-foreground">Your digital mind, organized.</p>
            </div>
            <motion.div

                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-gray-800 text-gray-100 shadow-2xl border-t border-gray-700">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-gray-400">
                            Sign in to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-700 rounded-lg p-1">
                                <TabsTrigger value="email" className="rounded-md data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </TabsTrigger>
                                <TabsTrigger value="magic-link" className="rounded-md data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all">
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Magic Link
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="email">
                                <form onSubmit={handleEmailSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-200">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-200">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Button disabled={loginStarted} type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300">
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>
                            <TabsContent value="magic-link">
                                <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="magic-link-email" className="text-gray-200">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="magic-link-email"
                                                type="email"
                                                placeholder="m@example.com"
                                                value={magicLinkEmail}
                                                onChange={(e) => setMagicLinkEmail(e.target.value)}
                                                required
                                                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Button disabled={magicLinkSent} type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300">
                                        Send Magic Link
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button variant="outline" onClick={handleGoogleSignIn} className="bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 transition-all duration-300">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" onClick={handleGitHubSignIn} className="bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 transition-all duration-300">
                                <GithubIcon className="mr-2 h-4 w-4" />
                                GitHub
                            </Button>
                        </div>
                        {/* <br /> */}
                        <div className="text-center pt-1 text-xs text-gray-400">
                            Don&apos;t have an account?{' '}
                            <a href="/auth/register" className="text-blue-400 hover:underline">Register Now</a>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}