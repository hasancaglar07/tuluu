"use client";

import { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { m } from "framer-motion";
import confetti from "canvas-confetti";
import { useDispatch, useSelector } from "react-redux";
import type { IRootState } from "@/store";
import {
  completeLessonExercises,
  markLessonCompleted,
  selectLessonContent,
} from "@/store/lessonsSlice";
import { updateHearts } from "@/store/userSlice";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { StreakTracker } from "@/components/custom/streak-tracker";
import NoExercises from "@/components/custom/no-exercises";
import ContinueLearningEncouragement from "@/components/custom/ContinueLearningEncouragement";
import { LessonHeader } from "./lesson-header";
import { LessonFooter } from "./lesson-footer";
import { LessonMain } from "./lesson-main";
import { markLessonAsPassed } from "@/store/progressSlice";
import { Lesson, Unit } from "@/types";

export default function LessonRefactored({
  id,
  unit,
  lastUnit,
  nextLesson,
}: {
  id: string;
  unit?: Unit;
  lastUnit?: Unit;
  nextLesson?: Lesson;
}) {
  const router = useLocalizedRouter();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStreakTracker, setShowStreakTracker] = useState(false);

  // Get state from Redux store
  const user = useSelector((state: IRootState) => state.user);
  const lessonContent = useSelector((state: IRootState) =>
    selectLessonContent(state, id)
  );

  // State for lesson progress
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hearts, setHearts] = useState(user.hearts);
  const [progress, setProgress] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [characterState, setCharacterState] = useState<
    "neutral" | "happy" | "sad"
  >("neutral");
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [isSkipped, setIsSkiped] = useState(false);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(
    []
  );
  const streakCount = 0;
  const weekProgress = [false, false, false, false, false, false, false];
  const currentExercise =
    lessonContent && lessonContent.exercises[currentExerciseIndex];

  useEffect(() => {
    if (lessonContent && !isSkipped) {
      setProgress(
        (currentExerciseIndex / lessonContent.exercises.length) * 100
      );
    }
  }, [currentExerciseIndex, lessonContent, isSkipped]);

  if (!lessonContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Leçon introuvable</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#58cc02] text-white rounded-xl font-bold"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // All the handler functions remain the same...
  const handleWordSelect = (word: string, index: number) => {
    const alreadySelected = selectedWordIndexes.includes(index);

    if (alreadySelected) {
      setSelectedWordIndexes((prev) => prev.filter((i) => i !== index));
      setSelectedWords((prev) =>
        prev.filter((_, i) => selectedWordIndexes[i] !== index)
      );
    } else {
      setSelectedWordIndexes((prev) => [...prev, index]);
      setSelectedWords((prev) => [...prev, word]);
    }
  };

  const playAudio = async () => {
    if (!currentExercise?.sourceText) return;

    const token = await getToken();
    const voiceIdEn = process.env.ELEVENLABS_VOICE_ID_EN;
    const voiceIdFr = process.env.ELEVENLABS_VOICE_ID_FR;
    const voiceIdHi = process.env.ELEVENLABS_VOICE_ID_HI;

    const VOICE_MAP = {
      en: voiceIdEn,
      fr: voiceIdFr,
      hi: voiceIdHi,
    };

    type SupportedLang = keyof typeof VOICE_MAP;
    const lang = currentExercise.sourceLanguage as string;

    if (!Object.keys(VOICE_MAP).includes(lang)) {
      console.error("Unsupported language:", lang);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-tts`,
        {
          text: currentExercise.sourceText,
          language_id: currentExercise.sourceLanguage,
          voice_id: VOICE_MAP[lang as SupportedLang],
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
      };
    } catch (err) {
      console.error("Failed to play audio", err);
      setIsSpeaking(false);
    }
  };

  const playSoundFromURL = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const checkAnswer = () => {
    const userAnswer = selectedWords.join(" ").toLowerCase();
    const isAnswerCorrect =
      currentExercise &&
      currentExercise.correctAnswer.some(
        (answer: string) => answer.toLowerCase() === userAnswer
      );

    setIsCorrect(isAnswerCorrect ?? null);
    setCharacterState(isAnswerCorrect ? "happy" : "sad");

    if (isAnswerCorrect) {
      setCorrectAnswer(null);

      if (!completedExerciseIds.includes(currentExercise._id)) {
        setCompletedExerciseIds((prev) => [...prev, currentExercise._id]);
      }

      playSoundFromURL(
        "https://res.cloudinary.com/dlm0ieiyt/video/upload/v1748328096/correct_answer_zngi2u.ogg"
      );

      const totalXP = lessonContent.xpReward;
      const numExercises = lessonContent.exercises.length;

      const baseXp = Math.floor(totalXP / numExercises);
      const remainder = totalXP % numExercises;

      const xpPerExercise = (index: number) =>
        index < remainder ? baseXp + 1 : baseXp;

      setEarnedXp(earnedXp + xpPerExercise(currentExerciseIndex));

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setShowNextButton(true);
    } else {
      playSoundFromURL(
        "https://res.cloudinary.com/dlm0ieiyt/video/upload/v1748328355/11L-bad_answer_error_mes-1748328275089_xqpwgk.mp3"
      );

      if (currentExercise) {
        setCorrectAnswer(currentExercise.correctAnswer[0]);
        setShowNextButton(true);
      }

      setHearts(hearts - 1);
      dispatch(updateHearts(-1));

      if (hearts <= 1) {
        setTimeout(() => {
          setShowResults(true);
        }, 1500);
      }
    }
  };

  const skipExercise = () => {
    if (currentExerciseIndex < lessonContent.exercises.length - 1) {
      setIsSkiped(true);
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedWords([]);
      setIsCorrect(null);
      setCharacterState("neutral");
    } else {
      setShowNextButton(true);
    }
  };

  const returnToDashboard = () => {
    router.push("/dashboard");
  };

  const handleNext = async () => {
    setSelectedWordIndexes([]);
    setSelectedWords([]);
    setShowNextButton(false);
    setIsCorrect(null);
    setCharacterState("neutral");

    setCurrentExerciseIndex(currentExerciseIndex + 1);
    if (currentExerciseIndex < lessonContent.exercises.length - 1) {
    } else {
      const nextExerciseIndex = currentExerciseIndex + 1;

      const allExercisesCompleted =
        nextExerciseIndex >= lessonContent.exercises.length;
      const allXpEarned = earnedXp >= lessonContent.xpReward;

      if (
        allExercisesCompleted &&
        allXpEarned &&
        unit &&
        lastUnit &&
        nextLesson
      ) {
        // Optionally: trigger lesson pass logic here
        await dispatch(
          markLessonAsPassed({ lessonContent, lastUnit, unit, nextLesson })
        );
        await dispatch(markLessonCompleted({ lessonId: id }));
        await dispatch(
          completeLessonExercises({
            lessonId: id,
            completedExerciseIds,
          })
        );
      }
      // Complete the lesson logic here...
      setShowResults(true);
      setShowStreakTracker(true);
    }
  };

  const streakTrackerComponent =
    showStreakTracker &&
    !showResults &&
    completedExerciseIds.length === lessonContent.exercises.length &&
    (streakCount ? (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8"
      >
        <StreakTracker streakCount={streakCount} weekProgress={weekProgress} />
      </m.div>
    ) : (
      <ContinueLearningEncouragement />
    ));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {lessonContent.exercises.length > 0 ? (
        <>
          <LessonHeader
            progress={progress}
            hearts={hearts}
            onExit={returnToDashboard}
          />

          <LessonMain
            lessonContent={lessonContent}
            currentExercise={currentExercise}
            currentExerciseIndex={currentExerciseIndex}
            selectedWords={selectedWords}
            selectedWordIndexes={selectedWordIndexes}
            isCorrect={isCorrect}
            characterState={characterState}
            showResults={showResults}
            showStreakTracker={showStreakTracker}
            hearts={hearts}
            earnedXp={earnedXp}
            isSpeaking={isSpeaking}
            onWordSelect={handleWordSelect}
            onPlayAudio={playAudio}
            onContinueResults={() => {
              setShowResults(false);
              returnToDashboard();
            }}
            onReturnToDashboard={returnToDashboard}
            streakTracker={streakTrackerComponent}
          />

          <LessonFooter
            isCorrect={isCorrect}
            showNextButton={showNextButton}
            showResults={showResults}
            currentExerciseIndex={currentExerciseIndex}
            totalExercises={lessonContent.exercises.length}
            selectedWords={selectedWords}
            correctAnswer={correctAnswer}
            onSkip={skipExercise}
            onCheck={checkAnswer}
            onNext={handleNext}
            currentExercise={currentExercise && currentExercise._id}
            lessonId={id}
          />
        </>
      ) : (
        <NoExercises lessonId={id} />
      )}
    </div>
  );
}
