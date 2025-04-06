import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuthWrapper from "@/components/header-auth-wrapper";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Dishcovery",
  description: "Smart Food Management & Recipe Suggestions",
  keywords: "food management, recipe suggestions, inventory tracking, expiry dates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground transition-theme">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <main className="min-h-screen flex flex-col items-center">
            <nav className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-card-background shadow-sm fixed top-0 z-50 bg-neutral-800">
              <div className="w-full max-w-6xl mx-auto flex justify-between items-center p-3 px-5">
                <div className="flex items-center gap-2">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 text-primary-600 dark:text-primary-400 transition-colors"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-8 h-8"
                    >
                      <path d="M15 11h.01"></path>
                      <path d="M11 15h.01"></path>
                      <path d="M16 16h.01"></path>
                      <path d="m2 16 20 6-6-20A10 10 0 0 0 2 16"></path>
                    </svg>
                    <span className="font-heading text-xl tracking-tight font-semibold">Dishcovery</span>
                  </Link>
                </div>
                
                <div className="flex items-center gap-4">
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuthWrapper />}
                  <ThemeSwitcher />
                </div>
              </div>
            </nav>
            
            {/* Page content with padding for fixed header */}
            <div className="w-full max-w-6xl flex flex-col gap-8 p-5 pt-24 pb-16 mx-auto">
              {children}
            </div>

            <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-card-background py-8">
              <div className="max-w-6xl mx-auto px-5 text-center">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center text-primary-600 dark:text-primary-400">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-6 h-6 mr-2"
                    >
                      <path d="M15 11h.01"></path>
                      <path d="M11 15h.01"></path>
                      <path d="M16 16h.01"></path>
                      <path d="m2 16 20 6-6-20A10 10 0 0 0 2 16"></path>
                    </svg>
                    <span className="font-heading font-medium">Dishcovery</span>
                  </div>
                  
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    © {new Date().getFullYear()} Dishcovery. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
