import Link from 'next/link';
import { ChevronRight, UtensilsCrossed, Lightbulb, ChefHat, Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-emerald-50 to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <UtensilsCrossed className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">
            Dishcovery
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 text-transparent bg-clip-text">
            AI-Powered Recipes & Food Management
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            Enter your ingredients, and we'll suggest recipes that use everything with minimal food waste.
          </p>
          <Link 
            href="/sign-in"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors duration-200"
          >
            Get Started
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">Add your ingredients</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Input what you have in your kitchen</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">AI suggests recipes</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Get personalized recipe recommendations</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <ChefHat className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">Pick your favorite</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Choose from curated suggestions</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <UtensilsCrossed className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">Cook and reduce waste</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Enjoy cooking with zero waste</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">About Dishcovery</span>
            <span className="mx-2">•</span>
            We're committed to sustainable food production and consumption.
          </p>
        </div>
      </footer>
    </div>
  );
}
