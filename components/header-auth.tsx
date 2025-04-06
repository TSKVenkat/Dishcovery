'use client'
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown } from "lucide-react";

export default function HeaderAuth() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setIsLoading(true);
    
    // Get initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email || null);
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isLoading) {
    return (
      <div className="h-10 w-24 bg-neutral-100 dark:bg-neutral-800 rounded-md animate-pulse"></div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {email ? (
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-sm py-2 px-4 rounded-lg transition-colors
                       bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <User size={16} />
            <span className="hidden sm:inline max-w-[150px] truncate">{email}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
              <Link 
                href="/protected" 
                className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-t-lg"
                onClick={() => setIsDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/protected/inventory" 
                className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => setIsDropdownOpen(false)}
              >
                Inventory
              </Link>
              <Link 
                href="/protected/recipes" 
                className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => setIsDropdownOpen(false)}
              >
                Recipes
              </Link>
              <Link 
                href="/protected/forum" 
                className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => setIsDropdownOpen(false)}
              >
                Forum
              </Link>
              <button 
                onClick={() => {
                  signOut();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Link 
            href="/sign-in"
            className="btn btn-outline text-sm"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="btn btn-primary text-sm"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
