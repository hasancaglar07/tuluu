import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

// 1. Define Schema
const UnitSchema = new Schema(
  {
    chapterId: { type: String, required: true, ref: "Chapter", trim: true },
    languageId: { type: String, required: true, ref: "Language", trim: true },
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
      minlength: 5,
      maxlength: 1000,
    },
    isPremium: { type: Boolean, default: false },
    isExpanded: { type: Boolean, default: false },
    imageUrl: { type: String, default: "", trim: true, maxlength: 500 },
    order: {
      type: Number,
      default: 1,
    },
    color: { type: String, default: "bg-[#ff2dbd]" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// 2. Add Indexes
UnitSchema.index({ chapterId: 1, languageId: 1 });

// 3. Add Statics
UnitSchema.statics.findByChapter = function (chapterId: string) {
  return this.find({ chapterId }).sort({ order: 1 });
};

UnitSchema.statics.disableById = function (id: string) {
  return this.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  ).exec();
};

// 4. Define Types from Schema
export type UnitType = InferSchemaType<typeof UnitSchema>;
export type UnitDocument = HydratedDocument<UnitType>;

export interface UnitModel extends mongoose.Model<UnitType> {
  findByChapter(chapterId: string): Promise<UnitDocument[]>;
  disableById(id: string): Promise<UnitDocument | null>;
}

// 5. Export Model (safe for hot reloads)
const Unit =
  (models.Unit as UnitModel) || model<UnitType, UnitModel>("Unit", UnitSchema);

export default Unit;
