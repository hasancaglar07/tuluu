import { z } from "zod";

// Validation schema for quest conditions
export const QuestConditionSchema = z.object({
  type: z
    .enum([
      "complete_lessons",
      "earn_xp",
      "maintain_streak",
      "perfect_lessons",
      "practice_minutes",
      "complete_units",
      "learn_words",
      "use_hearts",
      "custom",
    ])
    .default("earn_xp"),
  target: z.number().positive(),
  timeframe: z
    .enum(["daily", "weekly", "monthly", "total", "session"])
    .default("total"),
  metadata: z.record(z.any()).optional(),
});

// Validation schema for quest rewards
export const QuestRewardSchema = z.object({
  type: z.enum([
    "xp",
    "gems",
    "gel",
    "hearts",
    "badge",
    "streak_freeze",
    "custom",
  ]),
  value: z.union([z.number(), z.string()]),
  description: z.string().optional(),
});

// Validation schema for target criteria
export const TargetCriteriaSchema = z.object({
  minLevel: z.number().optional(),
  maxLevel: z.number().optional(),
  languages: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  userTypes: z.array(z.enum(["free", "premium", "trial"])).optional(),
  minStreak: z.number().optional(),
  maxStreak: z.number().optional(),
  registrationDateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
});

// Validation schema for creating a new quest
export const CreateQuestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  type: z.enum([
    "daily",
    "weekly",
    "monthly",
    "event",
    "achievement",
    "custom",
  ]),
  goal: z
    .string()
    .min(3, "Goal must be at least 3 characters")
    .max(100, "Goal must be less than 100 characters"),
  conditions: z
    .array(QuestConditionSchema)
    .min(1, "At least one condition is required"),
  rewards: z.array(QuestRewardSchema).min(1, "At least one reward is required"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z
    .enum(["draft", "active", "paused", "completed", "expired", "cancelled"])
    .default("draft")
    .optional(),
  targetSegment: z
    .enum([
      "all",
      "beginners",
      "intermediate",
      "advanced",
      "premium",
      "free",
      "custom",
    ])
    .default("all"),
  targetCriteria: TargetCriteriaSchema.optional(),
  difficulty: z
    .enum(["easy", "medium", "hard", "expert"])
    .default("medium")
    .optional(),
  category: z
    .enum(["learning", "engagement", "social", "achievement", "special"])
    .default("learning")
    .optional(),
  priority: z.number().default(0).optional(),
  maxParticipants: z.number().optional(),
  isRepeatable: z.boolean().default(false).optional(),
  cooldownPeriod: z.number().optional(),
  isVisible: z.boolean().default(true).optional(),
  isFeatured: z.boolean().default(false).optional(),
  requiresApproval: z.boolean().default(false).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Validation schema for updating an existing quest
export const UpdateQuestSchema = CreateQuestSchema.partial();

// Validation schema for quest status change
export const QuestStatusChangeSchema = z.object({
  action: z.enum(["pause", "resume", "activate", "deactivate"]),
});

// Validation schema for quest search and filtering
export const QuestSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
});
