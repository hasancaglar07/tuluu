import { z } from "zod";

// Utility for MongoDB ObjectId validation (24-char hex string)
// const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const exerciseSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  unitId: z.string().min(1, "Unit ID is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  languageId: z.string().min(1, "Language ID is required"),

  type: z.enum(["translate", "select", "arrange", "match", "listen", "speak"]),

  instruction: z
    .string()
    .trim()
    .min(5)
    .max(500)
    .transform((val) => val.toLowerCase()),

  sourceText: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .transform((val) => val.toLowerCase()),

  sourceLanguage: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .transform((val) => val.toLowerCase()),

  targetLanguage: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .transform((val) => val.toLowerCase()),

  correctAnswer: z
    .array(z.string())
    .min(1, "At least one correct answer is required")
    .max(20, "No more than 20 correct answers allowed"),

  options: z
    .array(z.string())
    .min(1, "At least one correct answer is required")
    .max(20, "No more than 20 correct answers allowed")
    .default([]),

  isNewWord: z.boolean().default(false),

  audioUrl: z.string().trim().max(100).optional().or(z.literal("")),

  neutralAnswerImage: z
    .string()
    .trim()
    .default("https://cdn-icons-png.flaticon.com/128/14853/14853363.png"),

  badAnswerImage: z
    .string()
    .trim()
    .default("https://cdn-icons-png.flaticon.com/128/2461/2461878.png"),

  correctAnswerImage: z
    .string()
    .trim()
    .default("https://cdn-icons-png.flaticon.com/128/10851/10851297.png"),

  order: z.number().default(0),
  isActive: z.boolean().optional().default(true),
});
export type ExerciseInput = z.infer<typeof exerciseSchema>;
