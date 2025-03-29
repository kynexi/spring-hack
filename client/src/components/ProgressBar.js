import React from "react";
import { motion } from "framer-motion";

function ProgressBar({ progress, streak = 0 }) {
  return (
    <div className="fixed top-[56px] left-0 right-0 z-40">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Progress bar */}
        <div className="flex-1 bg-gray-700 h-[2px] mr-4">
          <motion.div
            className="bg-blue-500 h-[2px]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Streak counter */}
        <motion.div
          className="flex items-center gap-2 text-white/70"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-orange-400">🔥</span>
          <span className="font-bold">{streak}</span>
          <span>day streak</span>
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressBar;
