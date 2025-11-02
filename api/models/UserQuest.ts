import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

// -----------------------------
// Type Definitions
// -----------------------------

export type ConditionType = string; // Ideally use a union of allowed condition types
export type RewardType = string; // Ideally use a union of allowed reward types

export interface QuestCondition {
  _id: Types.ObjectId;
  type: ConditionType;
  target: number;
}

export interface Rewards {
  rewardType: string;
  rewardValue: string;
  claimedAt: Date;
  transactionId: string;
}

export interface QuestReward {
  type: RewardType;
  value: number | string | Record<string, unknown>;
}

export interface PopulatedQuest {
  _id: Types.ObjectId;
  conditions: QuestCondition[];
  rewards: QuestReward[];
  endDate?: Date;
  priority?: number;
}

// -----------------------------
// Schemas
// -----------------------------

const ConditionProgressSchema = new Schema({
  conditionId: { type: Schema.Types.ObjectId, required: true },
  conditionType: { type: String, required: true },
  currentValue: { type: Number, default: 0 },
  targetValue: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
});

const ClaimedRewardSchema = new Schema({
  rewardType: { type: String, required: true },
  rewardValue: { type: Schema.Types.Mixed, required: true },
  claimedAt: { type: Date, default: Date.now },
  transactionId: { type: String },
});

const UserQuestSchema = new Schema(
  {
    userId: { type: String, required: true },
    questId: { type: String, ref: "Quest", required: true },
    status: {
      type: String,
      enum: [
        "assigned",
        "started",
        "in_progress",
        "completed",
        "failed",
        "expired",
        "abandoned",
      ],
      default: "assigned",
      required: true,
    },
    overallProgress: { type: Number, default: 0, min: 0 },
    conditionsProgress: [ConditionProgressSchema],
    assignedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },
    expiresAt: { type: Date },
    rewardsClaimed: [ClaimedRewardSchema],
    totalRewardsValue: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ["auto_assigned", "user_selected", "admin_assigned", "event"],
      default: "auto_assigned",
    },
    priority: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    isFavorited: { type: Boolean, default: false },
    sessionData: { type: Schema.Types.Mixed },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// -----------------------------
// Indexes
// -----------------------------

UserQuestSchema.index({ userId: 1, status: 1 });
UserQuestSchema.index({ questId: 1, status: 1 });
UserQuestSchema.index({ userId: 1, questId: 1 }, { unique: true });
UserQuestSchema.index({ status: 1, expiresAt: 1 });
UserQuestSchema.index({ lastActivityAt: -1 });
UserQuestSchema.index({ completedAt: -1 });

// -----------------------------
// Virtuals
// -----------------------------

UserQuestSchema.virtual("isExpired").get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

UserQuestSchema.virtual("isActive").get(function () {
  return ["started", "in_progress"].includes(this.status);
});

UserQuestSchema.virtual("timeRemaining").get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  if (now > this.expiresAt) return 0;
  return Math.max(0, this.expiresAt.getTime() - now.getTime());
});

// -----------------------------
// Static Methods
// -----------------------------

UserQuestSchema.statics.getUserActiveQuests = async function (userId: string) {
  return this.find({
    userId,
    status: { $in: ["assigned", "started", "in_progress"] },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } },
    ],
    isVisible: true,
  })
    .populate("questId")
    .sort({ priority: -1, assignedAt: 1 });
};

UserQuestSchema.statics.getUserCompletedQuests = async function (
  userId: string,
  limit = 10
) {
  return this.find({
    userId,
    status: "completed",
  })
    .populate("questId")
    .sort({ completedAt: -1 })
    .limit(limit);
};

UserQuestSchema.statics.updateQuestProgress = async function (
  userId: string,
  questId: string,
  conditionType: string,
  incrementValue = 1,
  metadata?: Record<string, unknown>
) {
  const userQuest = await this.findOne({ userId, questId }).populate("questId");
  if (!userQuest || userQuest.status === "completed") return null;

  const conditionProgress = userQuest.conditionsProgress.find(
    (cp: { conditionType: string }) => cp.conditionType === conditionType
  );

  if (conditionProgress) {
    conditionProgress.currentValue = Math.min(
      conditionProgress.currentValue + incrementValue,
      conditionProgress.targetValue
    );

    if (
      conditionProgress.currentValue >= conditionProgress.targetValue &&
      !conditionProgress.isCompleted
    ) {
      conditionProgress.isCompleted = true;
      conditionProgress.completedAt = new Date();
    }

    if (metadata) {
      conditionProgress.metadata = {
        ...conditionProgress.metadata,
        ...metadata,
      };
    }
  }

  const totalConditions = userQuest.conditionsProgress.length;
  const completedConditions = userQuest.conditionsProgress.filter(
    (cp: { isCompleted: boolean }) => cp.isCompleted
  ).length;
  userQuest.overallProgress =
    totalConditions > 0
      ? Math.round((completedConditions / totalConditions) * 100)
      : 0;

  if (userQuest.overallProgress === 100 && userQuest.status !== "completed") {
    userQuest.status = "completed";
    userQuest.completedAt = new Date();
  }

  userQuest.lastActivityAt = new Date();

  if (userQuest.status === "assigned") {
    userQuest.status = "started";
    userQuest.startedAt = new Date();
  } else if (userQuest.status === "started") {
    userQuest.status = "in_progress";
  }

  await userQuest.save();
  return userQuest;
};

UserQuestSchema.statics.assignQuestToUser = async function (
  userId: string,
  questId: string,
  expiresAt?: Date,
  source = "auto_assigned"
) {
  const existing = await this.findOne({ userId, questId });
  if (existing) return existing;

  const Quest = model("Quest");
  const quest = (await Quest.findById(questId)) as PopulatedQuest;
  if (!quest) throw new Error("Quest not found");

  const conditionsProgress = quest.conditions.map((condition) => ({
    conditionId: condition._id,
    conditionType: condition.type,
    currentValue: 0,
    targetValue: condition.target,
    isCompleted: false,
    metadata: {},
  }));

  const userQuest = new this({
    userId,
    questId,
    conditionsProgress,
    expiresAt: expiresAt || quest.endDate,
    source,
    priority: quest.priority || 0,
  });

  await userQuest.save();
  return userQuest;
};

UserQuestSchema.statics.claimQuestRewards = async function (
  userId: string,
  questId: string
) {
  const userQuest = await this.findOne({
    userId,
    questId,
    status: "completed",
  }).populate("questId");

  if (!userQuest || userQuest.rewardsClaimed.length > 0) return null;

  const quest = userQuest.questId as PopulatedQuest;
  const claimedRewards = [];
  let totalValue = 0;

  for (const reward of quest.rewards) {
    const claimedReward = {
      rewardType: reward.type,
      rewardValue: reward.value,
      claimedAt: new Date(),
      transactionId: `quest_${questId}_${Date.now()}`,
    };

    claimedRewards.push(claimedReward);

    if (typeof reward.value === "number") {
      totalValue += reward.value;
    }
  }

  userQuest.rewardsClaimed = claimedRewards;
  userQuest.totalRewardsValue = totalValue;
  await userQuest.save();

  return {
    userQuest,
    rewards: claimedRewards,
    totalValue,
  };
};

// -----------------------------
// Middleware
// -----------------------------

UserQuestSchema.pre("save", function (next) {
  if (
    this.expiresAt &&
    new Date() > this.expiresAt &&
    this.status !== "completed"
  ) {
    this.status = "expired";
  }
  next();
});

// -----------------------------
// Types & Model
// -----------------------------

export type UserQuestType = InferSchemaType<typeof UserQuestSchema>;
export type UserQuestDocument = HydratedDocument<UserQuestType>;

export interface UserQuestModel extends Model<UserQuestType> {
  getUserActiveQuests(userId: string): Promise<UserQuestDocument[]>;
  getUserCompletedQuests(
    userId: string,
    limit?: number
  ): Promise<UserQuestDocument[]>;
  updateQuestProgress(
    userId: string,
    questId: string,
    conditionType: string,
    incrementValue?: number,
    metadata?: Record<string, unknown>
  ): Promise<UserQuestDocument | null>;
  assignQuestToUser(
    userId: string,
    questId: string,
    expiresAt?: Date,
    source?: string
  ): Promise<UserQuestDocument>;
  claimQuestRewards(
    userId: string,
    questId: string
  ): Promise<{
    userQuest: UserQuestDocument;
    rewards: Rewards[];
    totalValue: number;
  } | null>;
}

const UserQuest =
  (models.UserQuest as UserQuestModel) ||
  model<UserQuestType, UserQuestModel>("UserQuest", UserQuestSchema);

export default UserQuest;
