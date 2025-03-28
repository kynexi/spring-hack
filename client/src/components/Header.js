import React from "react";
import { motion } from "framer-motion";

function Header() {
  return (
    <motion.header
      className="fixed top-0 w-full z-50 bg-opacity-80 backdrop-blur-sm bg-gray-900"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold text-white"
          whileHover={{ scale: 1.05 }}
        >
          Scroll2Learn
        </motion.h1>
      </div>
    </motion.header>
  );
}

export default Header;