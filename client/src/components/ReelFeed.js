import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reel from "./Reel";

function ReelFeed({ slides, onProgressUpdate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent rapid transitions

  // Array of video file paths
  const videos = [
    "/videos/video1.mp4", // Ensure these files exist in the public folder
    "/videos/video1.mp4",
    "/videos/video1.mp4",
  ];

  useEffect(() => {
    onProgressUpdate(currentIndex, slides.length);

    // Automatically swipe to the next reel after 1 minute
    const timer = setTimeout(() => {
      handleNext();
    }, 60000); // 60 seconds

    return () => clearTimeout(timer); // Clear the timer when the component unmounts or index changes
  }, [currentIndex, slides.length, onProgressUpdate]);

  const handleNext = () => {
    if (isTransitioning) return; // Prevent rapid transitions
    setIsTransitioning(true);

    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back to the first reel
    }

    setTimeout(() => setIsTransitioning(false), 300); // Allow transitions after 300ms
  };

  const handleCircleClick = (index) => {
    if (isTransitioning) return; // Prevent rapid transitions
    setCurrentIndex(index); // Navigate to the corresponding reel
  };

  return (
    <div className="h-screen bg-black pt-16 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="h-full"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <Reel
            content={slides[currentIndex]}
            index={currentIndex}
            total={slides.length}
            onNext={handleNext}
            videoSrc={videos[currentIndex % videos.length]} // Cycle through videos
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 my-2 rounded-full cursor-pointer ${
              idx === currentIndex ? "bg-blue-500" : "bg-gray-500"
            }`}
            onClick={() => handleCircleClick(idx)} // Navigate to the corresponding reel
          />
        ))}
      </div>
    </div>
  );
}

export default ReelFeed;
