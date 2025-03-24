"use client";

import { useRef, useEffect, useState } from "react";

export default function CameraBox({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
            onCapture(file); // Send the file to parent component
          }
        }, "image/jpeg");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-md">
      <video ref={videoRef} autoPlay className="w-full max-w-md rounded-lg" />
      
      {/* Capture Button */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={captureImage}
      >
        Capture Image
      </button>

      {/* Stop Camera Button */}
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        onClick={() => stream?.getTracks().forEach((track) => track.stop())}
      >
        Stop Camera
      </button>
    </div>
  );
}

