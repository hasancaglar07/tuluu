import { z } from "zod";

// Utility for MongoDB ObjectId validation (24-char hex string)
// const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const optionSupportedTypes = ["translate", "select", "arrange", "match"];
const audioSupportedTypes = ["listen", "speak"];

export const exerciseSchema = z
  .object({
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

    options: z.array(z.string()).max(20, "No more than 20 options allowed").default([]),

    isNewWord: z.boolean().default(false),

    audioUrl: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().trim().max(500, "Audio URL is too long").optional()
    ),

    neutralAnswerImage: z
      .string()
      .trim()
      .max(500, "Image URL is too long")
      .default("https://cdn-icons-png.flaticon.com/128/14853/14853363.png"),

    badAnswerImage: z
      .string()
      .trim()
      .max(500, "Image URL is too long")
      .default("https://cdn-icons-png.flaticon.com/128/2461/2461878.png"),

    correctAnswerImage: z
      .string()
      .trim()
      .max(500, "Image URL is too long")
      .default("https://cdn-icons-png.flaticon.com/128/10851/10851297.png"),

    order: z.number().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    const nonEmptyOptions = data.options.filter(
      (option) => option.trim().length > 0
    );

    if (optionSupportedTypes.includes(data.type)) {
      if (nonEmptyOptions.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: "At least one option is required for this exercise type",
        });
      }
    } else if (nonEmptyOptions.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options are not supported for this exercise type",
      });
    }

    if (audioSupportedTypes.includes(data.type)) {
      if (!data.audioUrl || data.audioUrl.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["audioUrl"],
          message: "Audio URL is required for this exercise type",
        });
      }
    }
  });
export type ExerciseInput = z.infer<typeof exerciseSchema>;
