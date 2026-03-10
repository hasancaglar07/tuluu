"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Exercise } from "@/types";
import { m } from "framer-motion";
import { Volume2 } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { detectMediaKind } from "@/lib/media";

// Character images for different states
const defaultCharacterStates = {
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
  const [showHoverHint, setShowHoverHint] = useState(false);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setShowHoverHint(false);
    if (hoverAudioRef.current) {
      hoverAudioRef.current.pause();
      hoverAudioRef.current = null;
    }
  }, [exercise?._id]);

  useEffect(() => {
    if (!exercise?.autoRevealMilliseconds) return;
    const timer = setTimeout(() => {
      setShowHoverHint(true);
      if (exercise.hoverHint?.audioUrl) {
        playHoverAudio();
      }
    }, exercise.autoRevealMilliseconds);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?._id, exercise?.autoRevealMilliseconds]);

  const playHoverAudio = () => {
    if (!exercise?.hoverHint?.audioUrl) return;
    try {
      hoverAudioRef.current?.pause();
      const audio = new Audio(exercise.hoverHint.audioUrl);
      hoverAudioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error("Failed to play hover hint audio", error);
    }
  };

  const spriteSources = useMemo(() => {
    const mediaPack = exercise?.mediaPack || {};
    return {
      neutral: mediaPack.idleAnimationUrl || defaultCharacterStates.neutral,
      happy:
        mediaPack.successAnimationUrl ||
        mediaPack.idleAnimationUrl ||
        defaultCharacterStates.happy,
      sad:
        mediaPack.failAnimationUrl ||
        mediaPack.idleAnimationUrl ||
        defaultCharacterStates.sad,
    };
  }, [exercise?.mediaPack]);

  const sourceKind = detectMediaKind(exercise?.sourceText);

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
        <div className="relative mb-8 w-full">
          <div className="flex items-center justify-center w-full rounded-[32px] border border-[#e0e7ff] bg-gradient-to-br from-[#f6f8ff] to-[#eef2ff] p-6 shadow-lg">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spriteSources[characterState] || "/placeholder.svg"}
              alt={exercise.mediaPack?.characterName || "TULU character"}
              className="h-36 w-full object-contain rounded-2xl border bg-white shadow-sm"
              loading="lazy"
            />
          </m.div>

          {/* Speech bubble with audio */}
            {exercise.sourceText && (
              <m.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-4 bg-white border border-gray-200 rounded-2xl p-4 pl-6 pr-8 relative shadow-md"
              >
              {/* Speech bubble tail */}
              <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45"></div>

              {/* Audio button and text */}
              <div
                className="flex items-center gap-3 relative"
                onMouseEnter={() => {
                  if (exercise.hoverHint?.text) {
                    setShowHoverHint(true);
                    playHoverAudio();
                  }
                }}
                onMouseLeave={() => {
                  if (exercise.hoverHint?.text) {
                    setShowHoverHint(false);
                  }
                }}
              >
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
                {sourceKind === "image" ? (
                  <div className="w-32 h-32 rounded-2xl border overflow-hidden bg-white shadow-sm flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exercise.sourceText}
                      alt="exercise-visual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : sourceKind === "video" ? (
                  <video
                    className="w-40 h-28 rounded-2xl border shadow-sm bg-black/70"
                    controls
                    src={exercise.sourceText}
                  />
                ) : sourceKind === "audio" ? (
                  <audio
                    className="w-48 h-10 rounded-xl border bg-white"
                    controls
                    src={exercise.sourceText}
                  />
                ) : (
                  <span className="text-lg font-semibold text-slate-800">
                    {exercise.sourceText}
                  </span>
                )}
                {exercise.hoverHint?.text && showHoverHint && (
                  <div className="absolute top-full left-0 mt-3 w-60 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 shadow-lg">
                    {exercise.hoverHint.text}
                  </div>
                )}
              </div>
            </m.div>
          )}
          </div>
        </div>
      )}
    </>
  );
}
