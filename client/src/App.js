import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Upload from "./components/Upload";
import ReelFeed from "./components/ReelFeed";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import Loading from "./components/Loading";

function App() {
  const [slides, setSlides] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadComplete = (newSlides) => {
    setIsLoading(true);
    setSlides(newSlides);
    setTimeout(() => setIsLoading(false), 500); // Smooth transition
  };

  const handleProgressUpdate = (currentIndex, totalSlides) => {
    const progress = Math.round((currentIndex / (totalSlides - 1)) * 100);
    setCurrentProgress(progress);
  };

  return (
    <div className="App min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <AnimatePresence mode="wait">
        {isLoading && <Loading />}

        {!slides ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-16"
          >
            <Upload onUploadComplete={handleUploadComplete} />
          </motion.div>
        ) : (
          <>
            <ProgressBar progress={currentProgress} />
            <ReelFeed
              slides={slides}
              onProgressUpdate={handleProgressUpdate}
              currentProgress={currentProgress}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
