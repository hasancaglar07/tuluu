"use client";

import { m } from "framer-motion";

interface WordOptionsProps {
  options: string[];
  selectedWordIndexes: number[];
  isCorrect: boolean | null;
  onWordSelect: (word: string, index: number) => void;
}

/**
 * Word Options Component
 * Displays available word options for the user to select from
 */
export default function WordOptions({
  options,
  selectedWordIndexes,
  isCorrect,
  onWordSelect,
}: WordOptionsProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((option, index) => (
          <m.button
            key={`option-${index}-${option}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onWordSelect(option, index)}
            disabled={selectedWordIndexes.includes(index) || isCorrect !== null}
            className={`px-4 py-2 rounded-xl border border-gray-200 ${
              selectedWordIndexes.includes(index)
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            {option}
          </m.button>
        ))}
      </div>
    </div>
  );
}
