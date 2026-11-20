import { checkIsAuthenticated } from "@/actions/auth";
import SignIn from "@/components/auth/SignIn";
import { redirect } from "next/navigation";

const SignInPage = async () => {
    const isAuthenticated = await checkIsAuthenticated();
    if (isAuthenticated.status === 200) {
        return redirect('/')
    }
    return (
        <SignIn />
    )
}

export default SignInPage
