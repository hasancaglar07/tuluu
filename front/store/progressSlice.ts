// This slice manages user progress through chapters, units, and lessons

import { Chapter, Lesson, Unit } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { IRootState } from ".";
import { apiClient } from "@/lib/api-client";

export type ValuePoints = {
  patience: number;
  gratitude: number;
  kindness: number;
  honesty: number;
  sharing: number;
  mercy: number;
  justice: number;
  respect: number;
};

export interface DailyLimits {
  minutesAllowed: number;
  minutesUsed: number;
  lastResetAt: string | null;
}

export interface ParentalControls {
  enabled: boolean;
  guardianContact: string;
}

// Define progress state interface
export interface ProgressState {
  currentChapter: Chapter | null;
  currentUnit: Unit | null;
  currentLesson: Lesson | null;
  unitColor: string;
  completedLessons: Lesson[]; // Format: "chapterId-unitId-lessonId"
  completedUnits: Unit[]; // Format: "chapterId-unitId"
  completedChapters: Chapter[];
  lastCompletedLesson: string | null;
  error: string | null;
  loading: boolean;
  valuePoints: ValuePoints;
  dailyLimits: DailyLimits;
  parentalControls: ParentalControls;
}

const createDefaultValuePoints = (): ValuePoints => ({
  patience: 0,
  gratitude: 0,
  kindness: 0,
  honesty: 0,
  sharing: 0,
  mercy: 0,
  justice: 0,
  respect: 0,
});

const createDefaultDailyLimits = (): DailyLimits => ({
  minutesAllowed: 0,
  minutesUsed: 0,
  lastResetAt: null,
});

const createDefaultParentalControls = (): ParentalControls => ({
  enabled: false,
  guardianContact: "",
});

const createInitialProgressState = (): ProgressState => ({
  currentChapter: null,
  currentUnit: null,
  currentLesson: null,
  unitColor: "bg-[#fcbb0d]",
  completedLessons: [],
  completedUnits: [],
  completedChapters: [],
  lastCompletedLesson: null,
  error: null,
  loading: false,
  valuePoints: createDefaultValuePoints(),
  dailyLimits: createDefaultDailyLimits(),
  parentalControls: createDefaultParentalControls(),
});

// Initial state for progress
const initialState: ProgressState = createInitialProgressState();

export const fetchUserProgress = createAsyncThunk<
  ProgressState & {
    valuePoints?: ValuePoints;
    dailyLimits?: DailyLimits;
    parentalControls?: ParentalControls;
  },
  { languageId: string; token: string }
>(
  "progress/fetchUserProgress",
  async ({ languageId, token }, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          languageId: languageId,
        },
      });
      return response.data; // should match ProgressState
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch user progress." + error);
    }
  }
);

// Create the progress slice
export const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    // Action to set current position
    setCurrentPosition: (
      state,
      action: PayloadAction<{
        chapter: Chapter;
        unit: Unit;
        lesson: Lesson;
        unitColor: string;
      }>
    ) => {
      state.currentChapter = action.payload.chapter;
      state.currentUnit = action.payload.unit;
      state.currentLesson = action.payload.lesson;
      state.unitColor = action.payload.unitColor;
    },

    // Action to complete a lesson
    completeLesson: (
      state,
      action: PayloadAction<{
        chapter: Chapter;
        unit: Unit;
        lessonId: Lesson;
        nextLesson: Lesson;
      }>
    ) => {
      const { lessonId, nextLesson, unit, chapter } = action.payload;
      const lessonKey = `${lessonId._id}`;

      // Add to completed lessons if not already there
      const alreadyExists = state.completedLessons.some(
        (lesson: { _id: string }) => lesson._id === lessonKey
      );

      if (!alreadyExists) {
        state.completedLessons.push(lessonId);
      }

      state.lastCompletedLesson = lessonKey;
      state.currentLesson = nextLesson;
      state.currentChapter = chapter;
      state.currentUnit = unit;

      // Check if unit is completed
      // const unitKey = `${unitId._id}`;
      // if (!state.completedUnits.includes(unitKey)) {
      //   // Logic to check if all lessons in the unit are completed would go here
      //   // For now, we'll just add it to completed units
      //   state.completedUnits.push(unitKey);
      // }

      // // Check if chapter is completed
      // if (!state.completedChapters.includes(chapterId._id)) {
      //   // Logic to check if all units in the chapter are completed would go here
      //   // For now, we'll just add it to completed chapters
      //   state.completedChapters.push(chapterId._id);
      // }
    },

    // Action to reset progress
    resetProgress: () => {
      return createInitialProgressState();
    },

    markLessonAsPassed: (
      state,
      action: PayloadAction<{
        lessonContent: Lesson;
        lastUnit: Unit;
        unit: Unit;
        nextLesson: Lesson;
      }>
    ) => {
      const { lessonContent, lastUnit, unit, nextLesson } = action.payload;

      const lessonAlreadyExists = state.completedLessons.some(
        (lesson) => lesson._id === lessonContent._id
      );

      if (!lessonAlreadyExists) {
        state.completedLessons.push(lessonContent);
      }

      // Update the current unit
      state.currentUnit = unit;
      state.currentLesson = nextLesson;

      // Add the last completed unit if it hasn't been added yet
      const unitAlreadyCompleted = state.completedUnits.some(
        (completedUnit) => completedUnit._id === lastUnit._id
      );

      if (!unitAlreadyCompleted) {
        state.completedUnits.push(lastUnit);
      }
    },

    updateValuePoints: (
      state,
      action: PayloadAction<{ key: keyof ValuePoints; amount: number }>
    ) => {
      const { key, amount } = action.payload;
      state.valuePoints[key] = Math.max(
        0,
        state.valuePoints[key] + amount
      );
    },

    setDailyLimits: (state, action: PayloadAction<DailyLimits>) => {
      state.dailyLimits = action.payload;
    },

    setParentalControls: (
      state,
      action: PayloadAction<ParentalControls>
    ) => {
      state.parentalControls = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProgress.pending, (state: ProgressState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProgress.fulfilled,
        (
          state: ProgressState,
          action: PayloadAction<
            ProgressState & {
              valuePoints?: ValuePoints;
              dailyLimits?: DailyLimits;
              parentalControls?: ParentalControls;
            }
          >
        ) => {
          const {
            completedLessons = [],
            completedUnits = [],
            completedChapters = [],
            currentLesson = null,
            currentUnit = null,
            currentChapter = null,
            unitColor,
            lastCompletedLesson = null,
            valuePoints,
            dailyLimits,
            parentalControls,
          } = action.payload;

          state.completedLessons = completedLessons;
          state.completedUnits = completedUnits;
          state.completedChapters = completedChapters;
          state.currentLesson = currentLesson;
          state.currentUnit = currentUnit;
          state.currentChapter = currentChapter;
          state.unitColor = unitColor ?? state.unitColor;
          state.lastCompletedLesson = lastCompletedLesson;
          state.valuePoints = valuePoints
            ? { ...createDefaultValuePoints(), ...valuePoints }
            : createDefaultValuePoints();
          state.dailyLimits = dailyLimits
            ? { ...createDefaultDailyLimits(), ...dailyLimits }
            : createDefaultDailyLimits();
          state.parentalControls = parentalControls
            ? {
                ...createDefaultParentalControls(),
                ...parentalControls,
              }
            : createDefaultParentalControls();
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          // payload exists only if you used rejectWithValue in the thunk
          state.error = action.payload as string;
        } else {
          // fallback error message from error object
          state.error = action.error.message ?? "Unknown error";
        }
      });
  },
});

// Export actions and reducer
export const {
  setCurrentPosition,
  completeLesson,
  resetProgress,
  markLessonAsPassed,
  updateValuePoints,
  setDailyLimits,
  setParentalControls,
} = progressSlice.actions;

export default progressSlice.reducer;
export const selectCompletedUnits = (state: IRootState) =>
  state.progress.completedUnits;
