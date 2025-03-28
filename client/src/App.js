import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Upload from "./components/Upload";
import ReelFeed from "./components/ReelFeed";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";

function App() {
  const [slides, setSlides] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleProgressUpdate = (index, total) => {
    setCurrentProgress(((index + 1) / total) * 100);
  };

  return (
    <div className="App min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <AnimatePresence mode="wait">
        {!slides ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-16" // Add padding for header
          >
            <Upload onUploadComplete={setSlides} />
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
