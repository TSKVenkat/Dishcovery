// app/protected/ProtectedContent.tsx
"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import ImageProcessor from "@/components/ImageProcessor";

export default function ProtectedContent() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        router.push('/sign-in');
      }
    });

    async function getInitialSession() {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/sign-in');
          return;
        }
        
        setUser(session.user);
      } catch (error) {
        console.error('Error getting session:', error);
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    }

    getInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    console.log("Image captured, processing...");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Food Image Scanner</h1>
      
      {capturedImage ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg overflow-hidden shadow">
            <img 
              src={capturedImage} 
              alt="Captured food" 
              className="w-full object-cover"
            />
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setCapturedImage(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Take Another Photo
            </button>
            
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Analyze Food
            </button>
          </div>
        </div>
      ) : (
        <ImageProcessor onCapture={handleCapture} />
      )}
    </div>
  );
}