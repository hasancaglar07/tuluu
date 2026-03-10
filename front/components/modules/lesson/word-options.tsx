"use client";

import { m } from "framer-motion";
import { detectMediaKind } from "@/lib/media";
import { cn } from "@/lib/utils";

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
    <div className="w-full mb-8 flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {options.map((option, index) => {
          const mediaKind = detectMediaKind(option);
          const disabled = selectedWordIndexes.includes(index) || isCorrect !== null;
          const optionLabel = String.fromCharCode(65 + (index % 26));
          return (
            <m.button
              key={`option-${index}-${option}`}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => onWordSelect(option, index)}
              disabled={disabled}
              className={cn(
                "w-full rounded-[28px] border border-gray-200 bg-white shadow-sm px-4 py-6 flex flex-col items-center gap-3 transition-all duration-150",
                disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-primary/40 hover:shadow-lg"
              )}
            >
              {mediaKind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={option}
                  alt={`option-${index + 1}`}
                  className="w-32 h-32 object-contain rounded-2xl border bg-slate-50"
                />
              ) : mediaKind === "audio" ? (
                <audio className="w-full" controls src={option} />
              ) : mediaKind === "video" ? (
                <video className="w-full rounded-2xl border" controls src={option} />
              ) : (
                <span className="text-lg font-semibold text-slate-800 capitalize text-center">
                  {option}
                </span>
              )}
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {optionLabel}
              </span>
            </m.button>
          );
        })}
      </div>
    </div>
  );
}
