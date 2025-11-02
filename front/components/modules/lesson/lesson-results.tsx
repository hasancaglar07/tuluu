"use client";

import { IRootState } from "@/store";
import { m } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

interface LessonResultsProps {
  hearts: number;
  earnedXp: number;
  lessonId: string;
  onContinue: () => void;
  onRetry: () => void;
}

/**
 * Lesson Results Component
 * Displays the final results screen after lesson completion
 */
export default function LessonResults({
  hearts,
  earnedXp,
  lessonId,
  onContinue,
  onRetry,
}: LessonResultsProps) {
  const heartsData = useSelector(
    (state: IRootState) => state.settings.currencies.hearts
  );

  return (
    <m.div
      key="results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center justify-center py-8"
    >
      <div className="text-center mb-8">
        {/* Success/Failure icon */}
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

        {/* Result title */}
        <h1 className="text-3xl font-bold mb-2">
          <FormattedMessage
            id={hearts > 0 ? "lesson.completed" : "lesson.tryAgain"}
          />
        </h1>

        {/* Result description */}
        <p className="text-gray-600 mb-4">
          <FormattedMessage
            id={hearts > 0 ? "lesson.earnedXp" : "lesson.lostAllHearts"}
            values={{
              xp: earnedXp,
              hours: heartsData.refillTimeHours,
            }}
          />
        </p>

        {/* Success achievements */}
        {hearts > 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            {/* Lesson completion badge */}
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              <div className="bg-blue-500 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              <span>
                <FormattedMessage
                  id="lesson.completedId"
                  values={{ id: lessonId }}
                />
              </span>
            </div>

            {/* XP earned badge */}
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <div className="bg-green-500 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              <span>+{earnedXp} XP</span>
            </div>
          </m.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Primary action button */}
        <m.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={hearts > 0 ? onContinue : onRetry}
          className="w-full py-4 rounded-2xl bg-[#58cc02] text-white font-bold flex items-center justify-center gap-2"
        >
          {hearts > 0 ? (
            <>
              <span>
                <FormattedMessage id="lesson.continue" />
              </span>
              <ArrowRight className="h-5 w-5" />
            </>
          ) : (
            <span>
              <FormattedMessage id="lesson.retry" />
            </span>
          )}
        </m.button>

        {/* Secondary action button (only for success) */}
        {hearts > 0 && (
          <m.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="w-full py-4 rounded-2xl border border-gray-200 text-gray-700 font-bold"
          >
            <FormattedMessage id="lesson.backToDashboard" />
          </m.button>
        )}
      </div>
    </m.div>
  );
}
