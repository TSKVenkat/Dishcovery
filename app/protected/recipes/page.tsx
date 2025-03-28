'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Clock, Loader2, RefreshCw } from 'lucide-react';

interface RecipeIngredient {
  name: string;
  buyLink: string;
}

interface Recipe {
  name: string;
  useInventoryIngredients: string[];
  additionalIngredients: RecipeIngredient[];
  instructions: string[];
  youtubeLinks: string[];
}

interface RecipeResponse {
  recipes: Recipe[];
  message?: string;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);

  const getRecipeSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setShowPrompt(false);
    
    try {
      const response = await fetch('/api/recipe-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ retryCount }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.error || data.details || 'Failed to get recipe suggestions');
      }
      
      if (data.message) {
        setMessage(data.message);
      }
      
      if (data.prompt) {
        setPrompt(data.prompt);
      }
      
      if (!data.recipes || !Array.isArray(data.recipes) || data.recipes.length === 0) {
        setMessage("No recipe suggestions available. Try adding more ingredients to your inventory.");
        setRecipes([]);
      } else {
        setRecipes(data.recipes);
        setRetryCount(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error getting recipe suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/protected/inventory" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
            <ChevronLeft size={20} />
            <span>Back to Inventory</span>
          </Link>
          <h1 className="text-3xl font-bold">Recipe Suggestions</h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          Get recipe suggestions based on the ingredients in your inventory.
          We'll prioritize ingredients that are expiring soon to help reduce food waste.
        </p>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={getRecipeSuggestions}
            disabled={isLoading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Finding Recipes...
              </>
            ) : retryCount === 0 ? (
              <>
                <RefreshCw size={20} className="mr-2" />
                Get Recipe Suggestions
              </>
            ) : (
              <>
                <RefreshCw size={20} className="mr-2 hover:animate-spin" />
                Shuffle Recipes
              </>
            )}
          </button>
          
        </div>
      </header>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <h2 className="text-xl font-bold text-white">{recipe.name}</h2>
              </div>
              
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">From Your Inventory:</h3>
                  <ul className="pl-5 list-disc text-gray-600 space-y-1">
                    {recipe.useInventoryIngredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                {recipe.additionalIngredients.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Additional Ingredients:</h3>
                    <ul className="pl-5 list-disc text-gray-600 space-y-2">
                      {recipe.additionalIngredients.map((ingredient, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span>{ingredient.name}</span>
                          {ingredient.buyLink && (
                            <a 
                              href={ingredient.buyLink} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 inline-flex items-center hover:text-blue-800 hover:underline"
                            >
                              Buy Now <ExternalLink size={14} className="ml-1" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Step by Step Instructions:</h3>
                  <ol className="pl-5 list-decimal text-gray-600 space-y-3">
                    {recipe.instructions.map((instruction, i) => (
                      <li key={i} className="pl-2">{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Video Tutorials:</h3>
                  <div className="space-y-2">
                    {recipe.youtubeLinks.map((link, i) => (
                      <a 
                        key={i}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-md transition-colors flex items-center group"
                      >
                        <svg className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                        Watch Tutorial {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && !message ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">
            Click "Shuffle Recipes" to get personalized recipe ideas based on your inventory.
          </p>
        </div>
      ) : null}
    </div>
  );
}