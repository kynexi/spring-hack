import React from "react";
import { motion } from "framer-motion";

function ProgressBar({ progress }) {
  return (
    <div className="fixed top-16 left-0 w-full z-40 px-4 py-2">
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
