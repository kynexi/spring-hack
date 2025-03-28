import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

function Upload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  const handleFileSelect = async (file) => {
    try {
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Please upload a PDF or Word document");
      }

      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      if (data.slides && data.slides.length > 0) {
        onUploadComplete(data.slides);
      } else {
        throw new Error("No content could be extracted from file");
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
        } border-2 border-dashed backdrop-blur-sm transition-colors duration-200`}
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
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white text-lg mb-2">
                Processing your content...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <input
                type="file"
                className="hidden"
                id="fileInput"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept=".pdf,.doc,.docx"
              />
              <label
                htmlFor="fileInput"
                className="block text-center cursor-pointer group"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 text-blue-500 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <CloudArrowUpIcon className="w-16 h-16 group-hover:text-blue-400 transition-colors" />
                </motion.div>
                <h3 className="text-white text-xl font-bold mb-2">
                  Upload Your Content
                </h3>
                <p className="text-gray-400 mb-2">
                  Drop your document here or click to browse
                </p>
                <p className="text-gray-500 text-sm">
                  Supports PDF and Word documents (max 50MB)
                </p>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Upload;
