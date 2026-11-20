import emailjs from '@emailjs/browser';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const emailJsOptions = {
  publicKey: process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY,
}

console.log(emailJsOptions)

export const sendEmailUsingEmailJs = async (params: any) => {
  console.log(params)
  const emailRes = await emailjs.send(
    // "service_np08kc1",
    "service_lw66esx",
    "template_ton68tj",
    params,
    {
      publicKey: emailJsOptions.publicKey || "rKENaxTZsCt1KYB8q"
    }
  )
  console.log(emailRes)
  if (emailRes.status === 200) {
    return {
      status: 200,
      body: {
        message: "Email sent successfully"
      }
    }
  } else {
    return {
      status: 500,
      body: {
        error: "Email sending failed"
      }
    }
  }
}