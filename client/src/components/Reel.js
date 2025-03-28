import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Subtitles from "./Subtitles";

function Reel({ content, index, onNext, videoSrc }) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const togglePlayback = async () => {
    if (!audioRef.current || !isAudioLoaded) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Playback toggle failed:", error);
    }
  };

  useEffect(() => {
    // Initialize audio element
    if (content.voiceoverUrl && !audioRef.current) {
      audioRef.current = new Audio(
        `http://localhost:5001${content.voiceoverUrl}`
      );

      // Add event listeners
      audioRef.current.addEventListener("loadeddata", () => {
        setIsAudioLoaded(true);
        // Autoplay once loaded
        audioRef.current.play().catch((error) => {
          console.error("Autoplay failed:", error);
        });
      });

      audioRef.current.addEventListener("play", () => setIsPlaying(true));
      audioRef.current.addEventListener("pause", () => setIsPlaying(false));
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        onNext();
      });
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current.currentTime);
      });

      // Space key handler
      const handleKeyPress = (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          togglePlayback();
        }
      };
      window.addEventListener("keydown", handleKeyPress);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("loadeddata", () => {});
          audioRef.current.removeEventListener("play", () => {});
          audioRef.current.removeEventListener("pause", () => {});
          audioRef.current.removeEventListener("ended", () => {});
          audioRef.current.removeEventListener("timeupdate", () => {});
          audioRef.current = null;
        }
        window.removeEventListener("keydown", handleKeyPress);
        setIsAudioLoaded(false);
      };
    }
  }, [content.voiceoverUrl, onNext]);

  const voiceoverText = `${content.simpleExplanation} Here's a fun example: ${content.funExample}`;

  return (
    <motion.div
      className="h-screen flex items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={togglePlayback}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Content */}
      <div className="absolute top-[70%] left-0 right-0 z-10 px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 text-shadow-lg">
            {content.title}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Click/Space instructions */}
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 text-white/50 text-sm z-20">
        Press <span className="px-2 py-1 bg-white/10 rounded">space</span> or
        click anywhere to {isPlaying ? "pause" : "play"}
      </div>

      {/* Subtitles */}
      <Subtitles
        text={voiceoverText}
        isPlaying={isPlaying}
        currentTime={currentTime}
        audioRef={audioRef}
      />
    </motion.div>
  );
}

export default Reel;
