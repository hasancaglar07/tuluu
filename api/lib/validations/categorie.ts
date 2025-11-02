import { z } from "zod";

// Validation schema for category updates
export const updateCategorySchema = z.object({
  name: z.string().min(2).max(30).optional(),
  description: z.string().max(200).optional(),
  color: z
    .string()
    // .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
});

// Infer the type
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Validation schema for category creation
export const createCategorySchema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  icon: z.string().optional(),
  sortOrder: z.number().default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
