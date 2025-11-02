"use client";

import { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import type { IRootState } from "@/store";
import { completeLesson } from "@/store/progressSlice";
import {
  completeLessonExercises,
  markLessonCompleted,
  selectLessonContent,
} from "@/store/lessonsSlice";
import { addXp, incrementStreak, updateHearts } from "@/store/userSlice";
import { useAuth } from "@clerk/nextjs";
import { FormattedMessage } from "react-intl";

// Import custom components
import LessonHeader from "./lesson-header";
import ExerciseDisplay from "./exercise-display";
import AnswerArea from "./answer-area";
import WordOptions from "./word-options";
import LessonFooter from "./lesson-footer";
import LessonResults from "./lesson-results";
import NoExercises from "@/components/custom/no-exercises";
import { StreakTracker } from "@/components/custom/streak-tracker";
import ContinueLearningEncouragement from "@/components/custom/ContinueLearningEncouragement";

// Import custom hooks
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLessonAPI } from "@/hooks/use-lesson-api";
import { useQuestProgress } from "@/hooks/use-quest-progress";

// Types
interface LessonState {
  currentExerciseIndex: number;
  selectedWords: string[];
  selectedWordIndexes: number[];
  isCorrect: boolean | null;
  hearts: number;
  progress: number;
  earnedXp: number;
  showResults: boolean;
  characterState: "neutral" | "happy" | "sad";
  showNextButton: boolean;
  correctAnswer: string | null;
  isSkipped: boolean;
  completedExerciseIds: string[];
  streakCount: number;
  weekProgress: boolean[];
  showStreakTracker: boolean;
}

/**
 * Main Lesson Component
 * Handles the complete lesson flow including exercises, progress tracking, and results
 */
export default function Lesson({ id }: { id: string }) {
  const router = useLocalizedRouter();
  const dispatch = useDispatch();
  const { userId } = useAuth();

  // Redux state
  const user = useSelector((state: IRootState) => state.user);
  const lessonContent = useSelector((state: IRootState) =>
    selectLessonContent(state, id)
  );
  const userprogress = useSelector((state: IRootState) => state.progress);

  // Component state
  const [lessonState, setLessonState] = useState<LessonState>({
    currentExerciseIndex: 0,
    selectedWords: [],
    selectedWordIndexes: [],
    isCorrect: null,
    hearts: user.hearts,
    progress: 0,
    earnedXp: 0,
    showResults: false,
    characterState: "neutral",
    showNextButton: false,
    correctAnswer: null,
    isSkipped: false,
    completedExerciseIds: [],
    streakCount: 0,
    weekProgress: [false, false, false, false, false, false, false],
    showStreakTracker: false,
  });

  // Custom hooks
  const { playAudio, isSpeaking } = useAudioPlayer();
  const {
    completeLessonApi,
    addRewardApi,
    addExercisesApi,
    updateUserHearts,
    // addUserQuest,
  } = useLessonAPI();
  const { updateQuestProgress } = useQuestProgress();

  // Current exercise reference
  const currentExercise =
    lessonContent && lessonContent.exercises[lessonState.currentExerciseIndex];
  console.log("Lesson currentExercise:", currentExercise);

  /**
   * Update progress bar based on current exercise index
   */
  useEffect(() => {
    if (lessonContent && !lessonState.isSkipped) {
      setLessonState((prev) => ({
        ...prev,
        progress:
          (prev.currentExerciseIndex / lessonContent.exercises.length) * 100,
      }));
    }
  }, [lessonState.currentExerciseIndex, lessonContent, lessonState.isSkipped]);

  /**
   * Handle word selection/deselection in exercises
   */
  const handleWordSelect = (word: string, index: number) => {
    const alreadySelected = lessonState.selectedWordIndexes.includes(index);

    if (alreadySelected) {
      // Remove word and index
      setLessonState((prev) => ({
        ...prev,
        selectedWordIndexes: prev.selectedWordIndexes.filter(
          (i) => i !== index
        ),
        selectedWords: prev.selectedWords.filter(
          (_, i) => prev.selectedWordIndexes[i] !== index
        ),
      }));
    } else {
      // Add word and index
      setLessonState((prev) => ({
        ...prev,
        selectedWordIndexes: [...prev.selectedWordIndexes, index],
        selectedWords: [...prev.selectedWords, word],
      }));
    }
  };

  /**
   * Check if the user's answer is correct
   */
  const checkAnswer = async () => {
    const userAnswer = lessonState.selectedWords.join(" ").toLowerCase();
    const isAnswerCorrect =
      currentExercise &&
      currentExercise.correctAnswer.length > 0 &&
      currentExercise.correctAnswer.some(
        (answer: string) => answer.toLowerCase() === userAnswer
      );

    setLessonState((prev) => ({
      ...prev,
      isCorrect: isAnswerCorrect ?? null,
      characterState: isAnswerCorrect ? "happy" : "sad",
    }));

    if (isAnswerCorrect) {
      // Handle correct answer
      setLessonState((prev) => ({
        ...prev,
        correctAnswer: null,
        completedExerciseIds: prev.completedExerciseIds.includes(
          currentExercise._id
        )
          ? prev.completedExerciseIds
          : [...prev.completedExerciseIds, currentExercise._id],
        showNextButton: true,
      }));

      // Calculate and add XP
      const xpPerExercise = Math.floor(
        lessonContent.xpReward / lessonContent.exercises.length
      );
      setLessonState((prev) => ({
        ...prev,
        earnedXp: prev.earnedXp + xpPerExercise,
      }));

      // Play success sound and show confetti
      const audio = new Audio(
        "https://res.cloudinary.com/dlm0ieiyt/video/upload/v1748328096/correct_answer_zngi2u.ogg"
      );
      audio.play();

      // Trigger confetti
      const { default: confetti } = await import("canvas-confetti");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      // Handle incorrect answer
      const audio = new Audio(
        "https://res.cloudinary.com/dlm0ieiyt/video/upload/v1748328355/11L-bad_answer_error_mes-1748328275089_xqpwgk.mp3"
      );
      audio.play();

      if (currentExercise) {
        setLessonState((prev) => ({
          ...prev,
          correctAnswer: currentExercise.correctAnswer[0],
          showNextButton: true,
          hearts: prev.hearts - 1,
        }));
      }

      // Update hearts in backend and Redux
      await updateUserHearts(1, "dec");
      await dispatch(updateHearts(-1));

      // Check if user ran out of hearts
      if (lessonState.hearts <= 1) {
        setTimeout(() => {
          setLessonState((prev) => ({ ...prev, showResults: true }));
        }, 1500);
      }
    }
  };

  /**
   * Skip current exercise
   */
  const skipExercise = () => {
    if (
      lessonContent &&
      lessonState.currentExerciseIndex < lessonContent?.exercises?.length - 1
    ) {
      setLessonState((prev) => ({
        ...prev,
        isSkipped: true,
        currentExerciseIndex: prev.currentExerciseIndex + 1,
        selectedWords: [],
        selectedWordIndexes: [],
        isCorrect: null,
        characterState: "neutral",
      }));
    } else {
      setLessonState((prev) => ({ ...prev, showNextButton: true }));
    }
  };

  /**
   * Continue to next exercise or complete lesson
   */
  const continueToNext = async () => {
    // Reset exercise state
    setLessonState((prev) => ({
      ...prev,
      selectedWordIndexes: [],
      selectedWords: [],
      showNextButton: false,
      isCorrect: null,
      characterState: "neutral",
    }));

    if (
      lessonContent &&
      lessonState.currentExerciseIndex < lessonContent?.exercises?.length - 1
    ) {
      // Move to next exercise
      setLessonState((prev) => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1,
      }));

      dispatch(
        completeLessonExercises({
          lessonId: id,
          completedExerciseIds: lessonState.completedExerciseIds,
        })
      );
    } else {
      // Complete the lesson user take all exercses
      await completeLessonFlow();
    }
  };

  /**
   * Handle lesson completion flow
   */
  const completeLessonFlow = async () => {
    setLessonState((prev) => ({
      ...prev,
      currentExerciseIndex: prev.currentExerciseIndex + 1,
    }));

    // Check if all exercises are completed
    if (
      lessonContent?.exercises?.length ===
        lessonState.completedExerciseIds.length &&
      userprogress
    ) {
      if (
        userprogress.currentChapter &&
        userprogress.currentUnit &&
        userprogress.currentLesson
      ) {
        // Complete lesson via API
        const result = await completeLessonApi({
          lessonId: id,
          gems: 0,
          gel: 0,
          xpBoost: null,
        });

        console.log("Lesson completion result:", result);
        // Update Redux state
        dispatch(
          completeLesson({
            chapter: result.currentChapter,
            unit: result.currentUnit,
            lessonId: lessonContent,
            nextLesson: result.nextLesson,
          })
        );

        // Add completed exercises
        await addExercisesApi({
          lessonId: id,
          exerciseIds: lessonState.completedExerciseIds,
        });

        // Update streak data
        setLessonState((prev) => ({
          ...prev,
          streakCount: result.currentStreak || 0,
          weekProgress: result.weekProgress || prev.weekProgress,
        }));
      }

      // Mark lesson as completed
      await dispatch(markLessonCompleted({ lessonId: id }));
      dispatch(incrementStreak());
    } else {
      // Partial completion
      if (userprogress.currentChapter) {
        addExercisesApi({
          lessonId: id,
          exerciseIds: lessonState.completedExerciseIds,
        });
      }
    }

    // Finalize lesson completion
    setLessonState((prev) => ({
      ...prev,
      showResults: true,
      showStreakTracker: true,
    }));

    // Add XP to user account
    dispatch(addXp(lessonState.earnedXp));

    // Update quest progress for XP and lesson completion
    await updateQuestProgress(userId!, lessonState.earnedXp);

    // Add reward via API
    await addRewardApi({
      type: "xp",
      amount: lessonState.earnedXp,
      reason: "Completed lesson exercises",
      lessonId: id,
    });

    // await addUserQuest({
    //   type: "daily",
    //   conditionType: "earn_xp",
    //   rewardType: "xp",
    //   amount: lessonState.earnedXp,
    // });

    // Update lesson exercises completion
    dispatch(
      completeLessonExercises({
        lessonId: id,
        completedExerciseIds: lessonState.completedExerciseIds,
      })
    );
  };

  /**
   * Return to dashboard
   */
  const returnToDashboard = () => {
    router.push("/dashboard");
  };

  /**
   * Return to dashboard
   */
  const returnToShop = () => {
    router.push("/shop");
  };

  // Show loading state if lesson content is not found
  if (!lessonContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="mb-4">
            <FormattedMessage
              id="lesson.notFoundTitle"
              defaultMessage="Lesson Not Found"
            />
          </h3>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#58cc02] text-white rounded-xl font-bold"
          >
            <FormattedMessage
              id="button.backToDashboard"
              defaultMessage="Back to Dashboard"
            />
          </button>
        </div>
      </div>
    );
  }

  // Render lesson interface
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with progress and hearts */}
      {lessonContent.exercises.length > 0 && !lessonState.showResults && (
        <LessonHeader
          progress={lessonState.progress}
          hearts={lessonState.hearts}
          onExit={returnToDashboard}
        />
      )}

      {/* Main lesson content */}
      {lessonContent.exercises.length > 0 ? (
        <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full h-full">
          <AnimatePresence mode="wait">
            {!lessonState.showResults && currentExercise ? (
              <div className="w-full flex flex-col items-center">
                {/* Exercise display with character */}
                <ExerciseDisplay
                  exercise={currentExercise}
                  characterState={lessonState.characterState}
                  isSpeaking={isSpeaking}
                  onPlayAudio={() => playAudio(currentExercise)}
                  showStreakTracker={lessonState.showStreakTracker}
                  showResults={lessonState.showResults}
                />

                {/* Answer selection area */}
                <AnswerArea
                  selectedWords={lessonState.selectedWords}
                  selectedWordIndexes={lessonState.selectedWordIndexes}
                  isCorrect={lessonState.isCorrect}
                  onWordSelect={handleWordSelect}
                />

                {/* Word options */}
                <WordOptions
                  options={currentExercise?.options || []}
                  selectedWordIndexes={lessonState.selectedWordIndexes}
                  isCorrect={lessonState.isCorrect}
                  onWordSelect={handleWordSelect}
                />

                {/* Streak tracker display */}
                {lessonState.showStreakTracker &&
                  !lessonState.showResults &&
                  lessonState.completedExerciseIds.length ===
                    lessonContent.exercises.length &&
                  (lessonState.streakCount ? (
                    <div className="mt-8">
                      <StreakTracker
                        streakCount={lessonState.streakCount}
                        weekProgress={lessonState.weekProgress}
                      />
                    </div>
                  ) : (
                    <ContinueLearningEncouragement />
                  ))}
              </div>
            ) : (
              /* Results screen */
              <LessonResults
                hearts={lessonState.hearts}
                earnedXp={lessonState.earnedXp}
                lessonId={lessonContent.lessonId}
                onContinue={returnToDashboard}
                onRetry={returnToShop}
              />
            )}
          </AnimatePresence>
        </main>
      ) : (
        /* No exercises fallback */
        <NoExercises lessonId={id} />
      )}

      {/* Footer with action buttons */}
      {lessonContent.exercises.length > 0 && currentExercise && (
        <LessonFooter
          isCorrect={lessonState.isCorrect}
          showNextButton={lessonState.showNextButton}
          correctAnswer={lessonState.correctAnswer}
          selectedWords={lessonState.selectedWords}
          currentExerciseIndex={lessonState.currentExerciseIndex}
          totalExercises={lessonContent.exercises.length}
          showResults={lessonState.showResults}
          onCheck={checkAnswer}
          onSkip={skipExercise}
          onContinue={continueToNext}
          lessonId={id}
          exerciseId={currentExercise._id}
        />
      )}
    </div>
  );
}
