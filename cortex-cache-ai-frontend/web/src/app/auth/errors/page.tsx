import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  p-4">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                    <Image
                        src="/logo/final-no-name.png"
                        alt="Mindkeeper Logo"
                        width={60}
                        height={60}
                        className="w-10 h-10 md:w-[60px] md:h-[60px] rounded-lg"
                    />
                    <h1 className="text-3xl font-bold text-primary">MindKeeper AI</h1>
                </div>
                <p className="text-muted-foreground">Your digital mind, organized.</p>
            </div>

            <Card className="w-full max-w-md  bg-gray-800 text-gray-100 shadow-2xl border-t border-gray-700">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Authentication Error</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        We encountered an error while trying to authenticate your account. This could be due to various reasons such as:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Invalid credentials</li>
                        <li>Expired session</li>
                        <li>Network issues</li>
                        <li>Third-party authentication service problems</li>
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Link href="/auth/sign-in">
                        <Button className="w-full group" variant="default">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </Link>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/sign-in">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}