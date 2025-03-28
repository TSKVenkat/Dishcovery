import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, Lock, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 rounded-full">
          <UserPlus size={22} />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Create Account</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Join Dishcovery to track your food inventory</p>
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
            <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                <Lock size={18} />
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Create a strong password"
                className="pl-10"
                minLength={6}
                required
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Password must be at least 6 characters
            </p>
          </div>
          
          <SubmitButton 
            formAction={signUpAction} 
            pendingText="Signing up..."
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-2.5 rounded-lg transition-colors mt-3"
          >
            Create Account
          </SubmitButton>
          
          <FormMessage message={searchParams} />
          
          <div className="text-center mt-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Already have an account?{" "}
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
