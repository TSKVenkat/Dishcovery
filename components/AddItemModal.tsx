// components/AddItemModal.tsx
import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, Upload } from 'lucide-react';
import { Item } from '@/types';
import WebcamCapture from './WebcamCapture';
import SimpleWebcam from './SimpleWebcam';

interface AddItemModalProps {
  onClose: () => void;
  onItemAdded: (item: Item) => void;
}

enum AddItemStep {
  CAPTURE_IMAGE,
  CONFIRM_DETAILS
}

export default function AddItemModal({ onClose, onItemAdded }: AddItemModalProps) {
  const [step, setStep] = useState<AddItemStep>(AddItemStep.CAPTURE_IMAGE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [about, setAbout] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const handleCapture = (imageSrc: string) => {
    // If empty string is received, it means camera was closed
    if (!imageSrc) {
      setCapturedImage(null);
      return;
    }
    
    setCapturedImage(imageSrc);
    setIsProcessing(true);
    processImage(imageSrc);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    handleFile(file);
  };
  
  const handleFile = (file: File) => {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageSrc = reader.result as string;
      setCapturedImage(imageSrc);
      setIsProcessing(true);
      processImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };
  
  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const dt = e.dataTransfer;
    const file = dt.files?.[0];
    
    if (file) {
      handleFile(file);
    }
  }, []);

  const processImage = async (imageSrc: string) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Send image to AI API for processing
      const response = await fetch('/api/process-food-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      // Check if AI reported NOT_FOOD
      if (data.itemName === "NOT_FOOD" || data.error) {
        setCapturedImage(null);
        throw new Error(data.error || "Could not identify any food in this image. Please try another photo of a food item.");
      }
            
      // Set the detected food item name and proceed to next step
      setItemName(data.itemName || '');
      setStep(AddItemStep.CONFIRM_DETAILS);
    } catch (err) {
      setCapturedImage(null);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      console.error('Error processing image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!itemName || !expiryDate) {
      setError('Item name and expiry date are required');
      return;
    }

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Authentication required');
      }

      const { data, error: insertError } = await supabase
        .from('items')
        .insert({
          user_id: userData.user.id,
          name: itemName,
          expiry_date: new Date(expiryDate).toISOString(),
          about: about || null
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      onItemAdded(data as Item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
      console.error('Error saving item:', err);
    }
  };

  // Enhanced non-food error message
  const renderNonFoodErrorMessage = () => {
    if (!error) return null;
    
    if (error.includes("person") || error.includes("food")) {
      return (
        <div className="my-6 p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="mr-3 text-red-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-1">Cannot Identify Food</h3>
              <p className="text-red-700 mb-3">{error}</p>
              <div className="mt-3">
                <p className="text-red-700 text-sm font-medium">Try uploading an image that:</p>
                <ul className="list-disc ml-5 text-sm text-red-700 mt-1 mb-4">
                  <li>Clearly shows a food item</li>
                  <li>Is well-lit and focused</li>
                  <li>Does not contain people or non-food items</li>
                </ul>
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {step === AddItemStep.CAPTURE_IMAGE ? 'Add Food Item' : 'Confirm Item Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {error && !error.includes("person") && !error.includes("food") && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <div className="mr-2 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>{error}</div>
          </div>
        )}

        {step === AddItemStep.CAPTURE_IMAGE ? (
          <div>
            {error && (error.includes("person") || error.includes("food")) ? (
              // Show only the error message when food cannot be identified
              renderNonFoodErrorMessage()
            ) : (
              <div className="mb-4">
                <p className="mb-2">Take a photo of your food item or upload an image</p>
                
                {capturedImage && !isProcessing ? (
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured food item" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                    >
                      &times;
                    </button>
                  </div>
                ) : isProcessing ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div>
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                      <p className="mt-2">Processing image...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <SimpleWebcam onCaptureAction={handleCapture} />
                    
                    {/* Drag and drop area */}
                    <div 
                      ref={dropAreaRef}
                      className={`mt-6 border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-lg p-6 transition-colors duration-200 ease-in-out cursor-pointer`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <Upload size={36} className={`${isDragging ? 'text-blue-500' : 'text-gray-400'} mb-3`} />
                        <h3 className={`text-lg font-medium ${isDragging ? 'text-blue-700' : 'text-gray-700'} mb-2`}>
                          {isDragging ? 'Drop to Upload' : 'Upload Image'}
                        </h3>
                        <p className="text-gray-500 text-sm text-center mb-2">
                          Drag & drop an image here or click to browse
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Item Name</label>
              <div className="flex">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter food item name"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Add any additional information about this item"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStep(AddItemStep.CAPTURE_IMAGE)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}