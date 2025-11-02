import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
  FilterQuery,
} from "mongoose";

export interface UserCriteria {
  level?: number;
  country?: string;
  // Add more fields here as you expand targeting logic
}
export interface QuestAnalytics {
  totalCompletions: number;
  averageCompletionTime: number;
  activeUsers: number;
  // Add additional metrics as needed
}
// Schema for quest rewards
const RewardSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["xp", "gems", "gel", "hearts", "badge", "streak_freeze", "custom"],
  },
  value: { type: Schema.Types.Mixed, required: true }, // Can be number or string (for badges)
  description: { type: String }, // Optional description for custom rewards
});

// Schema for quest conditions/requirements
const QuestConditionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "complete_lessons",
      "earn_xp",
      "maintain_streak",
      "perfect_lessons",
      "practice_minutes",
      "complete_units",
      "learn_words",
      "use_hearts",
      "custom",
    ],
    default: "earn_xp",
  },
  target: { type: Number, required: true }, // Target number to achieve
  timeframe: {
    type: String,
    enum: ["daily", "weekly", "monthly", "total", "session"],
    default: "total",
  },
  metadata: { type: Schema.Types.Mixed }, // Additional condition data
});

// Main Quest Schema
const QuestSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 10,
      maxlength: 255,
    },
    type: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "event", "achievement", "custom"],
      
    },
    goal: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100,
    }, // Human-readable goal description

    // Quest conditions
    conditions: [QuestConditionSchema],

    // Rewards
    rewards: [RewardSchema],

    // Timing
    startDate: { type: Date, required: true},
    endDate: { type: Date, required: true },

    // Status and targeting
    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "active",
        "paused",
        "completed",
        "expired",
        "cancelled",
        "locked",
      ],
      default: "draft",
    },
    targetSegment: {
      type: String,
      required: true,
      enum: ["all", "premium", "free", "custom"],
      default: "all",
    },

    // Targeting criteria for custom segments
    targetCriteria: {
      minLevel: { type: Number },
      maxLevel: { type: Number },
      languages: [{ type: String }], // Language codes
      countries: [{ type: String }], // Country codes
      userTypes: [{ type: String, enum: ["free", "premium", "trial"] }],
      minStreak: { type: Number },
      maxStreak: { type: Number },
      registrationDateRange: {
        from: { type: Date },
        to: { type: Date },
      },
    },

    // Quest metadata
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["learning", "engagement", "social", "achievement", "special"],
      default: "learning",
    },
    priority: { type: Number, default: 0 }, // Higher priority quests shown first

    // Limits and restrictions
    maxParticipants: { type: Number }, // Optional participant limit
    isRepeatable: { type: Boolean, default: false },
    cooldownPeriod: { type: Number }, // Hours before quest can be repeated

    // Analytics and tracking
    usersAssigned: { type: Number, default: 0 },
    usersStarted: { type: Number, default: 0 },
    usersCompleted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // Calculated field

    // Admin fields
    createdBy: { type: String, required: true }, // Admin user ID
    lastModifiedBy: { type: String },
    tags: [{ type: String }], // For organization and filtering
    notes: { type: String }, // Internal admin notes

    // Feature flags
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
QuestSchema.index({ status: 1, type: 1 });
QuestSchema.index({ startDate: 1, endDate: 1 });
QuestSchema.index({ targetSegment: 1, status: 1 });
QuestSchema.index({ createdAt: -1 });
QuestSchema.index({ priority: -1, startDate: 1 });

// Virtual for checking if quest is currently active
QuestSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === "active" && this.startDate <= now && this.endDate >= now
  );
});

// Virtual for checking if quest is expired
QuestSchema.virtual("isExpired").get(function () {
  return new Date() > this.endDate;
});

// Virtual for time remaining
QuestSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  if (now > this.endDate) return 0;
  return Math.max(0, this.endDate.getTime() - now.getTime());
});

// Static method to get active quests for a user segment
QuestSchema.statics.getActiveQuestsForSegment = async function (
  segment: string,
  userCriteria?: UserCriteria
) {
  const now = new Date();
  const query: FilterQuery<QuestDocument> = {
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
    isVisible: true,
    $or: [{ targetSegment: "all" }, { targetSegment: segment }],
  };

  // Add custom targeting criteria if provided
  if (userCriteria && segment === "custom") {
    // Add complex targeting logic here
    if (userCriteria.level) {
      query["targetCriteria.minLevel"] = { $lte: userCriteria.level };
      query["targetCriteria.maxLevel"] = { $gte: userCriteria.level };
    }
    if (userCriteria.country) {
      query["targetCriteria.countries"] = { $in: [userCriteria.country] };
    }
    // Add more criteria as needed
  }

  return this.find(query).sort({ priority: -1, startDate: 1 }).lean();
};

// Static method to update completion statistics
QuestSchema.statics.updateCompletionStats = async function (questId: string) {
  const quest = await this.findById(questId);
  if (!quest) return null;

  // Calculate completion rate
  const completionRate =
    quest.usersAssigned > 0
      ? Math.round((quest.usersCompleted / quest.usersAssigned) * 100)
      : 0;

  return this.findByIdAndUpdate(questId, { completionRate }, { new: true });
};

// Static method to get quest analytics
QuestSchema.statics.getQuestAnalytics = async function (questId: string) {
  const quest = await this.findById(questId);
  if (!quest) return null;

  // You can add more complex analytics here
  return {
    questId: quest._id,
    title: quest.title,
    type: quest.type,
    status: quest.status,
    usersAssigned: quest.usersAssigned,
    usersStarted: quest.usersStarted,
    usersCompleted: quest.usersCompleted,
    completionRate: quest.completionRate,
    timeRemaining: quest.timeRemaining,
    isActive: quest.isActive,
    isExpired: quest.isExpired,
  };
};

// Pre-save middleware to update completion rate
QuestSchema.pre("save", function (next) {
  if (this.usersAssigned > 0) {
    this.completionRate = Math.round(
      (this.usersCompleted / this.usersAssigned) * 100
    );
  }
  next();
});

// Types
export type QuestType = InferSchemaType<typeof QuestSchema>;
export type QuestDocument = HydratedDocument<QuestType>;

export interface QuestModel extends Model<QuestType> {
  getActiveQuestsForSegment(
    segment: string,
    userCriteria?: UserCriteria
  ): Promise<QuestType[]>;
  updateCompletionStats(questId: string): Promise<QuestDocument | null>;
  getQuestAnalytics(questId: string): Promise<QuestAnalytics>;
}

// Safe Export
const Quest =
  (models.Quest as QuestModel) ||
  model<QuestType, QuestModel>("Quest", QuestSchema);

export default Quest;
