import React from "react";
import { motion } from "framer-motion";

function ProgressBar({ progress }) {
  return (
    <div className="fixed top-[56px] left-1/2 transform -translate-x-1/2 z-40" style={{ width: "calc(100% - 2rem)" }}> 
      <div className="w-full bg-gray-700 h-[2px]">
        <motion.div
          className="bg-blue-500 h-[2px]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;