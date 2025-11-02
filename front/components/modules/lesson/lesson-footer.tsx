"use client";

import { m } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import Container from "@/components/custom/container";
import ReportModal from "@/components/custom/report-modal";
import { cn } from "@/lib/utils";
import { FormattedMessage } from "react-intl";

interface LessonFooterProps {
  isCorrect: boolean | null;
  showNextButton: boolean;
  correctAnswer: string | null;
  selectedWords: string[];
  currentExerciseIndex: number;
  totalExercises: number;
  showResults: boolean;
  onCheck: () => void;
  onSkip: () => void;
  onContinue: () => void;
  exerciseId: string;
  lessonId: string;
}

/**
 * Lesson Footer Component
 * Handles feedback display and action buttons (check, skip, continue)
 */
export default function LessonFooter({
  isCorrect,
  showNextButton,
  correctAnswer,
  selectedWords,
  currentExerciseIndex,
  totalExercises,
  showResults,
  onCheck,
  onSkip,
  onContinue,
  lessonId,
  exerciseId,
}: LessonFooterProps) {
  console.log("LessonFooter rendered", exerciseId);
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
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Incorrect answer feedback */}
          {isCorrect === false && showNextButton && (
            <div className="flex flex-col md:flex-row gap-10 w-full">
              <m.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="items-center justify-center w-20 h-20 rounded-full bg-white text-red-500 hidden md:flex"
              >
                <m.div
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className=""
                >
                  <X strokeWidth={5} className="w-10 h-10" />
                </m.div>
              </m.div>
              <div className="flex flex-row justify-between gap-2 text-red-500 font-bold">
                <h6 className="flex gap-2">
                  <FormattedMessage id="lesson.correctAnswer" />
                  <span className="font-semibold">{correctAnswer}</span>
                </h6>
                <Link href="#" className="flex gap-2 flex-col">
                  {exerciseId && lessonId && (
                    <ReportModal
                      status="error"
                      exerciseId={exerciseId}
                      lessonId={lessonId}
                    />
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* Correct answer feedback */}
          {showNextButton && isCorrect && (
            <div className="flex gap-4 w-full">
              <m.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-white text-green-500 "
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
              <div className="flex md:flex-col gap-2 justify-between text-green-500 font-bold w-full">
                <h6>
                  <FormattedMessage id="lesson.correct" />
                </h6>
                <ReportModal
                  status="success"
                  exerciseId={exerciseId}
                  lessonId={lessonId}
                />
              </div>
            </div>
          )}

          {/* Skip button */}
          {currentExerciseIndex < totalExercises &&
            !showNextButton &&
            !showResults && (
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                className="w-full md:w-fit px-10 py-4 rounded-xl border border-gray-200 text-gray-400 font-light hover:bg-gray-600 cursor-pointer"
              >
                <FormattedMessage id="lesson.skip" />
              </m.button>
            )}

          {/* Check answer button */}
          {!showNextButton && currentExerciseIndex < totalExercises && (
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheck}
              disabled={selectedWords.length === 0 || isCorrect !== null}
              className={`w-full md:w-fit cursor-pointer px-10 py-4 rounded-xl font-light ${
                selectedWords.length === 0 || isCorrect !== null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-700"
              }`}
            >
              <FormattedMessage id="lesson.check" />
            </m.button>
          )}

          {/* Continue/Finish button */}
          {showNextButton && (
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className={cn(
                "w-full md:w-fit h-max px-10 py-4 rounded-2xl",
                isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
              )}
            >
              <FormattedMessage
                id={
                  currentExerciseIndex < totalExercises - 1
                    ? "lesson.continue"
                    : "lesson.finish"
                }
              />
            </m.button>
          )}
        </div>
      </Container>
    </footer>
  );
}
