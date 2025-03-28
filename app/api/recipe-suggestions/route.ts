import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Parse request body to get retryCount
    const requestData = await request.json().catch(() => ({}));
    const retryCount = requestData.retryCount || 0;
    
    // Authenticate the user
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Fetch user's profile to get 'about' information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')  // Assuming you have a profiles table
      .select('about')
      .eq('user_id', userId)
      .single();

    // Get the user's ingredients from their inventory
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('name, expiry_date, about')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true });
    
    if (itemsError) {
      throw new Error('Error fetching inventory items');
    }
    
    if (!items || items.length === 0) {
      return NextResponse.json({ 
        recipes: [], 
        message: 'No ingredients found in your inventory. Add some food items first.' 
      });
    }

    // Sort items by expiry date
    const sortedItems = [...items].sort((a, b) => {
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    });

    // Group items into expired, expiring soon (7 days), and fresh
    const today = new Date();
    const expiringThreshold = new Date();
    expiringThreshold.setDate(today.getDate() + 7);
    
    const expired = sortedItems.filter(item => new Date(item.expiry_date) < today);
    const expiringSoon = sortedItems.filter(
      item => new Date(item.expiry_date) >= today && new Date(item.expiry_date) <= expiringThreshold
    );
    const fresh = sortedItems.filter(item => new Date(item.expiry_date) > expiringThreshold);

    // Extract ingredient names and format them for the AI prompt
    const expiredNames = expired.map(item => item.name);
    const expiringSoonNames = expiringSoon.map(item => item.name);
    const freshNames = fresh.map(item => item.name);
    
    // Collect all 'about' information from items and user profile
    const aboutInfo = [
      profile?.about || '',
      ...items
        .filter(item => item.about)
        .map(item => item.about)
    ].filter(Boolean).join(' ');

    if (aboutInfo) {
      console.log('User preferences found:', aboutInfo);
    }
    
    // Combine all available ingredients
    const allIngredients = [...expiringSoonNames, ...freshNames];
    
    if (allIngredients.length === 0) {
      return NextResponse.json({ 
        recipes: [], 
        message: 'No usable ingredients found in your inventory. All items appear to be expired.' 
      });
    }

    // Create a prompt for recipe suggestions
    const prompt = `
      I want you to generate personalized recipe suggestions that I can cook.
      ${aboutInfo ? `User profile and preferences: ${aboutInfo}` : ''}
      ${retryCount > 0 ? `This is attempt #${retryCount+1}. Please suggest DIFFERENT recipes than previously.` : ''}

      Based on these ingredients, suggest 3 different recipes I can make. 
      Prioritize using ingredients that expire soon.
      
      Ingredients that are expiring soon (use these first): ${expiringSoonNames.join(', ')}
      Other available ingredients: ${freshNames.join(', ')}
      ${expired.length > 0 ? `Warning: These ingredients are expired and should not be used: ${expiredNames.join(', ')}` : ''}
      
      For each recipe, provide:
      1. Recipe name
      2. Ingredients needed from my inventory
      3. Additional ingredients I might need to buy (with links to buy online if possible)
      4. Detailed step-by-step preparation instructions (numbered list)
      5. YouTube video links for the recipe tutorial
      
      IMPORTANT: Your response must be in valid, parseable JSON format with the structure shown below.
      Do not include any text, explanation, or markdown outside of the JSON.
      Only include the JSON object itself with no additional formatting.
      
      JSON format:
      {
        "recipes": [
          {
            "name": "Recipe Name",
            "useInventoryIngredients": ["ingredient1", "ingredient2"],
            "additionalIngredients": [
              {"name": "ingredient3", "buyLink": "https://www.swiggy.com/instamart/search?custom_back=true&query=ingredient3"},
              {"name": "ingredient4", "buyLink": "https://www.swiggy.com/instamart/search?custom_back=true&query=ingredient4"}
            ],
            "instructions": [
              "Detailed instruction 1",
              "Detailed instruction 2"
            ],
            "youtubeLinks": [
              "https://www.youtube.com/results?search_query=recipe+name+tutorial",
              "https://www.youtube.com/results?search_query=how+to+make+recipe+name"
            ]
          }
        ]
      }
      
      Double check that:
      1. The JSON is valid and can be parsed by JSON.parse()
      2. Each recipe has the five required properties: name, useInventoryIngredients, additionalIngredients, instructions, and youtubeLinks
      3. All arrays and objects have proper closing brackets
      4. All property names are in the exact format shown above
      5. Ensure all YouTubeLinks are real, formatted correctly, and will lead to actual videos
    `;

    // Call Gemini to get recipe suggestions
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Log the prompt for debugging (remove in production)
    console.log('Prompt being sent to Gemini:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Log the raw response for debugging (remove in production)
    console.log('Raw response from Gemini:', responseText);
    
    // Try to extract a JSON object from the response text
    let jsonString = responseText;
    
    // If the response contains markdown code blocks, extract the JSON from them
    const codeBlockMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonString = codeBlockMatch[1].trim();
    }
    
    // If we still don't have valid JSON, try to find JSON-like content with regex
    if (!jsonString.startsWith('{')) {
      const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }
    }
    
    let recipes;
    try {
      // Try to parse the JSON
      recipes = JSON.parse(jsonString);
      
      // Validate the structure
      if (!recipes.recipes || !Array.isArray(recipes.recipes)) {
        throw new Error('Invalid response format - recipes array missing');
      }
      
      // Add empty arrays for any missing properties to prevent UI errors
      recipes.recipes = recipes.recipes.map((recipe: any) => ({
        name: recipe.name || 'Unnamed Recipe',
        useInventoryIngredients: Array.isArray(recipe.useInventoryIngredients) ? recipe.useInventoryIngredients : [],
        additionalIngredients: Array.isArray(recipe.additionalIngredients) ? recipe.additionalIngredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        youtubeLinks: Array.isArray(recipe.youtubeLinks) ? recipe.youtubeLinks : []
      }));
      
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError, 'Response text:', responseText);
      
      // Provide a fallback response
      return NextResponse.json({
        recipes: [],
        message: 'We encountered an issue generating recipe suggestions. Please try again.'
      });
    }
    
    // Return the recipes and also include the prompt for debugging
    return NextResponse.json({
      ...recipes,
      prompt: prompt // Include the prompt for debugging purposes
    });
  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recipe suggestions',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}