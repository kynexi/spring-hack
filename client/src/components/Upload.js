import React, { useState } from "react";
import { motion } from "framer-motion";

// ...existing imports...

function Upload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file:", file.name); // Debug log

      const response = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status); // Debug log

      const data = await response.json();
      console.log("Response data:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.slides && data.slides.length > 0) {
        onUploadComplete(data.slides);
      } else {
        throw new Error("No slides received");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className={`w-full max-w-xl p-8 rounded-xl ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 bg-gray-800/50"
        } border-2 border-dashed backdrop-blur-sm`}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files[0]);
        }}
      >
        {isLoading ? (
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white text-lg">Processing your content...</p>
          </div>
        ) : (
          <>
            <input
              type="file"
              className="hidden"
              id="fileInput"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              accept=".pdf,.ppt,.pptx"
            />
            <label
              htmlFor="fileInput"
              className="block text-center cursor-pointer"
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-4 text-blue-500"
                whileHover={{ scale: 1.1 }}
              >
                {/* Add an upload icon here */}
                📤
              </motion.div>
              <h3 className="text-white text-xl font-bold mb-2">
                Upload Your Content
              </h3>
              <p className="text-gray-400">
                Drop your slides here or click to browse
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Supports PDF, PPT, PPTX
              </p>
            </label>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default Upload;
