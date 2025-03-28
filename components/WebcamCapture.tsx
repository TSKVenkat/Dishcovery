"use client";

// This file is kept as a placeholder to prevent import errors.
// The actual implementation has been moved to SimpleNativeCamera.tsx
// to avoid react-webcam typing issues.

import React from 'react';

interface WebcamCaptureProps {
  onCaptureAction: (imageSrc: string) => void;
}

// Simple placeholder that forwards to the proper component
const WebcamCapture = ({ onCaptureAction }: WebcamCaptureProps) => {
  console.warn('WebcamCapture is deprecated, use SimpleNativeCamera instead');
  
  return (
    <div className="w-full">
      <div className="relative w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-600 font-medium mb-2">Camera component has been moved</p>
          <p className="text-gray-600">
            This component has been deprecated due to compatibility issues.
            Use SimpleNativeCamera instead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture; 