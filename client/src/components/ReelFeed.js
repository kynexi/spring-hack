import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reel from "./Reel";
import Quiz from "./Quiz";

function ReelFeed({ slides, onProgressUpdate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [direction, setDirection] = useState(0);

  // Array of video file paths
  const videos = [
    "/videos/video1.mp4", // Ensure these files exist in the public folder
    "/videos/video2.mp4",
    "/videos/video4.mp4",
    "/videos/video5.mp4",
    "/videos/video6.mp4",
    "/videos/video7.mp4",
    "/videos/video8.mp4",
    "/videos/video9.mp4",
    "/videos/video10.mp4",
  ];

  const handleDragStart = (event, info) => {
    setDragStart(info.point.y);
  };

  const handleDragEnd = (event, info) => {
    if (isTransitioning) return;

    const dragDistance = info.point.y - dragStart;
    const dragThreshold = 50; // Reduced threshold for more responsive feel

    if (Math.abs(dragDistance) > dragThreshold) {
      setIsTransitioning(true);
      if (dragDistance > 0 && currentIndex > 0) {
        setDirection(1);
        setCurrentIndex((prev) => prev - 1);
      } else if (dragDistance < 0 && currentIndex < slides.length - 1) {
        setDirection(-1);
        setCurrentIndex((prev) => prev + 1);
      }
      setTimeout(() => setIsTransitioning(false), 400);
    }
  };

  // Variants for smooth animation
  const slideVariants = {
    enter: (direction) => ({
      y: direction > 0 ? -700 : 700,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      y: direction < 0 ? -700 : 700,
      opacity: 0,
    }),
  };

  return (
    <div className="h-screen bg-black pt-16 overflow-hidden">
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="h-full touch-none"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.9}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          dragDirectionLock
          dragMomentum={false}
        >
          {slides[currentIndex].type === "quiz" ? (
            <Quiz
              content={slides[currentIndex]}
              onAnswer={() => {
                if (currentIndex < slides.length - 1) {
                  setDirection(-1);
                  setCurrentIndex((prev) => prev + 1);
                }
              }}
            />
          ) : (
            <Reel
              content={slides[currentIndex]}
              index={currentIndex}
              total={slides.length}
              videoSrc={videos[currentIndex % videos.length]}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-[9999]">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 my-2 rounded-full cursor-pointer ${
              idx === currentIndex ? "bg-blue-500" : "bg-gray-500"
            }`}
            onClick={() => {
              if (!isTransitioning) {
                setDirection(idx > currentIndex ? -1 : 1);
                setCurrentIndex(idx);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ReelFeed;
