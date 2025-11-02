"use client";

import { Exercise } from "@/types";
import { m } from "framer-motion";
import { Volume2 } from "lucide-react";
import Image from "next/image";
import { FormattedMessage } from "react-intl";

// Character images for different states
const characterStates = {
  neutral: "/images/neutral_face.gif",
  happy: "/images/happy_face.gif",
  sad: "/images/sad_face.gif",
};

interface ExerciseDisplayProps {
  exercise: Exercise;
  characterState: "neutral" | "happy" | "sad";
  isSpeaking: boolean;
  onPlayAudio: () => void;
  showStreakTracker: boolean;
  showResults: boolean;
}

/**
 * Exercise Display Component
 * Shows the current exercise instruction, character animation, and speech bubble
 */
export default function ExerciseDisplay({
  exercise,
  characterState,
  isSpeaking,
  onPlayAudio,
  showStreakTracker,
  showResults,
}: ExerciseDisplayProps) {
  if (!exercise) return null;

  return (
    <>
      {/* Exercise instruction */}
      <div className="mb-6 text-center">
        {exercise.isNewWord && (
          <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium mb-2">
            <FormattedMessage id="lesson.newWord" defaultMessage="NEW WORD" />
          </div>
        )}
        <h4>{exercise.instruction}</h4>
      </div>

      {/* Character and speech bubble */}
      {!showStreakTracker && !showResults && (
        <div className="relative mb-8 flex items-center justify-center w-full">
          {/* Animated character */}
          <m.div
            animate={
              characterState === "happy"
                ? { y: [0, -10, 0] }
                : characterState === "sad"
                ? { x: [0, -5, 5, -5, 0] }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Image
              width={100}
              height={200}
              src={characterStates[characterState] || "/placeholder.svg"}
              alt="TULU character"
              className="h-36 w-full"
            />
          </m.div>

          {/* Speech bubble with audio */}
          {exercise.sourceText && (
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-4 bg-white border border-gray-200 rounded-2xl p-3 px-5 relative"
            >
              {/* Speech bubble tail */}
              <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45"></div>

              {/* Audio button and text */}
              <div className="flex items-center gap-3">
                <button onClick={onPlayAudio} className="text-purple-500">
                  <m.div
                    animate={isSpeaking ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{
                      repeat: isSpeaking ? Number.POSITIVE_INFINITY : 0,
                      duration: 0.5,
                    }}
                  >
                    <Volume2 className="h-5 w-5" />
                  </m.div>
                </button>
                <span className="text-lg">{exercise.sourceText}</span>
              </div>
            </m.div>
          )}
        </div>
      )}
    </>
  );
}
