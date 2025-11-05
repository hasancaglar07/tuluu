import { z } from "zod";

const SUPPORTED_LOCALES = ["en", "fr", "ar", "hi", "zh", "es", "tr"];

export const LanguageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Language name is required")
    .max(100, "Language name is too long"),

  nativeName: z
    .string()
    .trim()
    .min(1, "Native name is required")
    .max(100, "Native name is too long"),

  flag: z
    .string()
    .trim()
    .min(1, "Flag is required")
    .max(10, "Flag must be an emoji or short string"), // Adjust as needed

  baseLanguage: z
    .string()
    .trim()
    .min(1, "Base language is required")
    .max(10, "Base language code is too long"),
  // Optional: use .refine(val => ['en', 'es', 'fr'].includes(val)) for stricter control

  isActive: z.boolean().optional().default(true),
  imageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().max(500, "Image URL is too long").optional()
  ),
  locale: z.enum(SUPPORTED_LOCALES as [string, ...string[]]).default("tr"),
  category: z
    .enum([
      "faith_morality",
      "quran_arabic",
      "math_logic",
      "science_discovery",
      "language_learning",
      "mental_spiritual",
      "personal_social",
    ])
    .default("language_learning"),
  themeMetadata: z
    .object({
      islamicContent: z.boolean().default(false),
      ageGroup: z
        .enum(["kids_4-7", "kids_8-12", "teens_13-17", "all"])
        .default("all"),
      moralValues: z.array(z.string()).default([]),
      educationalFocus: z.string().max(200).optional().default(""),
      difficultyLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .default("beginner"),
    })
    .default({
      islamicContent: false,
      ageGroup: "all",
      moralValues: [],
      educationalFocus: "",
      difficultyLevel: "beginner",
    }),
});

export type LanguageInput = z.infer<typeof LanguageSchema>;
