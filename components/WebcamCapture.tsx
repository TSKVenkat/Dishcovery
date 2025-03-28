"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Define the Webcam component with dynamic import but no TypeScript typing
// This approach avoids all the typing issues with react-webcam in Next.js
const DynamicWebcam = dynamic(() => import('react-webcam'), { ssr: false });

interface WebcamCaptureProps {
  onCaptureAction: (imageSrc: string) => void;
}

const WebcamCapture = ({ onCaptureAction }: WebcamCaptureProps) => {
  const webcamRef = useRef<any>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<string>("environment");
  const [error, setError] = useState<string | null>(null);
  
  // Define video constraints
  const videoConstraints = {
    facingMode: facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };
  
  // Function to capture photo
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) {
      setError("Camera not initialized");
      return;
    }
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Failed to capture image. Please try again.");
        return;
      }
      
      // Pass the captured image to parent component
      onCaptureAction(imageSrc);
      
      // Stop the camera after capturing
      stopCamera();
    } catch (err) {
      console.error("Error capturing image:", err);
      setError("Failed to capture image. Please try again.");
    }
  }, [webcamRef, onCaptureAction]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      const tracks = webcamRef.current.stream.getTracks();
      tracks.forEach((track: MediaStreamTrack) => track.stop());
      setIsCameraReady(false);
      
      // Notify parent that camera is closed (pass null or empty string)
      onCaptureAction("");
    }
  }, [onCaptureAction]);

  // Handle webcam errors
  const handleWebcamError = useCallback((err: Error) => {
    console.error("Webcam error:", err);
    
    let errorMessage = "Failed to access camera";
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage = "Camera access denied. Please allow camera access in your browser settings.";
    } else if (err.name === 'NotFoundError') {
      errorMessage = "No camera found. Please connect a camera and try again.";
    } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
      errorMessage = "Camera is already in use by another application or not accessible.";
    } else if (err.name === 'OverconstrainedError') {
      // The requested constraints are not supported by the browser
      errorMessage = "The requested camera settings are not supported by your device.";
      // Try with default settings
      setFacingMode("user");
    } else {
      errorMessage = err.message || errorMessage;
    }
    
    setError(errorMessage);
  }, []);

  useEffect(() => {
    // Reset camera when facing mode changes
    setIsCameraReady(false);
    const timer = setTimeout(() => {
      setIsCameraReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [facingMode]);

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
              onClick={() => {
                setError(null);
                setIsCameraReady(true);
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {isCameraReady && (
              <DynamicWebcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMediaError={handleWebcamError}
                onUserMedia={() => setIsCameraReady(true)}
                className="w-full h-full object-cover"
                mirrored={facingMode === "user"}
              />
            )}
            
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

export default WebcamCapture; 