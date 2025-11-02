import { z } from "zod";
export const seoUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title should be less than 60 characters"),
  description: z
    .string()
    .max(160, "Description should be less than 160 characters")
    .optional()
    .or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  locale: z.string().min(1, "Locale is required"),
  robots: z.string(),
  structuredData: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Structured data must be valid JSON",
      }
    )
    .optional()
    .or(z.literal("")),
});
