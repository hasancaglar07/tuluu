"use client";
import { Flame } from "lucide-react";
import { m } from "framer-motion";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

interface StreakTrackerProps {
  streakCount: number;
  weekProgress: boolean[];
}

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  streakCount,
  weekProgress,
}) => {
  const router = useLocalizedRouter();
  return (
    <m.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 3 }}
      className="flex flex-col gap-6 bg-orange-50 rounded-3xl shadow-xl p-8 text-center w-full max-w-lg border border-orange-200"
    >
      <m.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.8, delay: 3.3 }}
        className="flex justify-center mb-4"
      >
        <div className="flex items-center justify-center gap-3 text-orange-500 font-bold">
          <Flame className="w-12 h-12 animate-pulse drop-shadow-md" />
          <span className="text-4xl">{streakCount}</span>
        </div>
      </m.div>

      <div className="flex justify-center gap-3 mb-4">
        {weekProgress &&
          weekProgress.map((completed, i) => (
            <m.div
              key={i}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 3.4 + i * 0.1, duration: 0.4 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-md ${
                completed
                  ? "bg-orange-500 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {dayLabels[i]}
            </m.div>
          ))}
      </div>

      <div className="text-3xl font-bold text-primary-600 drop-shadow-sm">
        {streakCount}-day streak!
      </div>
      <p className="text-base text-gray-600">
        You’re on fire! Keep the flame burning!
      </p>

      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboard")}
        className="px-10 py-4 mt-4 border-primary-400 text-white rounded-2xl"
      >
        CONTINUE
      </m.button>
    </m.div>
  );
};
