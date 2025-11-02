import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

// 1. Define Schema
const ChapterSchema = new Schema(
  {
    languageId: { type: String, required: true, ref: "Language" },
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // optional if you want all titles in lowercase
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    isPremium: { type: Boolean, default: false },
    isExpanded: { type: Boolean, default: false },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
      min: [1, "Order must be at least 1"],
      max: [20, "Order cannot be more than 20"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 2. Add Indexes
ChapterSchema.index({ languageId: 1 });

// 3. Define Types from Schema
export type ChapterType = InferSchemaType<typeof ChapterSchema>;
export type ChapterDocument = HydratedDocument<ChapterType>;

export interface ChapterModel extends mongoose.Model<ChapterType> {
  disableById(id: string): Promise<ChapterDocument | null>;
}

ChapterSchema.statics.disableById = function (id: string) {
  return this.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  ).exec();
};

// 4. Export Model (safe for hot reloads)
const Chapter =
  (models.Chapter as ChapterModel) ||
  model<ChapterType, ChapterModel>("Chapter", ChapterSchema);

export default Chapter;
