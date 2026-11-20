import { checkIsAuthenticated } from "@/actions/auth";
import Register from "@/components/auth/Register";
import { redirect } from "next/navigation";

const RegisterPage = async () => {
    const isAuthenticated = await checkIsAuthenticated();
    if (isAuthenticated.status === 200) {
        return redirect('/')
    }
    return (
        <Register />
    )
}

export default RegisterPage
