"use client";

import { m } from "framer-motion";
import { detectMediaKind } from "@/lib/media";

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
        <div className="flex flex-wrap gap-3 justify-center w-full max-w-4xl">
          {selectedWords.map((word, i) => {
            const mediaKind = detectMediaKind(word);
            return (
              <m.button
                key={`selected-${i}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onWordSelect(word, selectedWordIndexes[i])}
                className={`px-4 py-2 rounded-2xl border min-w-[88px] min-h-[64px] flex items-center justify-center ${
                  isCorrect === true
                    ? "bg-green-100 border-green-300 text-green-800"
                    : isCorrect === false
                    ? "bg-red-100 border-red-300 text-red-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                {mediaKind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={word}
                    alt="selected-word"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : mediaKind === "audio" ? (
                  <audio className="w-32" controls src={word} />
                ) : mediaKind === "video" ? (
                  <video className="w-32 h-20 rounded-xl" controls src={word} />
                ) : (
                  word
                )}
              </m.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
