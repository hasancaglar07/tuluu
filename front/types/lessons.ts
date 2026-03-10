import type {
  LanguageCategory,
  ThemeMetadata,
  MoralLessonDetails,
  MiniGameDetails,
  StoryPage,
  StoryMetadata,
  MoralValue,
} from ".";

export type TeachingPhase = "teach" | "practice" | "assess";

export type ExerciseComponentType =
  | "learning_card"
  | "moral_story"
  | "multiple_choice"
  | "listening_challenge"
  | "matching_board"
  | "arrange_builder"
  | "puzzle_board"
  | "focus_breathing";

export interface Exercise {
  _id: string;
  lessonId: string;
  type: string;
  componentType: ExerciseComponentType;
  moralValue: MoralValue;
  valuePoints: number;
  questionPreview: string;
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
  educationContent?: unknown;
  mediaPack?: {
    idleAnimationUrl?: string;
    successAnimationUrl?: string;
    failAnimationUrl?: string;
    characterName?: string;
  };
  hoverHint?: {
    text?: string;
    audioUrl?: string;
  };
  answerAudioUrl?: string;
  ttsVoiceId?: string;
  autoRevealMilliseconds?: number | null;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  valuePointsReward: number;
  moralValue: MoralValue;
  teachingPhase: TeachingPhase;
  pedagogyFocus: string;
  moralStory?: {
    title: string;
    text: string;
    placement: "pre_lesson" | "mid_lesson" | "post_lesson";
  } | null;
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
  valuePointsReward: number;
  moralValue: MoralValue;
  teachingPhase: TeachingPhase;
  pedagogyFocus: string;
  moralStory: {
    title: string;
    text: string;
    placement: "pre_lesson" | "mid_lesson" | "post_lesson";
  };
  imageUrl: string;
  order: number;
}

export interface NewExerciseForm {
  _id: string;
  lessonId: string;
  type: string;
  componentType: ExerciseComponentType;
  moralValue: MoralValue;
  valuePoints: number;
  questionPreview: string;
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
  educationContent?: unknown;
  mediaPack?: {
    idleAnimationUrl?: string;
    successAnimationUrl?: string;
    failAnimationUrl?: string;
    characterName?: string;
  };
  hoverHint?: {
    text?: string;
    audioUrl?: string;
  };
  answerAudioUrl?: string;
  ttsVoiceId?: string;
  autoRevealMilliseconds?: number | null;
}
