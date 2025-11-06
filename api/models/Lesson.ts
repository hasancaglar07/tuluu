import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

// 1. Define Schema
const LessonSchema = new Schema(
  {
    unitId: {
      type: String,
      required: true,
      ref: "Unit",
      trim: true,
    },
    chapterId: {
      type: String,
      required: true,
      ref: "Chapter",
      trim: true,
    },
    languageId: {
      type: String,
      required: true,
      ref: "Language",
      trim: true,
    },
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
    isPremium: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    xpReward: {
      type: Number,
      default: 10,
      min: 1,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
      min: [1, "Order must be at least 1"],
      max: [20, "Order cannot be more than 20"],
    },
    storyPages: {
      type: [
        new Schema(
          {
            pageNumber: {
              type: Number,
              required: true,
              min: 1,
            },
            imageUrl: {
              type: String,
              required: true,
              trim: true,
              maxlength: 500,
            },
            audioUrl: {
              type: String,
              trim: true,
              maxlength: 500,
              default: "",
            },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    storyMetadata: {
      bookId: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      displayName: {
        type: String,
        trim: true,
        maxlength: 150,
      },
      coverImageUrl: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      themeColor: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      ageBadge: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      hasAudio: {
        type: Boolean,
        default: false,
      },
      supportedLocales: {
        type: [String],
        default: [],
      },
      primaryLocale: {
        type: String,
        trim: true,
        maxlength: 10,
      },
    },

    isTest: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// 2. Add Indexes
// LessonSchema.index({ id: 1, unitId: 1, chapterId: 1, languageId: 1 });

// 3. Add Statics
LessonSchema.statics.findByLanguage = function (languageId: string) {
  return this.find({ languageId }).sort({ order: 1 });
};

LessonSchema.statics.disableById = function (id: string) {
  return this.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  ).exec();
};

LessonSchema.statics.getFirstLessonByLanguage = async function (
  languageId: string
) {
  const firstChapter = await mongoose
    .model("Chapter")
    .findOne({ languageId })
    .sort({ order: 1 })
    .exec();
  if (!firstChapter) return null;

  const firstUnit = await mongoose
    .model("Unit")
    .findOne({ chapterId: firstChapter._id })
    .sort({ order: 1 })
    .exec();
  if (!firstUnit) return null;

  return this.findOne({ unitId: firstUnit._id }).sort({ order: 1 }).exec();
};

LessonSchema.statics.findTestById = function (id: string) {
  return this.findOne({
    unitId: id,
    isTest: true,
  }).exec();
};

// 4. Define Types from Schema
export type LessonType = InferSchemaType<typeof LessonSchema>;
export type LessonDocument = HydratedDocument<LessonType>;

export interface LessonModel extends mongoose.Model<LessonType> {
  findByLanguage(languageId: string): Promise<LessonDocument[]>;
  disableById(id: string): Promise<LessonDocument | null>;
  getFirstLessonByLanguage(languageId: string): Promise<LessonDocument | null>;
  findTestById(id: string): Promise<LessonDocument | null>;
}

// 5. Export Model (safe for hot reloads)
const Lesson =
  (models.Lesson as LessonModel) ||
  model<LessonType, LessonModel>("Lesson", LessonSchema);

export default Lesson;
