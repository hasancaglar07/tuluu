"use client";

import { m } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import Container from "@/components/custom/container";
import ReportModal from "@/components/custom/report-modal";
import { cn } from "@/lib/utils";

interface LessonFooterProps {
  isCorrect: boolean | null;
  showNextButton: boolean;
  showResults: boolean;
  currentExerciseIndex: number;
  totalExercises: number;
  selectedWords: string[];
  correctAnswer: string | null;
  onSkip: () => void;
  onCheck: () => void;
  onNext: () => void;
  currentExercise: string;
  lessonId: string;
}

export function LessonFooter({
  isCorrect,
  showNextButton,
  showResults,
  currentExerciseIndex,
  totalExercises,
  selectedWords,
  correctAnswer,
  onSkip,
  onCheck,
  onNext,
  currentExercise,
  lessonId,
}: LessonFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-t-border py-8 transition-colors duration-300",
        isCorrect === true
          ? "bg-green-100"
          : isCorrect === false
          ? "bg-red-100"
          : "bg-white"
      )}
    >
      <Container>
        <div className="w-full flex justify-between items-center">
          {isCorrect === false && showNextButton && (
            <div className="flex gap-4">
              <m.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-white text-red-500"
              >
                <m.div
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <X strokeWidth={5} className="w-10 h-10" />
                </m.div>
              </m.div>
              <div className="flex flex-col gap-2 text-red-500 font-bold">
                <h6>
                  Correct Answer:{" "}
                  <span className="font-semibold">{correctAnswer}</span>
                </h6>
                <Link href="#" className="flex gap-2 flex-col">
                  <ReportModal
                    status="error"
                    exerciseId={currentExercise}
                    lessonId={lessonId}
                  />
                </Link>
              </div>
            </div>
          )}

          {showNextButton && isCorrect && (
            <div className="flex gap-4">
              <m.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-white text-green-500"
              >
                <m.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <Check strokeWidth={5} className="w-10 h-10" />
                </m.div>
              </m.div>
              <div className="flex flex-col gap-2 text-green-500 font-bold">
                <h6>Génial</h6>
                <ReportModal
                  status="success"
                  exerciseId={currentExercise}
                  lessonId={lessonId}
                />
              </div>
            </div>
          )}

          {currentExerciseIndex < totalExercises &&
            !showNextButton &&
            !showResults && (
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                className="px-10 py-2 rounded-xl border border-gray-200 text-gray-400 font-light hover:bg-gray-600 cursor-pointer"
              >
                SKIP
              </m.button>
            )}

          {!showNextButton && currentExerciseIndex < totalExercises && (
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheck}
              disabled={selectedWords.length === 0 || isCorrect !== null}
              className={`cursor-pointer px-10 py-2 rounded-xl font-light  ${
                selectedWords.length === 0 || isCorrect !== null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-700"
              }`}
            >
              CHECK
            </m.button>
          )}

          {showNextButton && (
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className={cn(
                "h-max px-10 py-4 rounded-2xl",
                isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
              )}
            >
              {currentExerciseIndex < totalExercises - 1
                ? "CONTINUE"
                : "Finish Lesson"}
            </m.button>
          )}
        </div>
      </Container>
    </footer>
  );
}
