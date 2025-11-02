import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
} from "mongoose";

// Schema for login records
const LoginRecordSchema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  ip: { type: String, required: true },
  device: { type: String, required: true },
  browser: { type: String, required: true },
  location: { type: String },
  success: { type: Boolean, required: true },
});

// Schema for logout records
const LogoutRecordSchema = new Schema({
  date: { type: Date, default: Date.now },
  sessionId: String,
  reason: String,
});

// 1. Define Schema
const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    xp: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    gel: { type: Number, default: 0 },
    hearts: { type: Number, default: 5 },
    streak: { type: Number, default: 0 },
    achievements: [{ type: String }],
    loginHistory: [LoginRecordSchema],
    logoutHistory: [LogoutRecordSchema],
    languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
  },
  {
    timestamps: true,
  }
);

// 2. Static Methods
UserSchema.statics.findByClerkId = function (clerkId: string) {
  return this.findOne({ clerkId }) ?? null;
};

UserSchema.statics.addLanguage = async function (
  userId: string,
  languageId: string
): Promise<UserDocument | null> {
  return this.findByIdAndUpdate(
    userId,
    {
      $addToSet: { languages: languageId }, // ensures no duplicates
    },
    { new: true }
  );
};

// 3. Types
export type UserType = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<UserType>;

export interface UserModel extends Model<UserType> {
  findByClerkId(clerkId: string): Promise<UserDocument | null>;
  addLanguage(userId: string, languageId: string): Promise<UserDocument | null>;
}

// 4. Safe Export
const User =
  (models.User as UserModel) || model<UserType, UserModel>("User", UserSchema);

export default User;
