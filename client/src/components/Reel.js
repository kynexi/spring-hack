import React from "react";
import { motion } from "framer-motion";

function Reel({ content, index }) {
  return (
    <motion.div
      className="h-screen flex items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-black" />

      <div className="relative z-10 max-w-md text-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-200">{content.description}</p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
              Learn More
            </button>
            <button className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
              Next
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-8 text-white text-xl">
        {index + 1}
      </div>
    </motion.div>
  );
}

export default Reel;
