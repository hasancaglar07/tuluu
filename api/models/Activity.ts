import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

// 1. Define Schema
const ActivitySchema = new Schema(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "admin_action",
        "lesson_completed",
        "quest_completed",
        "streak_milestone",
        "level_up",
        "purchase",
        "achievement_earned",
      ],
      required: true,
    },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    xpEarned: { type: Number },
    gemsEarned: { type: Number },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2. Indexes
ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ date: -1 });

// 3. Static Methods
ActivitySchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ date: -1 });
};

ActivitySchema.statics.getRecentActivity = function (
  userId: string | Types.ObjectId,
  limit = 10
) {
  return this.find({ userId }).sort({ date: -1 }).limit(limit);
};

// 4. Type Definitions
export type ActivityType = InferSchemaType<typeof ActivitySchema>;
export type ActivityDocument = HydratedDocument<ActivityType>;

export interface ActivityModel extends Model<ActivityType> {
  findByUserId(userId: string): Promise<ActivityDocument[]>;
  getRecentActivity(
    userId: string | Types.ObjectId,
    limit?: number
  ): Promise<ActivityDocument[]>;
}

// 5. Safe Export for HMR
const Activity =
  (models.Activity as ActivityModel) ||
  model<ActivityType, ActivityModel>("Activity", ActivitySchema);

export default Activity;
