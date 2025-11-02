import { z } from "zod";
export const ChapterSchema = z.object({
  languageId: z.string().trim().min(1, { message: "Language ID is required" }),

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

  isActive: z.boolean().optional().default(false),
  isPremium: z.boolean().optional().default(false),
  isExpanded: z.boolean().optional().default(false),

  imageUrl: z
    .string()
    .trim()
    .url({ message: "Image URL must be a valid URL" })
    .optional()
    .or(z.literal("")),

  order: z
    .number()
    .int({ message: "Order must be an integer" })
    .nonnegative({ message: "Order must be a non-negative number" })
    .max(20, { message: "Order must be 20 or less" })
    .optional()
    .default(0),
});

export type Chapter = z.infer<typeof ChapterSchema>;
