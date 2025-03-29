import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Subtitles from "./Subtitles";

function Reel({ content, index, videoSrc }) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const blurredVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const voiceoverText = `${content.simpleExplanation} Here's a fun example: ${content.funExample}`;

  // Single effect to handle all media setup and synchronization
  useEffect(() => {
    if (!content.voiceoverUrl) return;

    audioRef.current = new Audio(
      `http://localhost:5001${content.voiceoverUrl}`
    );

    const savedVolume = localStorage.getItem("audioVolume");
    if (savedVolume !== null) {
      audioRef.current.volume = parseFloat(savedVolume);
    }
    const handleLoadedData = async () => {
      setIsAudioLoaded(true);
      try {
        // Start all media together
        await Promise.all([
          audioRef.current.play(),
          videoRef.current?.play(),
          blurredVideoRef.current?.play(),
        ]);
        setIsPlaying(true);
      } catch (error) {
        console.error("Initial playback failed:", error);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
    const handleEnded = () => {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    };

    // Set up audio event listeners
    audioRef.current.addEventListener("loadeddata", handleLoadedData);
    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("pause", handlePause);
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("ended", handleEnded);

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("loadeddata", handleLoadedData);
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.removeEventListener("pause", handlePause);
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleEnded);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (blurredVideoRef.current) {
        blurredVideoRef.current.pause();
      }
      setIsPlaying(false);
      setIsAudioLoaded(false);
    };
  }, [content.voiceoverUrl]);

  useEffect(() => {
    const handleVideoLoaded = async () => {
      if (videoRef.current && blurredVideoRef.current) {
        try {
          await videoRef.current.play();
          await blurredVideoRef.current.play();
        } catch (error) {
          console.error("Video autoplay failed:", error);
        }
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("loadeddata", handleVideoLoaded);
      blurredVideoRef.current.addEventListener("loadeddata", handleVideoLoaded);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadeddata", handleVideoLoaded);
        blurredVideoRef.current.removeEventListener(
          "loadeddata",
          handleVideoLoaded
        );
      }
    };
  }, []);

  // Handle play/pause toggling
  const togglePlayback = async () => {
    if (!audioRef.current || !isAudioLoaded) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        videoRef.current?.pause();
        blurredVideoRef.current?.pause();
      } else {
        await Promise.all([
          audioRef.current.play(),
          videoRef.current?.play(),
          blurredVideoRef.current?.play(),
        ]);
      }
    } catch (error) {
      console.error("Playback toggle failed:", error);
    }
  };

  // Space key handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <motion.div
      className="h-screen flex items-center justify-center relative bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={togglePlayback}
    >
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={blurredVideoRef}
          className="absolute w-full h-full object-cover scale-110 blur-2xl opacity-50"
          src={videoSrc}
          playsInline
          muted
          loop
          preload="auto"
          autoPlay
        />
      </div>

      <div className="relative h-full aspect-[9/16] mx-auto z-10">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover bg-gray-900 rounded-lg"
          src={videoSrc}
          playsInline
          muted
          loop
          preload="auto"
          autoPlay
        />

        {/* Content - Moved up */}
        <div className="absolute top-8 left-0 right-0 z-20 px-6">
          <div className="max-w-md mx-auto text-center relative">
            {/* Background for the title */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: "rgba(128, 0, 128, 0.7)", // Light purple background with transparency
                zIndex: -1, // Position the background behind the text
              }}
            ></div>

            {/* Title text */}
            <h2
              className="text-4xl font-extrabold text-white mb-4 relative"
              style={{
                textShadow: "4px 4px 8px rgba(0, 0, 0, 0.8)", // Add a strong shadow for contrast
              }}
            >
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
