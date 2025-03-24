"use client";  

import { useState, useEffect } from "react";
import CameraBox from "@/components/ui/livecamera";

export default function ImageSelector() {
  const [mode, setMode] = useState("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dish, setDish] = useState("");

  useEffect(() => {
    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      setImageUrl(storedImage);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      saveImage(file);
    }
  };

  const handleCapture = (file: File) => {
    setSelectedFile(file);
    saveImage(file);
  };

  const saveImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        localStorage.setItem("uploadedImage", reader.result as string);
        setImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !dish.trim()) {
      alert("Please select an image and enter a dish name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("dish", dish);

    try {
      const res = await fetch(
        "https://gdg-on-campus-6usneuzme-kushvinth-madhavans-projects.vercel.app/api/process-image/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("Response:", data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col items-center">
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => setMode("file")}
        >
          Upload image
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() => setMode("camera")}
        >
          Take live image
        </button>
      </div>

      <div className="mt-4 w-full flex flex-col items-center">
        {mode === "file" ? (
          <input
            type="file"
            className="w-64 h-16 border rounded-lg p-2"
            onChange={handleFileChange}
          />
        ) : (
          <CameraBox onCapture={handleCapture} />
        )}

        {imageUrl && (
          <div className="mt-4">
            <p>Selected Image:</p>
            <img
              src={imageUrl}
              alt="Selected"
              className="w-32 h-32 object-cover border rounded-lg"
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Enter dish name"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          className="mt-4 w-64 p-2 border rounded-lg"
        />

        <button
          onClick={handleUpload}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          Process Image
        </button>
      </div>
    </div>
  );
}

