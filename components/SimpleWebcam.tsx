"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SimpleWebcamProps {
  onCaptureAction: (imageSrc: string) => void;
}

const SimpleWebcam = ({ onCaptureAction }: SimpleWebcamProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<string>("environment");
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        // Stop existing stream
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      
      setError(errorMessage);
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    onCaptureAction('');
  }, [onCaptureAction]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not initialized');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        setError('Could not access canvas context');
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the data URL from the canvas
      const imageSrc = canvas.toDataURL('image/jpeg');
      
      // Pass the captured image to parent component
      onCaptureAction(imageSrc);
      
      // Stop the camera after capturing
      stopCamera();
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try again.');
    }
  }, [onCaptureAction, stopCamera]);

  // Initialize camera on mount and when facing mode changes
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera, facingMode]);

  return (
    <div className="w-full">
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
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
              onClick={startCamera}
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
              className="w-full h-full object-cover"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
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
      </div>
    </div>
  );
};

export default SimpleWebcam; 