import { z } from "zod";

// Zod Schema Definition
export const LessonSchema = z.object({
  unitId: z.string().trim().min(1, "Unit ID is required"),
  chapterId: z.string().trim().min(1, "Chapter ID is required"),
  languageId: z.string().trim().min(1, "Language ID is required"),

  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title must be at most 100 characters" }),

  description: z
    .string()
    .trim()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(1000, { message: "Description must be at most 1000 characters" }),

  isPremium: z.boolean().default(false),
  isTest: z.boolean().default(false),
  isActive: z.boolean().default(true),

  xpReward: z
    .number()
    .min(1, "XP Reward must be a positive number")
    .max(10000, "XP Reward must not be greater than 10000")
    .default(10),
  teachingPhase: z.enum(["teach", "practice", "assess"]).default("teach"),
  moralValue: z
    .enum([
      "patience",
      "gratitude",
      "kindness",
      "honesty",
      "sharing",
      "mercy",
      "justice",
      "respect",
    ])
    .default("kindness"),
  valuePointsReward: z
    .number()
    .min(0, "Value points must be zero or positive")
    .max(1000, "Value points must not be greater than 1000")
    .default(0),
  pedagogyFocus: z.string().max(400).optional().default(""),
  moralStory: z
    .object({
      title: z.string().max(150).optional().default(""),
      text: z.string().max(2000).optional().default(""),
      placement: z
        .enum(["pre_lesson", "mid_lesson", "post_lesson"])
        .default("post_lesson"),
    })
    .optional()
    .default({
      title: "",
      text: "",
      placement: "post_lesson",
    }),

  imageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().max(500, "Image URL is too long").optional()
  ),

  order: z.number().default(0),
});

// Inferred Type from Schema
export type LessonSchemaType = z.infer<typeof LessonSchema>;
