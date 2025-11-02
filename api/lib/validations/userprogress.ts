import { z } from "zod";

// Subschemas
const XpBoostSchema = z
  .object({
    durationMinutes: z.number().int().min(1),
    multiplier: z.number().min(1),
  })
  .nullable()
  .optional();

const RewardSchema = z
  .object({
    xp: z.number().default(0),
    gems: z.number().default(0),
    gel: z.number().default(0),
    xpBoost: XpBoostSchema.nullable().default(null),
  })
  .strict();

const CompletedItemSchema = z
  .object({
    completedAt: z.coerce.date().default(() => new Date()),
    rewards: RewardSchema,
  })
  .strict();

const CompletedChapterSchema = CompletedItemSchema.extend({
  chapterId: z.string(),
});

const CompletedUnitSchema = CompletedItemSchema.extend({
  unitId: z.string(),
});

const CompletedLessonSchema = CompletedItemSchema.extend({
  lessonId: z.string(),
});

const CurrentLessonSchema = z
  .object({
    lessonId: z.string().optional(),
    progress: z.number().default(0),
    lastAccessed: z.coerce.date().default(() => new Date()),
  })
  .strict();

// Main UserProgress Schema
export const UserProgressSchema = z
  .object({
    userId: z.string(),
    languageId: z.string(),

    completedChapters: z.array(CompletedChapterSchema).default([]),
    completedUnits: z.array(CompletedUnitSchema).default([]),
    completedLessons: z.array(CompletedLessonSchema).default([]),

    currentLesson: CurrentLessonSchema.optional(),

    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

export const UserProgressAddLessonSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  xp: z.number().int().min(0, "XP must be a non-negative integer"),
  gems: z.number().int().min(0, "Gems must be a non-negative integer"),
  gel: z.number().int().min(0).optional().default(0),
  xpBoost: XpBoostSchema,
});

export const UserProgressAddRewardSchema = z.object({
  lessonId: z.string(),
  type: z.enum(["xp", "gems", "gel", "hearts"]),
  amount: z.number().min(1),
  reason: z.string().min(1),
});
