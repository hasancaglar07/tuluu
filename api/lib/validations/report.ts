import { z } from "zod";

export const reportSchema = z.object({
  // User Information
  userId: z.string().trim().min(1, "userId is required"),

  // Content References (optional in some cases, but required in schema)
  lessonId: z.string().trim().min(1, "lessonId is required"),
  exerciseId: z.string().trim().min(1, "exerciseId is required"),

  // Report Classification
  type: z.enum([
    "bug",
    "content_issue",
    "user_report",
    "payment_issue",
    "audio_issue",
    "ui_issue",
    "performance_issue",
  ]),

  // Report Status Management
  status: z
    .enum(["open", "in_progress", "resolved", "closed", "duplicate"])
    .default("open"),

  // Report Content
  title: z.string().optional(),
  description: z.string().optional(),

  // Additional Report Data
  reasons: z.array(z.string().trim()).optional(),

  // Metadata
  date: z.date().optional(), // Usually set by server

  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),

  // Technical Context
  userAgent: z.string().trim().optional(),
  url: z.string().trim().url().optional(),

  // Admin Fields
  assignedTo: z.string().trim().optional(),
  adminNotes: z.string().trim().max(1000).optional(),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().trim().optional(),
});
