import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Subtitles from "./Subtitles";

function Reel({ content, index, onNext, videoSrc }) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  // Define voiceoverText
  const voiceoverText = `${content.simpleExplanation} Here's a fun example: ${content.funExample}`;
  const blurredVideoRef = useRef(null);
  const togglePlayback = async () => {
    if (!audioRef.current || !isAudioLoaded) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
        if (videoRef.current) {
          videoRef.current.pause();
        }
        if (blurredVideoRef.current) {
          blurredVideoRef.current.pause();
        }
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        if (videoRef.current) {
          videoRef.current
            .play()
            .catch((e) => console.error("Video play failed:", e));
        }
        if (blurredVideoRef.current) {
          blurredVideoRef.current
            .play()
            .catch((e) => console.error("Blurred video play failed:", e));
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Playback toggle failed:", error);
    }
  };

  // Handle space key globally
  useEffect(
    () => {
      const handleKeyPress = (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          togglePlayback();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    },
    [
      /* Remove dependencies here */
    ]
  ); // Space handler shouldn't depend on state

  // Handle audio setup
  useEffect(() => {
    if (content.voiceoverUrl) {
      audioRef.current = new Audio(
        `http://localhost:5001${content.voiceoverUrl}`
      );

      const handleLoadedData = () => {
        setIsAudioLoaded(true);
        audioRef.current.play().catch((error) => {
          console.error("Autoplay failed:", error);
        });
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        onNext();
      };
      const handleTimeUpdate = () =>
        setCurrentTime(audioRef.current.currentTime);

      audioRef.current.addEventListener("loadeddata", handleLoadedData);
      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);
      audioRef.current.addEventListener("ended", handleEnded);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("loadeddata", handleLoadedData);
          audioRef.current.removeEventListener("play", handlePlay);
          audioRef.current.removeEventListener("pause", handlePause);
          audioRef.current.removeEventListener("ended", handleEnded);
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current = null;
        }
        setIsAudioLoaded(false);
        setIsPlaying(false); // Add this
      };
    }
  }, [content.voiceoverUrl, onNext]);

  // Add video handling
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        console.log("Video loaded successfully");
        if (isPlaying) {
          videoRef.current
            .play()
            .catch((e) => console.error("Video autoplay failed:", e));
        } else {
          videoRef.current.pause();
        }
      };

      videoRef.current.onerror = (e) => {
        console.error("Video loading error:", {
          error: e,
          src: videoSrc,
          networkState: videoRef.current?.networkState,
        });
      };
    }
  }, [videoSrc, isPlaying]); // Add isPlaying as a dependency

  return (
    <motion.div
      className="h-screen flex items-center justify-center relative bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={togglePlayback}
    >
      {/* Background blur for video edges */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={blurredVideoRef}
          className="absolute w-full h-full object-cover scale-110 blur-2xl opacity-50"
          src={videoSrc}
          autoPlay
          playsInline
          muted
          loop
        />
      </div>

      {/* Video container with 9:16 aspect ratio */}
      <div className="relative h-full aspect-[9/16] mx-auto z-10">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover bg-gray-900 rounded-lg"
          src={videoSrc}
          autoPlay
          playsInline
          muted
          loop
          onError={(e) => {
            console.error("Video playback error:", {
              error: e,
              src: videoSrc,
              networkState: videoRef.current?.networkState,
            });
          }}
        />

        {/* Content - Moved up */}
        <div className="absolute top-8 left-0 right-0 z-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4 text-shadow-lg">
              {content.title}
            </h2>
          </div>
        </div>

        {/* Space/Click instructions */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white/50 text-sm z-20">
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
      </div>
    </motion.div>
  );
}

export default Reel;
