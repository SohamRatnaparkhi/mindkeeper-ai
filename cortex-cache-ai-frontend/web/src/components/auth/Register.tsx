"use client"

import { getOpt, handleGithubAuth, handleGoogleAuth, setOptToRedis, verifyOtp } from "@/actions/social-auth"
import { insertUser } from "@/actions/userCrud"
import { addToWelcomeQueue } from "@/actions/welcome"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sendEmailUsingEmailJs } from "@/lib/utils"
import { motion } from 'framer-motion'
import { CheckCircle, GithubIcon, Lock, Mail, User, XCircle } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import PrivacyPolicyModal from "../policy/PrivacyPolicyModal"
import { Checkbox } from "../ui/checkbox"

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [passwordsMatch, setPasswordsMatch] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const { toast } = useToast()
    const [otp, setOtp] = useState('')
    const router = useRouter()
    const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false)
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!privacyPolicyAccepted) {
            toast({
                title: 'Error',
                description: 'Please accept the privacy policy to continue',
                className: 'bg-red-500 text-white'
            })
            return;
        }
        if (passwordStrength >= 3 && passwordsMatch) {
            const res = await verifyOtp(email, otp)
            if (res.status === 200) {
                const user = await insertUser(username, email, password)
                await addToWelcomeQueue(email)
                if (user.status === 500) {
                    toast({
                        title: 'Error',
                        description: 'An error occurred while registering. Please try again',
                        className: 'bg-red-500 text-white'
                    })
                    return;
                }
                toast({
                    title: 'Registration successful',
                    description: 'You have successfully registered. Please sign in to continue',
                    className: 'bg-green-500 text-white'
                })
                router.push('/auth/sign-in')
                return;
            } else {
                if (res.status == 400) {
                    toast({
                        title: 'Error',
                        description: 'The OTP you entered is incorrect. Please try again',
                        className: 'bg-red-500 text-white'
                    })
                    return;
                }
                toast({
                    title: 'Error',
                    description: 'An error occurred while verifying the OTP. Please try again',
                    className: 'bg-red-500 text-white'
                })
                return;
            }
        } else {
            console.log('Please meet all password requirements')
        }
    }

    const handleGoogleRegister = async () => {
        // console.log('Google register'
        if (!privacyPolicyAccepted) {
            toast({
                title: 'Error',
                description: 'Please accept the privacy policy to continue',
                className: 'bg-red-500 text-white'
            })
            return;
        }
        await handleGoogleAuth()
    }

    const handleGitHubRegister = async () => {
        await handleGithubAuth()
    }

    useEffect(() => {
        // Check password strength
        let strength = 0
        if (password.length >= 8) strength++
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
        if (password.match(/[0-9]/)) strength++
        if (password.match(/[^a-zA-Z\d]/)) strength++
        setPasswordStrength(strength)

        // Check if passwords match
        setPasswordsMatch(password === confirmPassword && password !== '')
    }, [password, confirmPassword])

    const renderPasswordStrength = () => {
        const levels = ['Weak', 'Fair', 'Good', 'Strong']
        return (
            <div className="mt-2 text-sm">
                <span className="text-gray-400 mr-2">Password strength:</span>
                <span className={`font-semibold ${passwordStrength < 3 ? 'text-red-500' : 'text-green-500'}`}>
                    {levels[passwordStrength]}
                </span>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="mb-8 text-center">
                <Link href={'https://home.mindkeeperai.com'}>
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
                            Create an Account
                        </CardTitle>
                        <CardDescription className="text-center text-gray-400">
                            Enter your details to register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-200">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-200">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
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
                                {renderPasswordStrength()}
                                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                                    <li className="flex items-center">
                                        {password.length >= 8 ? <CheckCircle className="text-green-500 mr-2 h-4 w-4" /> : <XCircle className="text-red-500 mr-2 h-4 w-4" />}
                                        At least 8 characters
                                    </li>
                                    <li className="flex items-center">
                                        {password.match(/[a-z]/) && password.match(/[A-Z]/) ? <CheckCircle className="text-green-500 mr-2 h-4 w-4" /> : <XCircle className="text-red-500 mr-2 h-4 w-4" />}
                                        Uppercase and lowercase letters
                                    </li>
                                    <li className="flex items-center">
                                        {password.match(/[0-9]/) ? <CheckCircle className="text-green-500 mr-2 h-4 w-4" /> : <XCircle className="text-red-500 mr-2 h-4 w-4" />}
                                        At least one number
                                    </li>
                                    <li className="flex items-center">
                                        {password.match(/[^a-zA-Z\d]/) ? <CheckCircle className="text-green-500 mr-2 h-4 w-4" /> : <XCircle className="text-red-500 mr-2 h-4 w-4" />}
                                        At least one special character
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-gray-200">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 pl-10"
                                    />
                                </div>
                                {confirmPassword && (
                                    <div className="flex items-center mt-2 text-sm">
                                        {passwordsMatch ? (
                                            <>
                                                <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                                                <span className="text-green-500">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="text-red-500 mr-2 h-4 w-4" />
                                                <span className="text-red-500">Passwords do not match</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                {
                                    otpSent && <div className="space-y-2">
                                        <Label htmlFor="otp" className="text-gray-200">OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
                                        />
                                    </div>
                                }
                            </div>
                            {
                                !otpSent && <Button
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300"
                                    disabled={passwordStrength < 3 || !passwordsMatch}
                                    onClick={async () => {
                                        const cryptoOtp = await getOpt()
                                        let res = null
                                        res = await sendEmailUsingEmailJs({
                                            email,
                                            otp: cryptoOtp
                                        })
                                        if (res.status === 200) {
                                            res = await setOptToRedis(email, cryptoOtp)
                                        }
                                        if (res!.status === 200) {
                                            setOtpSent(true)
                                            toast({
                                                title: 'OTP Sent',
                                                description: `An OTP has been sent to your email address ${email}. It will expire in 5 minutes`,
                                                className: 'bg-green-500 text-white'
                                            })
                                        } else {
                                            toast({
                                                title: 'Error',
                                                description: 'An error occurred while sending the OTP. Please try again',
                                                className: 'bg-red-500 text-white'
                                            })
                                        }
                                    }}
                                >
                                    Send OTP
                                </Button>
                            }
                            <div className="flex items-center space-x-2 mt-4">
                                <Checkbox
                                    id="privacy-policy"
                                    checked={privacyPolicyAccepted}
                                    onCheckedChange={(checked) => setPrivacyPolicyAccepted(checked as boolean)}
                                    className="border-gray-500"
                                />
                                <div className="flex items-center space-x-1">
                                    <label htmlFor="privacy-policy" className="text-sm text-gray-300">
                                        I agree to the
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPrivacyPolicy(true)}
                                        className="text-sm text-blue-400 hover:underline"
                                    >
                                        privacy policy
                                    </button>
                                </div>
                            </div>
                            {otpSent && <Button
                                onClick={handleRegister}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300"
                                disabled={passwordStrength < 3 || !passwordsMatch}
                            >
                                Register
                            </Button>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-gray-800 px-2 text-gray-400">Or register with</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button variant="outline" onClick={handleGoogleRegister} className="bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 transition-all duration-300">
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
                            <Button variant="outline" onClick={handleGitHubRegister} className="bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 transition-all duration-300">
                                <GithubIcon className="mr-2 h-4 w-4" />
                                GitHub
                            </Button>
                        </div>
                        {/* <br /> */}
                        <div className="text-center pt-1 text-xs text-gray-400">
                            Already have an account?{' '}
                            <a href="/auth/sign-in" className="text-blue-400 hover:underline">
                                Sign in
                            </a>
                        </div>
                    </CardFooter>
                </Card>
                <PrivacyPolicyModal
                    isOpen={showPrivacyPolicy}
                    onClose={() => setShowPrivacyPolicy(false)}
                />
            </motion.div>
        </div>
    )
}