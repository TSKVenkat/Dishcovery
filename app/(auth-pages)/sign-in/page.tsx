import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, Lock } from "lucide-react";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6"
          >
            <path d="M15 11h.01"></path>
            <path d="M11 15h.01"></path>
            <path d="M16 16h.01"></path>
            <path d="m2 16 20 6-6-20A10 10 0 0 0 2 16"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Welcome Back</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Sign in to manage your food inventory</p>
      </div>
      
      <form className="w-full bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                <AtSign size={18} />
              </div>
              <Input 
                name="email" 
                id="email"
                placeholder="you@example.com" 
                className="pl-10"
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">Password</Label>
              <Link
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                <Lock size={18} />
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Your password"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg transition-colors mt-2"
          >
            Sign in
          </SubmitButton>
          
          <FormMessage message={searchParams} />
          
          <div className="text-center mt-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Don't have an account?{" "}
              <Link className="text-primary-600 dark:text-primary-400 font-medium hover:underline" href="/sign-up">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
