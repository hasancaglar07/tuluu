"use client";

import { m } from "framer-motion";

interface AnswerAreaProps {
  selectedWords: string[];
  selectedWordIndexes: number[];
  isCorrect: boolean | null;
  onWordSelect: (word: string, index: number) => void;
}

/**
 * Answer Area Component
 * Displays the user's selected words in the answer area
 */
export default function AnswerArea({
  selectedWords,
  selectedWordIndexes,
  isCorrect,
  onWordSelect,
}: AnswerAreaProps) {
  return (
    <div className="w-full mb-8">
      <div className="border-t border-b border-gray-200 py-4 min-h-20 flex items-center justify-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedWords.map((word, i) => (
            <m.button
              key={`selected-${i}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onWordSelect(word, selectedWordIndexes[i])}
              className={`px-4 py-2 rounded-xl border ${
                isCorrect === true
                  ? "bg-green-100 border-green-300 text-green-800"
                  : isCorrect === false
                  ? "bg-red-100 border-red-300 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              {word}
            </m.button>
          ))}
        </div>
      </div>
    </div>
  );
}
