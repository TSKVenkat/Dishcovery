"use client";

// This file is kept as a placeholder to prevent import errors.
// The actual implementation has been moved to SimpleNativeCamera.tsx
// to avoid react-webcam typing issues.

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface WebcamCaptureProps {
  onCaptureAction: (imageSrc: string) => void;
}

// Simple placeholder that forwards to the proper component
const WebcamCapture = ({ onCaptureAction }: WebcamCaptureProps) => {
  console.warn('WebcamCapture is deprecated, use SimpleNativeCamera instead');
  
  return (
    <div className="w-full">
      <div className="relative w-full h-80 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
        <div className="text-center p-6">
          <AlertCircle size={36} className="text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">Camera component has been moved</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            This component has been deprecated due to compatibility issues.
            Use SimpleNativeCamera instead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture; 