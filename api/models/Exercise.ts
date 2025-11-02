import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

// 1. Define Schema
const ExerciseSchema = new Schema(
  {
    lessonId: { type: String, required: true, ref: "Lesson" },
    unitId: { type: String, required: true, ref: "Unit" },
    chapterId: { type: String, required: true, ref: "Chapter" },
    languageId: { type: String, required: true, ref: "Language" },

    type: {
      type: String,
      enum: ["translate", "select", "arrange", "match", "listen", "speak"],
      required: true,
      trim: true,
    },

    instruction: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
      lowercase: true,
    },

    sourceText: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
      lowercase: true,
    },

    sourceLanguage: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 20,
    },

    targetLanguage: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 20,
    },

    correctAnswer: {
      type: [String],
      required: true,
      validate: (arr: string[]) => arr.length > 0,
    },

    options: {
      type: [String],
      default: [],
    },

    isNewWord: {
      type: Boolean,
      default: false,
    },

    audioUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    neutralAnswerImage: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/128/14853/14853363.png",
    },

    badAnswerImage: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/128/2461/2461878.png",
    },

    correctAnswerImage: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/128/10851/10851297.png",
    },

    order: {
      type: Number,
      default: 1,
      min: [1, "Order must be at least 1"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 2. Indexes
ExerciseSchema.index({
  lessonId: 1,
  unitId: 1,
  chapterId: 1,
  languageId: 1,
});

// 3. Create Types
export type ExerciseType = InferSchemaType<typeof ExerciseSchema>;
export type ExerciseDocument = HydratedDocument<ExerciseType>;

export interface ExerciseModel extends mongoose.Model<ExerciseType> {
  findActiveLanguages(): Promise<ExerciseDocument[]>;
  disableById(id: string): Promise<ExerciseDocument | null>;
}

// 4. Export Model (hot reload safe)
const Exercise =
  (models.Exercise as ExerciseModel) ||
  model<ExerciseType, ExerciseModel>("Exercise", ExerciseSchema);

export default Exercise;
