import { z } from "zod";

export const UnitSchema = z.object({
  chapterId: z.string().min(1, "Chapter ID is required"),
  languageId: z.string().min(1, "Language ID is required"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters")
    .trim()
    .toLowerCase(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description must be at most 1000 characters")
    .trim(),
  isPremium: z.boolean().optional().default(false),
  isExpanded: z.boolean().optional().default(false),
  imageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().max(500, "Image URL is too long").optional()
  ),
  order: z
    .number()
    .int({ message: "Order must be an integer" })
    .min(0, { message: "Order must be at least 0" })
    .max(20, { message: "Order cannot be more than 20" })
    .optional()
    .default(0),
  isActive: z.boolean().optional().default(true),
  color: z
    .string()
    .trim()
    .regex(/^bg-\[\#[0-9a-fA-F]{6}\]$/, {
      message: "Color must be in the format bg-[#hexcode]",
    })
    .default("bg-[#ff2dbd]"),
});

export type Unit = z.infer<typeof UnitSchema>;
