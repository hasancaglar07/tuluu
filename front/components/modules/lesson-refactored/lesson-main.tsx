"use client";

import type React from "react";

import { m, AnimatePresence } from "framer-motion";
import { Volume2, Check, X, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Exercise {
  _id: string;
  instruction: string;
  sourceText?: string;
  sourceLanguage?: string;
  isNewWord?: boolean;
  options?: string[];
  correctAnswer: string[];
}

interface LessonContent {
  lessonId: string;
  exercises: Exercise[];
  xpReward: number;
}

interface LessonMainProps {
  lessonContent: LessonContent;
  currentExercise: Exercise | undefined;
  currentExerciseIndex: number;
  selectedWords: string[];
  selectedWordIndexes: number[];
  isCorrect: boolean | null;
  characterState: "neutral" | "happy" | "sad";
  showResults: boolean;
  showStreakTracker: boolean;
  hearts: number;
  earnedXp: number;
  isSpeaking: boolean;
  onWordSelect: (word: string, index: number) => void;
  onPlayAudio: () => void;
  onContinueResults: () => void;
  onReturnToDashboard: () => void;
  streakTracker?: React.ReactNode;
}

const characterStates = {
  neutral: "/images/neutral_face.gif",
  happy: "/images/happy_face.gif",
  sad: "/images/sad_face.gif",
};

export function LessonMain({
  lessonContent,
  currentExercise,
  selectedWords,
  selectedWordIndexes,
  isCorrect,
  characterState,
  showResults,
  showStreakTracker,
  hearts,
  earnedXp,
  isSpeaking,
  onWordSelect,
  onPlayAudio,
  onContinueResults,
  onReturnToDashboard,
  streakTracker,
}: LessonMainProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full h-full">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <m.div
            key="exercise"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            {/* Exercise instruction */}
            <div className="mb-6 text-center">
              {currentExercise && currentExercise.isNewWord && (
                <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  NEW WORD
                </div>
              )}
              <h4 className="">
                {currentExercise && currentExercise.instruction}
              </h4>
            </div>

            {/* Character and speech bubble */}
            {!showStreakTracker && (
              <>
                <div className="relative mb-8 flex items-center justify-center w-full">
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
                      src={
                        characterStates[characterState] || "/placeholder.svg"
                      }
                      alt="TULU character"
                      className="h-36 w-full"
                    />
                  </m.div>

                  {currentExercise?.sourceText && (
                    <m.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-4 bg-white border border-gray-200 rounded-2xl p-3 px-5 relative"
                    >
                      <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45"></div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={onPlayAudio}
                          className="text-purple-500"
                        >
                          <m.div
                            animate={
                              isSpeaking ? { scale: [1, 1.3, 1] } : { scale: 1 }
                            }
                            transition={{
                              repeat: isSpeaking ? Number.POSITIVE_INFINITY : 0,
                              duration: 0.5,
                            }}
                          >
                            <Volume2 className="h-5 w-5" />
                          </m.div>
                        </button>
                        <span className="text-lg">
                          {currentExercise.sourceText}
                        </span>
                      </div>
                    </m.div>
                  )}
                </div>

                {/* Answer area */}
                <div className="w-full mb-8">
                  <div className="border-t border-b border-gray-200 py-4 min-h-16 flex items-center justify-center">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedWords.map((word, i) => (
                        <m.button
                          key={`selected-${i}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            onWordSelect(word, selectedWordIndexes[i])
                          }
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
              </>
            )}

            {/* Word options */}
            <div className="w-full mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {currentExercise?.options?.map((option, index) => (
                  <m.button
                    key={`option-${index}-${option}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onWordSelect(option, index)}
                    disabled={
                      selectedWordIndexes.includes(index) || isCorrect !== null
                    }
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
          </m.div>
        ) : (
          <m.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center py-8"
          >
            <div className="text-center mb-8">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4"
              >
                {hearts > 0 ? (
                  <div className="bg-green-500 text-white rounded-full p-6 inline-block">
                    <Check className="h-16 w-16" />
                  </div>
                ) : (
                  <div className="bg-red-500 text-white rounded-full p-6 inline-block">
                    <X className="h-16 w-16" />
                  </div>
                )}
              </m.div>

              <h1 className="text-3xl font-bold mb-2">
                {hearts > 0 ? "Leçon terminée !" : "Essaie encore !"}
              </h1>
              <p className="text-gray-600 mb-4">
                {hearts > 0
                  ? `Tu as gagné ${earnedXp} XP`
                  : "Tu as perdu tous tes cœurs. Réessaie pour gagner de l'XP !"}
              </p>

              {hearts > 0 && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-4 mb-8"
                >
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Leçon {lessonContent.lessonId} complétée</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <div className="bg-green-500 text-white p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>+{earnedXp} XP</span>
                  </div>
                </m.div>
              )}
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
              <m.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinueResults}
                className="w-full py-4 rounded-2xl bg-[#58cc02] text-white font-bold flex items-center justify-center gap-2"
              >
                {hearts > 0 ? (
                  <>
                    <span>CONTINUER</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <span>RÉESSAYER</span>
                )}
              </m.button>

              {hearts > 0 && (
                <m.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onReturnToDashboard}
                  className="w-full py-4 rounded-2xl border border-gray-200 text-gray-700 font-bold"
                >
                  RETOUR AU TABLEAU DE BORD
                </m.button>
              )}
            </div>
          </m.div>
        )}
        {streakTracker}
      </AnimatePresence>
    </main>
  );
}
