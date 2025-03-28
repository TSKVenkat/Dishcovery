"use client";

import React, { useState, useRef, useEffect } from 'react';

interface SimpleNativeCameraProps {
  onCaptureAction: (imageSrc: string) => void;
}

export default function SimpleNativeCamera({ onCaptureAction }: SimpleNativeCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      // Set stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      let errorMessage = 'Could not access camera';
      
      if (err instanceof Error) {
        console.error('Camera error:', err);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported. Trying with default settings.';
          // Try with user facing if environment failed
          if (facingMode === 'environment') {
            setFacingMode('user');
            return;
          }
        }
      }
      
      setError(errorMessage);
      setCameraActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    onCaptureAction(''); // Signal camera was closed
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not initialized');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not get canvas context');
        return;
      }
      
      // Flip horizontally for selfie view if using front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Stop camera
      stopCamera();
      
      // Pass image data to parent
      onCaptureAction(imageData);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture image');
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const retry = () => {
    setError(null);
    startCamera();
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading camera...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="flex flex-col items-center text-center px-8 py-6 h-full justify-center">
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
              onClick={retry}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => setIsLoading(false)}
              className="w-full h-full object-cover"
              style={{ 
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                display: cameraActive && !isLoading ? 'block' : 'none' 
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {cameraActive && !isLoading && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Camera Active
                </div>
                
                {/* Camera controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    onClick={capturePhoto}
                    className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    aria-label="Take photo"
                  >
                    <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                  </button>
                  
                  <button
                    onClick={switchCamera}
                    className="bg-gray-500 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 transition-colors"
                    aria-label="Switch camera"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 15 L19 19 L15 23"></path>
                      <path d="M5 15 L1 19 L5 23"></path>
                      <path d="M19 19 L5 19"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={stopCamera}
                    className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    aria-label="Close camera"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 