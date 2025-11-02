import {
  Schema,
  model,
  models,
  type Model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

// 1. Define Schema
const UserAchievementSchema = new Schema(
  {
    userId: { type: String, required: true },
    achievementId: { type: String, required: true },
    earnedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// 2. Add Index
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// 3. Static Methods
UserAchievementSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId });
};

UserAchievementSchema.statics.addAchievement = async function (
  userId: string,
  achievementId: string
) {
  return this.findOneAndUpdate(
    { userId, achievementId },
    { $setOnInsert: { earnedDate: new Date() } },
    { upsert: true, new: true }
  );
};

// 4. Types
export type UserAchievementType = InferSchemaType<typeof UserAchievementSchema>;
export type UserAchievementDocument = HydratedDocument<UserAchievementType>;

export interface UserAchievementModel extends Model<UserAchievementType> {
  findByUserId(userId: string): Promise<UserAchievementDocument[]>;
  addAchievement(
    userId: string,
    achievementId: string
  ): Promise<UserAchievementDocument>;
}

// 5. Safe Export
const UserAchievement =
  (models.UserAchievement as UserAchievementModel) ||
  model<UserAchievementType, UserAchievementModel>(
    "UserAchievement",
    UserAchievementSchema
  );

export default UserAchievement;
