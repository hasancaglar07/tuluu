import { z } from "zod";

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
  imageUrl: z.string().optional().default(""),
});

export type LanguageInput = z.infer<typeof LanguageSchema>;
