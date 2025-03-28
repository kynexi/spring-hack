import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Subtitles({ text, isPlaying, currentTime, audioRef }) {
  const [currentText, setCurrentText] = useState("");
  const [words, setWords] = useState([]);
  const [currentSentence, setCurrentSentence] = useState("");

  useEffect(() => {
    if (text) {
      // Split text into sentences instead of words
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      setWords(sentences);
    }
  }, [text]);

  useEffect(() => {
    if (!audioRef.current || !isPlaying) {
      setCurrentText("");
      setCurrentSentence("");
      return;
    }

    // Calculate which sentence to show based on current time
    const duration = audioRef.current.duration || 1;
    const progress = currentTime / duration;
    const sentenceIndex = Math.floor(progress * words.length);

    if (sentenceIndex < words.length) {
      setCurrentSentence(words[sentenceIndex]);
    }
  }, [isPlaying, currentTime, words, audioRef]);

  return (
    <AnimatePresence mode="wait">
      {isPlaying && (
        <motion.div
          key={currentSentence}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-0 right-0 flex justify-center items-center w-full px-4"
        >
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-6 py-3 max-w-2xl mx-auto">
            <p className="text-white text-lg text-center leading-relaxed">
              {currentSentence}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Subtitles;
