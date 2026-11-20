import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AuthSuccess() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                    <Image
                        src="/logo/final-no-name.png"
                        alt="Mindkeeper Logo"
                        width={60}
                        height={60}
                        className="w-10 h-10 md:w-[60px] md:h-[60px] rounded-lg"
                    />
                    <h1 className="text-5xl font-bold text-primary"><Link href={"mindkeeperai.com"}>MindKeeper AI</Link></h1>
                </div>
                <p className="text-muted-foreground">Your digital mind, organized.</p>
            </div>
            <Card className="w-full max-w-md bg-gray-800 text-gray-100 shadow-2xl border-t border-gray-700">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary animate-bounce" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Check your email</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        We&apos;ve sent a magic link to your email address. Click the link to sign in to your account.
                    </p>
                    <div className="text-sm text-muted-foreground">
                        <p>Didn&apos;t receive an email?</p>
                        <p>Check your spam folder or try again.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Link href={'/auth/sign-in'}>
                        <Button className="w-full group" variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </Link>

                </CardFooter>
            </Card>
        </div>
    )
}