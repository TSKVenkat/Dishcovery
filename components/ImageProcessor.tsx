"use client";
// components/ImageProcessor.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface ImageProcessorProps {
  onCapture: (imageSrc: string) => void;
}

export default function ImageProcessor({ onCapture }: ImageProcessorProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsCameraLoading(true);
      setError(null);
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser. Try using Chrome, Firefox, or Edge.");
      }
      
      // First try to get back/environment camera (this works better on mobile)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => {
              console.error("Error playing video:", e);
              setError("Could not start video stream");
              setIsCameraLoading(false);
            });
            setIsCameraActive(true);
            setIsCameraLoading(false);
          };
        }
      } catch (envError) {
        // If environment camera fails, fallback to any available camera
        console.log("Could not access environment camera, trying default:", envError);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Error playing video:", e));
            setIsCameraActive(true);
            setIsCameraLoading(false);
          };
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let errorMessage = "Failed to access camera";
      
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = "Camera access denied. Please allow camera access in your browser settings.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "No camera found. Please connect a camera and try again.";
        } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
          errorMessage = "Camera is already in use by another application or not accessible.";
        } else if (err.name === 'SecurityError') {
          errorMessage = "Camera access blocked due to security restrictions.";
        } else {
          errorMessage = err.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      setIsCameraLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Check if video is playing and has dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          setError("Camera stream not ready. Please try again.");
          return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError("Could not access image context. Please try again.");
          return;
        }
        
        // Draw the video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image data URL with high quality
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        
        // Ensure the data URL is valid and not empty
        if (!imageSrc || imageSrc === 'data:,') {
          setError("Failed to capture image. Please try again.");
          return;
        }
        
        // Pass the image to the parent component
        onCapture(imageSrc);
        
        // Stop the camera
        stopCamera();
      } catch (err) {
        console.error("Error capturing image:", err);
        setError("Failed to capture image. Please try again.");
      }
    } else {
      setError("Camera not initialized. Please refresh and try again.");
    }
  }, [onCapture, stopCamera, setError]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="w-full">
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
        {isCameraActive ? (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Camera Active
            </div>
            
            {/* Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <button
                onClick={captureImage}
                className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Take photo"
              >
                <div className="w-6 h-6 border-2 border-black rounded-full"></div>
              </button>
              
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-gray-50 border-dashed border-2 border-gray-300 rounded-lg"
            onClick={!isCameraLoading ? startCamera : undefined}
          >
            {isCameraLoading ? (
              <div className="flex flex-col items-center p-8 text-center">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">Accessing camera...</p>
                <p className="mt-2 text-gray-500 text-sm">Please allow camera access when prompted</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center px-8 py-6 max-w-sm">
                <div className="text-red-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="text-red-600 font-medium text-lg">Camera Error</p>
                <p className="mt-2 text-gray-600">{error}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 text-center">
                <div className="p-4 bg-blue-100 rounded-full mb-2">
                  <Camera size={48} className="text-blue-600" />
                </div>
                <p className="mt-2 text-gray-700 font-medium">Tap to activate camera</p>
                <p className="mt-1 text-gray-500 text-sm">We'll use your camera to capture an image of your food item</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}