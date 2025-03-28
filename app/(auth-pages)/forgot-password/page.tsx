import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, KeyRound } from "lucide-react";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
          <KeyRound size={22} />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Reset Password</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">We'll send you a link to reset your password</p>
      </div>
      
      <form className="w-full bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                <AtSign size={18} />
              </div>
              <Input 
                name="email" 
                id="email"
                placeholder="Enter your email address" 
                className="pl-10"
                required 
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Enter the email address associated with your account
            </p>
          </div>
          
          <SubmitButton 
            formAction={forgotPasswordAction}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg transition-colors mt-3"
          >
            Send Reset Link
          </SubmitButton>
          
          <FormMessage message={searchParams} />
          
          <div className="text-center mt-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Remember your password?{" "}
              <Link className="text-primary-600 dark:text-primary-400 font-medium hover:underline" href="/sign-in">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
