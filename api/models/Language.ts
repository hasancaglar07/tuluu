import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

/**
 * 1. Define Schema
 */
const SUPPORTED_LOCALES = ["en", "fr", "ar", "hi", "zh", "es", "tr"];

const LanguageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    nativeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    flag: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 10,
    },
    baseLanguage: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 50,
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    locale: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      enum: SUPPORTED_LOCALES,
      default: "tr",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: [
        "faith_morality",
        "quran_arabic",
        "math_logic",
        "science_discovery",
        "language_learning",
        "mental_spiritual",
        "personal_social",
      ],
      default: "language_learning",
    },
    themeMetadata: {
      islamicContent: { type: Boolean, default: false },
      ageGroup: {
        type: String,
        enum: ["kids_4-7", "kids_8-12", "teens_13-17", "all"],
        default: "all",
      },
      moralValues: {
        type: [String],
        default: [],
      },
      educationalFocus: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      difficultyLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
    },
  },
  { timestamps: true }
);

// Unique composite index
LanguageSchema.index({ name: 1, baseLanguage: 1 }, { unique: true });
LanguageSchema.index({ category: 1, "themeMetadata.ageGroup": 1 });

/**
 * 2. Types
 */
export type LanguageType = InferSchemaType<typeof LanguageSchema>;
export type LanguageDocument = HydratedDocument<LanguageType>;

export interface LanguageModel extends mongoose.Model<LanguageType> {
  findActiveLanguages(): Promise<LanguageDocument[]>;
  disableById(id: string): Promise<LanguageDocument | null>;
}

/**
 * 3. Statics
 */
LanguageSchema.statics.findActiveLanguages = function () {
  return this.find({ isActive: true });
};

LanguageSchema.statics.disableById = function (id: string) {
  return this.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  ).exec();
};

/**
 * 4. Instance Methods
 */
LanguageSchema.methods.getDisplayName = function (): string {
  return `${this.nativeName} (${this.name})`;
};

/**
 * 6. Export model
 */
const Language =
  (models.Language as LanguageModel) ||
  model<LanguageType, LanguageModel>("Language", LanguageSchema);

export default Language;
