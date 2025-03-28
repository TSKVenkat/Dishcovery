import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
          <ShieldCheck size={22} />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Create New Password</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Please enter a new secure password for your account</p>
      </div>
      
      <form className="w-full bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">New Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                <Lock size={18} />
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your new password"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-neutral-700 dark:text-neutral-300">Confirm Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                <KeyRound size={18} />
              </div>
              <Input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm your new password"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Minimum 8 characters</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
          
          <SubmitButton 
            formAction={resetPasswordAction}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors mt-4"
          >
            Set New Password
          </SubmitButton>
          
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
