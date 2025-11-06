import type {
  LanguageCategory,
  ThemeMetadata,
  MoralLessonDetails,
  MiniGameDetails,
  StoryPage,
  StoryMetadata,
} from ".";

/**
 * Type definitions for the Lessons Management system
 *
 * These types define the structure of data used throughout the lessons
 * administration interface, including the hierarchical relationship
 * between Languages, Chapters, Units, Lessons, and Exercises.
 */

export interface Exercise {
  _id: string;
  lessonId: string;
  type: string; // e.g., 'translate', 'multiple-choice'
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  imageUrl: string;
  chapterId?: string;
  unitId?: string;
  order: number;
  exercises: Exercise[];
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
  storyPages?: StoryPage[];
  storyMetadata?: StoryMetadata | null;
}

export interface Unit {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  isActive: boolean;
  order: number;
  color: string;
  lessons: Lesson[];
  chapterId: string;
}

export interface Chapter {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
  isActive: boolean;
  units: Unit[];
  contentType?: "lesson" | "story" | "game" | "meditation" | "quiz" | "activity";
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
}

export interface Language {
  _id: string;
  name: string;
  nativeName: string;
  flag: string;
  baseLanguage: string;
  isActive: boolean;
  imageUrl: string;
  category: LanguageCategory;
  themeMetadata: ThemeMetadata;
  locale: string;
  chapters: Chapter[];
  stats?: {
    chapters: number;
    units: number;
    lessons: number;
  };
}

// Form state types for creating new items
export interface NewLanguageForm {
  _id: string;
  name: string;
  nativeName: string;
  flag: string;
  baseLanguage: string;
  imageUrl: string;
  isActive: boolean;
  category: LanguageCategory;
  themeMetadata: ThemeMetadata;
  locale: string;
}

export interface NewChapterForm {
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
}

export interface NewUnitForm {
  chapterId: string;
  title: string;
  description: string;
  isExpanded: boolean;
  isPremium: boolean;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export interface NewLessonForm {
  chapterId: string;
  unitId: string;
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  imageUrl: string;
  order: number;
}

export interface NewExerciseForm {
  _id: string;
  lessonId: string;
  type: string;
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
}
// Form types for dialogs
export interface NewChapterForm {
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
}

export interface NewUnitForm {
  chapterId: string;
  title: string;
  description: string;
  isExpanded: boolean;
  isPremium: boolean;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export interface NewLessonForm {
  chapterId: string;
  unitId: string;
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  imageUrl: string;
  order: number;
}

export interface NewExerciseForm {
  _id: string;
  lessonId: string;
  type: string;
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
}

// Main entity types
export interface Exercise {
  _id: string;
  lessonId: string;
  type: string;
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  imageUrl: string;
  chapterId?: string;
  unitId?: string;
  order: number;
  exercises: Exercise[];
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
}

export interface Unit {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  isActive: boolean;
  order: number;
  color: string;
  lessons: Lesson[];
  chapterId: string;
}

export interface Chapter {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
  isActive: boolean;
  units: Unit[];
  contentType?: "lesson" | "story" | "game" | "meditation" | "quiz" | "activity";
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
}

export interface Language {
  _id: string;
  name: string;
  nativeName: string;
  flag: string;
  baseLanguage: string;
  isActive: boolean;
  imageUrl: string;
  category: LanguageCategory;
  themeMetadata: ThemeMetadata;
  chapters: Chapter[];
}
