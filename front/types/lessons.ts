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
}

export interface Language {
  _id: string;
  name: string;
  nativeName: string;
  flag: string;
  baseLanguage: string;
  isActive: boolean;
  imageUrl: string;
  chapters: Chapter[];
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
}

export interface Language {
  _id: string;
  name: string;
  nativeName: string;
  flag: string;
  baseLanguage: string;
  isActive: boolean;
  imageUrl: string;
  chapters: Chapter[];
}
