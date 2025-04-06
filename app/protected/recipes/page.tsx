'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Clock, Loader2, RefreshCw, CheckCircle, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { deleteItem } from '@/components/InventoryTable';

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
  const [cookingRecipe, setCookingRecipe] = useState<string | null>(null);

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

  const handleCookRecipe = async (recipe: Recipe) => {
    if (!confirm('Are you sure you want to mark this recipe as cooked? This will remove the used ingredients from your inventory.')) {
      return;
    }

    setCookingRecipe(recipe.name);
    setError(null);

    try {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Authentication required');
      }

      // Get all items for the user
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, name')
        .eq('user_id', user.user.id);

      if (itemsError) throw itemsError;

      // Delete each ingredient used in the recipe
      for (const ingredient of recipe.useInventoryIngredients) {
        const itemToDelete = items?.find(item => item.name === ingredient);
        if (itemToDelete) {
          await deleteItem(itemToDelete.id);
        }
      }

      // Update successful_cooks and rank
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('successful_cooks')
        .eq('user_id', user.user.id)
        .single();

      if (profileError) throw profileError;

      const newCooks = (userProfile?.successful_cooks || 0) + 1;
      let newRank = 'Newbie';

      if (newCooks > 15) {
        newRank = 'Expert Chef';
      } else if (newCooks >= 5) {
        newRank = 'Rookie Chef';
      } else if (newCooks > 0) {
        newRank = 'Amateur';
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          successful_cooks: newCooks,
          rank: newRank
        })
        .eq('user_id', user.user.id);

      if (updateError) throw updateError;

      // Remove the cooked recipe from the list
      setRecipes(prevRecipes => prevRecipes.filter(r => r.name !== recipe.name));
      setMessage(`Successfully cooked ${recipe.name} and updated your chef rank!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove ingredients');
      console.error('Error removing ingredients:', err);
    } finally {
      setCookingRecipe(null);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <Link href="/protected/inventory" className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Inventory</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Recipe Suggestions</h1>
          <Link 
            href="/protected" 
            className="flex items-center px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 shadow-sm transition-colors group"
          >
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 group-hover:text-orange-500" />
            <span className="text-sm sm:text-base">Profile Dashboard</span>
          </Link>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Get recipe suggestions based on the ingredients in your inventory.
          We'll prioritize ingredients that are expiring soon to help reduce food waste.
        </p>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={getRecipeSuggestions}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                <span className="text-sm sm:text-base">Finding Recipes...</span>
              </>
            ) : retryCount === 0 ? (
              <>
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Get Recipe Suggestions</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 hover:animate-spin" />
                <span className="text-sm sm:text-base">Shuffle Recipes</span>
              </>
            )}
          </button>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
          {message}
        </div>
      )}
      
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">{recipe.name}</h2>
              </div>
              
              <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">From Your Inventory:</h3>
                  <ul className="pl-4 sm:pl-5 list-disc text-sm sm:text-base text-gray-600 space-y-1">
                    {recipe.useInventoryIngredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                {recipe.additionalIngredients.length > 0 && (
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">Additional Ingredients:</h3>
                    <ul className="pl-4 sm:pl-5 list-disc text-sm sm:text-base text-gray-600 space-y-2">
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
                              <span className="text-xs sm:text-sm">Buy Now</span>
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">Step by Step Instructions:</h3>
                  <ol className="pl-4 sm:pl-5 list-decimal text-sm sm:text-base text-gray-600 space-y-2 sm:space-y-3">
                    {recipe.instructions.map((instruction, i) => (
                      <li key={i} className="pl-1 sm:pl-2">{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">Video Tutorials:</h3>
                  <div className="space-y-2">
                    {recipe.youtubeLinks.map((link, i) => (
                      <a 
                        key={i}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block bg-red-50 text-red-600 hover:bg-red-100 p-2 sm:p-3 rounded-md transition-colors flex items-center group"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                        <span className="text-xs sm:text-sm">Watch Tutorial {i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleCookRecipe(recipe)}
                    disabled={!!cookingRecipe}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                      cookingRecipe === recipe.name
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm'
                    }`}
                  >
                    {cookingRecipe === recipe.name ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="text-sm sm:text-base font-medium">Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="text-sm sm:text-base font-medium">I Cooked This Recipe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && !message ? (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <p className="text-base sm:text-xl text-gray-500">
            Click "Shuffle Recipes" to get personalized recipe ideas based on your inventory.
          </p>
        </div>
      ) : null}
    </div>
  );
}