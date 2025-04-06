'use client'
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown } from "lucide-react";

interface HeaderAuthProps {
  initialEmail: string | null;
}

export default function HeaderAuth({ initialEmail }: HeaderAuthProps) {
  console.log('[Client] Component rendered with initialEmail:', initialEmail);
  
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // If no initialEmail, try to get user data directly
    if (!initialEmail) {
      const checkUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            console.log('[Client] Found user after getUser():', user.email);
            setEmail(user.email);
          }
        } catch (error) {
          console.error('[Client] Error checking user:', error);
        }
      };
      checkUser();
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Client] Auth event:', event, session?.user?.email);
      if (event === 'SIGNED_IN') {
        setEmail(session?.user?.email || null);
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setEmail(null);
        router.refresh();
      }
    });

    return () => {
      console.log('[Client] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [router, supabase, initialEmail]);

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log('[Client] Starting sign out process');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('[Client] Sign out successful, clearing state');
      setEmail(null);
      setIsDropdownOpen(false);
      
      // Force a hard refresh to ensure all auth state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('[Client] Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  console.log('[Client] Current email state:', email);

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
                onClick={signOut}
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
