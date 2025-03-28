// components/AddItemModal.tsx
import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';
import { Item } from '@/types';
import SimpleNativeCamera from './SimpleNativeCamera';

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
    setIsDragging(true);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const processImage = async (imageSrc: string) => {
    try {
      setError(null);
      
      // Extract the base64 part of the data URL
      const base64Data = imageSrc.split(',')[1];
      
      const response = await fetch('/api/process-food-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {
          setCapturedImage(null); // Reset the image when food cannot be identified
          throw new Error(data.error);
        } else {
          throw new Error('Failed to process the image');
        }
      }
      
      // Check if the API returned an error message
      if (data.error) {
        setCapturedImage(null);
        throw new Error(data.error);
      }
      
      // If we got here, we have successfully identified a food item
      setItemName(data.name || '');
      setAbout(data.description || '');
      
      // Calculate a default expiry date (7 days from today)
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 7);
      setExpiryDate(defaultExpiryDate.toISOString().split('T')[0]);
      
      setStep(AddItemStep.CONFIRM_DETAILS);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the image');
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
              <AlertCircle size={24} />
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {step === AddItemStep.CAPTURE_IMAGE ? 'Add Food Item' : 'Confirm Item Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && !error.includes("person") && !error.includes("food") && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 flex items-start">
            <div className="mr-2 mt-0.5">
              <AlertCircle size={18} />
            </div>
            <div>{error}</div>
          </div>
        )}

        {step === AddItemStep.CAPTURE_IMAGE ? (
          <div>
            {error && (error.includes("person") || error.includes("food")) ? (
              renderNonFoodErrorMessage()
            ) : (
              <div className="mb-4">
                <p className="mb-4 text-neutral-600 dark:text-neutral-300">Take a photo of your food item or upload an image</p>
                
                {capturedImage && !isProcessing ? (
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured food item" 
                      className="w-full h-64 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                    />
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : isProcessing ? (
                  <div className="w-full h-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                      <p className="mt-3 text-neutral-600 dark:text-neutral-300">Processing image...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <SimpleNativeCamera onCaptureAction={handleCapture} />
                    
                    {/* Drag and drop area */}
                    <div 
                      ref={dropAreaRef}
                      className={`mt-6 border-2 ${
                        isDragging 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600'
                      } border-dashed rounded-lg p-6 transition-colors duration-200 ease-in-out cursor-pointer`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <Upload size={36} className={`${
                          isDragging ? 'text-primary-500' : 'text-neutral-400 dark:text-neutral-500'
                        } mb-3`} />
                        <h3 className={`text-lg font-medium ${
                          isDragging ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'
                        } mb-2`}>
                          {isDragging ? 'Drop to Upload' : 'Upload Image'}
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center mb-2">
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
            <div className="mb-5">
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">Item Name</label>
              <div className="flex">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-200"
                  placeholder="Enter food item name"
                />
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-200"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">Notes (Optional)</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-200"
                rows={3}
                placeholder="Add any additional information about this item"
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setStep(AddItemStep.CAPTURE_IMAGE)}
                className="px-4 py-2.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
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