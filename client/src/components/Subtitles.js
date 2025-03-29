import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Subtitles({ text, isPlaying, currentTime, audioRef }) {
  const [currentPhrase, setCurrentPhrase] = useState("");

  useEffect(() => {
    if (!text || !audioRef.current) return;

    // Split into smaller, more digestible chunks (3-4 words each)
    const phrases = text
      .split(/[.!?]+/)
      .flatMap((sentence) => {
        const words = sentence.trim().split(" ");
        const chunks = [];
        for (let i = 0; i < words.length; i += 4) {
          chunks.push(words.slice(i, i + 4).join(" "));
        }
        return chunks;
      })
      .filter((phrase) => phrase.length > 0);

    if (!isPlaying) {
      setCurrentPhrase("");
      return;
    }

    // Calculate timing
    const duration = audioRef.current.duration;
    const timePerPhrase = duration / phrases.length;
    const currentPhraseIndex = Math.floor(currentTime / timePerPhrase);

    if (currentPhraseIndex < phrases.length) {
      setCurrentPhrase(phrases[currentPhraseIndex]);
    }
  }, [text, isPlaying, currentTime, audioRef]);

  return (
    <AnimatePresence mode="wait">
      {isPlaying && currentPhrase && (
        <motion.div
          key={currentPhrase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-20 left-0 right-0 flex justify-center items-center px-4 z-30"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-8 py-4">
            <motion.p
              className="text-white text-4xl font-bold leading-tight tracking-wide text-center"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                maxWidth: "280px",
                wordBreak: "break-word",
              }}
            >
              {currentPhrase}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default Subtitles;
