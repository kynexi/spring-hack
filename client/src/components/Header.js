import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Header() {
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem("audioVolume") || 1);
  });

  // Add handleLogoClick function
  const handleLogoClick = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    localStorage.setItem("audioVolume", volume);

    const updateAudioVolume = () => {
      const audioElements = document.getElementsByTagName("audio");
      Array.from(audioElements).forEach((audio) => {
        audio.volume = volume;
      });
    };

    updateAudioVolume();

    const observer = new MutationObserver(updateAudioVolume);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add click outside listener to close volume control
    const handleClickOutside = (e) => {
      if (!e.target.closest(".volume-control")) {
        setShowVolumeControl(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClickOutside);
    };
  }, [volume]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <motion.header
      className="fixed top-0 w-full z-50 bg-opacity-80 backdrop-blur-sm bg-gray-900"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={handleLogoClick}
        >
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">Scroll2Learn</h1>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="relative volume-control">
            <button
              className="text-white/70 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumeControl(!showVolumeControl);
              }}
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <span className="bg-white/10 rounded-lg px-3 py-2">
                  {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"} Volume
                </span>
              </motion.div>
            </button>

            <AnimatePresence>
              {showVolumeControl && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 p-4 bg-gray-800 rounded-lg shadow-lg w-48"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <label className="text-white text-sm block">Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full accent-blue-500"
                    />
                    <div className="text-white/70 text-xs text-right">
                      {Math.round(volume * 100)}%
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
