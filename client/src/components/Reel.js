import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function Reel({ content, index, onNext, videoSrc }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0); // State to track video progress

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) {
        const currentTime = video.currentTime;
        const duration = video.duration || 1; // Avoid division by zero
        setProgress((currentTime / duration) * 100); // Calculate progress percentage
      }
    };

    if (video) {
      video.currentTime = 0; // Reset video to the beginning
      video.play().catch((error) => {
        console.warn("Video playback interrupted:", error);
      });
      video.addEventListener("timeupdate", handleTimeUpdate); // Listen for time updates
    }

    return () => {
      if (video) {
        video.pause();
        video.removeEventListener("timeupdate", handleTimeUpdate); // Cleanup event listener
      }
    };
  }, [index]);

  return (
    <motion.div
      className="h-screen flex items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        style={{
          width: "720px",
          height: "1280px",
          objectFit: "cover",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-black" />

      {/* Content */}
      <div className="relative z-10 max-w-md text-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-200">{content.description}</p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              onClick={onNext}
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>

      {/* Slide number */}
      <div className="absolute bottom-8 right-8 text-white text-xl">
        {index + 1}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-700">
        <motion.div
          className="h-2 bg-blue-500"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
}

export default Reel;