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

  imageUrl: z
    .string()
    .trim()
    .max(100, "Title must be at most 100 characters")
    .optional()
    .default(""),

  order: z.number().default(0),
});

// Inferred Type from Schema
export type LessonSchemaType = z.infer<typeof LessonSchema>;
