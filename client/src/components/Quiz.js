import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Quiz({ content, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption !== null && !isSubmitted) {
      setIsSubmitted(true);
      setShowExplanation(true);

      // Show the explanation for 3 seconds before allowing to continue
      setTimeout(() => {
        onAnswer();
      }, 3000);
    }
  };

  // Prevent multiple submissions
  const handleOptionSelect = (index) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };

  return (
    <motion.div
      className="h-screen flex items-center justify-center relative bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md w-full mx-auto p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Quiz! 🧠</h2>

          <p className="text-white text-lg mb-6">{content.question}</p>

          <div className="space-y-3">
            {content.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitted}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedOption === index
                    ? isSubmitted
                      ? index === content.correctAnswer
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                    : isSubmitted && index === content.correctAnswer
                    ? "bg-green-500/50 text-white"
                    : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedOption === null || isSubmitted}
            className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all ${
              selectedOption === null || isSubmitted
                ? "bg-gray-600 text-gray-400"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isSubmitted ? "Submitted!" : "Submit Answer"}
          </button>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-gray-700/50 rounded-lg"
              >
                <p className="text-white">{content.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Quiz;
