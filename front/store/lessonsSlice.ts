import { apiClient } from "@/lib/api-client";
import { Chapter, LessonContent, LessonStatus, Language } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const lessonContentsData: LessonContent[] = [];
const chaptersData: Chapter[] = [];
// Define lessons state
export interface LessonsState {
  chapters: Chapter[];
  lessonContents: LessonContent[];
  language: Language;
  isLoading: boolean;
  currentChapter: string;
  currentUnit: string;
  currentLesson: string;
  error: string | null;
  loading: boolean;
}

const language = {
  _id: "",
  name: "",
  imageUrl: "",
  baseLanguage: "",
  nativeName: "",
  flag: "",
  isCompleted: false,
  isActive: false,
  userCount: 0,
  chapters: [],
};

const initialState: LessonsState = {
  chapters: chaptersData,
  lessonContents: lessonContentsData,
  language: language,
  isLoading: false,
  currentChapter: "",
  currentUnit: "",
  currentLesson: "",
  error: null,
  loading: false,
};

export const fetchLessons = createAsyncThunk(
  "lesson/fetchLessons",
  async (
    { languageId, token }: { languageId: string; token: string },
    thunkAPI
  ) => {
    try {
      const response = await apiClient.get(`/api/lessons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          languageId: languageId,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to fetch completed lessons" + error
      );
    }
  }
);

export const lessonsSlice = createSlice({
  name: "lessons",
  initialState,

  reducers: {
    // Action to toggle chapter expansion
    toggleChapter: (state, action: PayloadAction<string>) => {
      const chapterId = action.payload;
      const chapterIndex = state.chapters.findIndex(
        (chapter) => chapter._id === chapterId
      );

      if (chapterIndex !== -1) {
        state.chapters[chapterIndex].isExpanded =
          !state.chapters[chapterIndex].isExpanded;
      }
    },

    // Action to toggle unit expansion
    toggleUnit: (
      state,
      action: PayloadAction<{ chapterId: string; unitId: string }>
    ) => {
      const { chapterId, unitId } = action.payload;
      const chapterIndex = state.chapters.findIndex(
        (chapter) => chapter._id === chapterId
      );

      if (chapterIndex !== -1) {
        const unitIndex = state.chapters[chapterIndex].units.findIndex(
          (unit) => unit._id === unitId
        );

        if (unitIndex !== -1) {
          state.chapters[chapterIndex].units[unitIndex].isExpanded =
            !state.chapters[chapterIndex].units[unitIndex].isExpanded;
        }
      }
    },

    // Action to update lesson status
    updateLessonStatus: (
      state,
      action: PayloadAction<{
        chapterId: string;
        unitId: string;
        lessonId: string;
        status: LessonStatus;
      }>
    ) => {
      const { chapterId, unitId, lessonId, status } = action.payload;
      const chapterIndex = state.chapters.findIndex(
        (chapter) => chapter._id === chapterId
      );

      if (chapterIndex !== -1) {
        const unitIndex = state.chapters[chapterIndex].units.findIndex(
          (unit) => unit._id === unitId
        );

        if (unitIndex !== -1) {
          const lessonIndex = state.chapters[chapterIndex].units[
            unitIndex
          ].lessons.findIndex((lesson) => lesson._id === lessonId);

          if (lessonIndex !== -1) {
            state.chapters[chapterIndex].units[unitIndex].lessons[
              lessonIndex
            ].status = status;

            // If this lesson is completed, unlock the next one
            if (status === "completed") {
              const nextLessonIndex = lessonIndex + 1;
              if (
                nextLessonIndex <
                state.chapters[chapterIndex].units[unitIndex].lessons.length
              ) {
                state.chapters[chapterIndex].units[unitIndex].lessons[
                  nextLessonIndex
                ].status = "available";
              } else {
                // Last lesson in unit - mark unit as completed
                state.chapters[chapterIndex].units[unitIndex].isCompleted =
                  true;

                // If this is not the last unit, unlock the first lesson of the next unit
                const nextUnitIndex = unitIndex + 1;
                if (nextUnitIndex < state.chapters[chapterIndex].units.length) {
                  state.chapters[chapterIndex].units[
                    nextUnitIndex
                  ].lessons[0].status = "available";
                } else {
                  // Last unit in chapter - mark chapter as completed
                  state.chapters[chapterIndex].isCompleted = true;

                  // If this is not the last chapter, unlock the first lesson of the first unit of the next chapter
                  const nextChapterIndex = chapterIndex + 1;
                  if (nextChapterIndex < state.chapters.length) {
                    state.chapters[
                      nextChapterIndex
                    ].units[0].lessons[0].status = "available";
                  }
                }
              }
            }
          }
        }
      }
    },

    // Action to add a new lesson content
    addLessonContent: (state, action: PayloadAction<LessonContent>) => {
      // Check if lesson content with this ID already exists
      const existingIndex = state.lessonContents.findIndex(
        (lesson) => lesson._id === action.payload._id
      );

      if (existingIndex !== -1) {
        // Update existing lesson content
        state.lessonContents[existingIndex] = action.payload;
      } else {
        // Add new lesson content
        state.lessonContents.push(action.payload);
      }
    },

    // Action to set current data
    setCurrentData: (
      state,
      action: PayloadAction<{
        chapter: string;
        unit: string;
        lesson: string;
      }>
    ) => {
      state.currentChapter = action.payload.chapter;
      state.currentUnit = action.payload.unit;
      state.currentLesson = action.payload.lesson;
    },

    completeLessonExercises: (
      state,
      action: PayloadAction<{
        lessonId: string;
        completedExerciseIds: string[];
      }>
    ) => {
      const { lessonId, completedExerciseIds } = action.payload;

      // ✅ Update lessonContents
      // ✅ Update lessonContents
      state.lessonContents = state.lessonContents.map((lesson) =>
        lesson.lessonId === lessonId
          ? {
              ...lesson,
              exercises: lesson.exercises.map((ex) => ({
                ...ex,
                completed: completedExerciseIds.includes(ex._id),
              })),
            }
          : lesson
      );

      // ✅ Also update chapters (if needed)
      state.chapters = state.chapters.map((chapter) => ({
        ...chapter,
        units: chapter.units.map((unit) => ({
          ...unit,
          lessons: unit.lessons.map((lsn) => {
            if (lsn._id === lessonId && lsn.exercises) {
              return {
                ...lsn,
                exercises: lsn.exercises.map((exercise) => ({
                  ...exercise,
                  completed: completedExerciseIds.includes(exercise._id),
                })),
              };
            }
            return lsn;
          }),
        })),
      }));
    },
    markLessonCompleted: (
      state,
      action: PayloadAction<{ lessonId: string }>
    ) => {
      const { lessonId } = action.payload;
      console.log("Marking lesson as completed:", lessonId);

      for (const chapter of state.chapters) {
        for (const unit of chapter.units) {
          const lesson = unit.lessons.find((lesson) => lesson._id === lessonId);

          if (lesson) {
            // ✅ Mark lesson as completed
            lesson.isCompleted = true;

            // ✅ Check if all lessons in this unit are completed
            // const allLessonsCompleted = unit.lessons.every(
            //   (l) => l.isCompleted
            // );

            // ✅ Check if unit is already in completedUnits
            // const unitAlreadyCompleted = state.completedUnits.some(
            //   (completedUnit) => completedUnit._id === unit._id
            // );

            // if (allLessonsCompleted && !unitAlreadyCompleted) {
            //   state.completedUnits.push(unit);
            // }

            return;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.pending, (state: LessonsState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLessons.fulfilled,
        (state: LessonsState, action: PayloadAction<LessonsState>) => {
          // Overwrite the entire state with fetched data
          state.loading = false;
          state.error = null;
          Object.assign(state, action.payload); // Update state with fetched user data
        }
      )
      .addCase(fetchLessons.rejected, (state, action) => {
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
  toggleChapter,
  toggleUnit,
  updateLessonStatus,
  addLessonContent,
  setCurrentData,
  completeLessonExercises,
  markLessonCompleted,
} = lessonsSlice.actions;

// Selectors
export const selectLessonContent = (
  state: { lessons: LessonsState },
  lessonId: string
): LessonContent | undefined => {
  return state.lessons.lessonContents.find((lesson) => lesson._id === lessonId);
};

export default lessonsSlice.reducer;
