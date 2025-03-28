// pages/api/process-food-image.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/utils/supabase/server';

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Get user data to provide personalized identification
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
      .from('profiles')
      .select('about')
      .eq('user_id', userId)
      .single();
      
    // Get user's preferences and dietary restrictions if available
    const aboutInfo = profile?.about || '';

    // Remove the data URL prefix to get just the base64 data
    const base64Data = image.split(',')[1];
    
    // Call Gemini API to identify the food item
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // First, check if the image contains a person or non-food item
    const checkPrompt = `
      Analyze this image and determine what it contains.
      Do not respond with any unnecessary details.
      ONLY respond with one of these exact answers:
      1. "CONTAINS_FOOD" - if the image clearly shows food items
      2. "CONTAINS_PERSON" - if the image primarily shows a person
      3. "CONTAINS_LANDSCAPE" - if the image shows scenery or outdoor locations
      4. "CONTAINS_DOCUMENT" - if the image shows text, documents, or screenshots
      5. "CONTAINS_OBJECT" - if the image shows non-food objects (furniture, electronics, etc.)
      6. "UNCLEAR_IMAGE" - if the image is blurry, too dark, or otherwise hard to identify
      7. "NO_FOOD" - if the image does not contain any clear food items and doesn't match above categories
    `;
    
    console.log('Sending check prompt to Gemini');
    
    const checkResult = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: checkPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ]
    });
    
    const checkResponse = await checkResult.response;
    const checkText = checkResponse.text().trim();
    
    if (checkText.includes("CONTAINS_PERSON")) {
      console.log('Image contains a person, not food');
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "The image appears to show a person rather than food. Please upload an image that clearly shows a food item.",
        imageType: "person" 
      });
    }
    
    if (checkText.includes("CONTAINS_LANDSCAPE")) {
      console.log('Image contains landscape or scenery');
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "The image appears to show scenery or an outdoor location rather than food. Please upload an image that clearly shows a food item.",
        imageType: "landscape" 
      });
    }
    
    if (checkText.includes("CONTAINS_DOCUMENT")) {
      console.log('Image contains document or text');
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "The image appears to show text or a document rather than food. Please upload an image that clearly shows a food item.",
        imageType: "document" 
      });
    }
    
    if (checkText.includes("CONTAINS_OBJECT")) {
      console.log('Image contains non-food object');
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "The image appears to show a non-food object. Please upload an image that clearly shows a food item.",
        imageType: "object" 
      });
    }
    
    if (checkText.includes("UNCLEAR_IMAGE")) {
      console.log('Image is unclear or hard to identify');
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "The image is unclear, too dark, or difficult to identify. Please upload a clearer image of a food item.",
        imageType: "unclear" 
      });
    }
    
    if (checkText.includes("NO_FOOD")) {
      console.log('Image does not contain food');
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "No food items were detected in this image. Please try uploading a different image that clearly shows food.",
        imageType: "other" 
      });
    }
    
    // If we get here, the image likely contains food, so proceed with identification
    const identifyPrompt = `Identify the food item in this image and provide just the name.
                   ${aboutInfo ? `Note that the user has the following preferences/dietary info: ${aboutInfo}` : ''}
                   Output only the food item name, nothing else.
                   Be specific but concise (1-3 words).
                   If you cannot identify any food in the image, just respond with "NOT_FOOD" exactly.`;
    
    console.log('Sending identification prompt to Gemini');
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: identifyPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ]
    });

    const response = await result.response;
    const itemName = response.text().trim();
    
    if (itemName === "NOT_FOOD" || itemName.toLowerCase().includes("cannot identify") || itemName.toLowerCase().includes("sorry")) {
      return NextResponse.json({ 
        itemName: "NOT_FOOD", 
        error: "Could not identify any food in this image. Please try with a clearer image of a food item."
      });
    }

    return NextResponse.json({ itemName });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
        itemName: "ERROR"
      }, 
      { status: 500 }
    );
  }
}