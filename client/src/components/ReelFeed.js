import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reel from "./Reel";

function ReelFeed({ slides, onProgressUpdate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    onProgressUpdate(currentIndex, slides.length);
  }, [currentIndex, slides.length, onProgressUpdate]);

  const handleSwipe = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.y < -swipeThreshold && currentIndex < slides.length - 1) {
      setSwipeDirection("up");
      setCurrentIndex((prev) => prev + 1);
    } else if (info.offset.y > swipeThreshold && currentIndex > 0) {
      setSwipeDirection("down");
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="h-screen bg-black pt-16 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleSwipe}
          className="h-full"
          initial={{ opacity: 0, y: swipeDirection === "up" ? 100 : -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: swipeDirection === "up" ? -100 : 100 }}
          transition={{ duration: 0.3 }}
        >
          <Reel
            content={slides[currentIndex]}
            index={currentIndex}
            total={slides.length}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 my-1 rounded-full ${
              idx === currentIndex ? "bg-blue-500" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ReelFeed;
