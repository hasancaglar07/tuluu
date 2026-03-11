import mongoose, {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

const optionSupportedTypes = ["translate", "select", "arrange", "match"];
const audioSupportedTypes = ["listen"];
const educationTypes = [
  "education_image_intro",
  "education_visual",
  "education_video",
  "education_audio",
  "education_tip",
] as const;

// 1. Define Schema
const ExerciseSchema = new Schema(
  {
    lessonId: { type: String, required: true, ref: "Lesson" },
    unitId: { type: String, required: true, ref: "Unit" },
    chapterId: { type: String, required: true, ref: "Chapter" },
    languageId: { type: String, required: true, ref: "Language" },

    type: {
      type: String,
      enum: [
        "translate",
        "select",
        "arrange",
        "match",
        "listen",
        // Education content (non-quiz) types
        ...educationTypes,
      ],
      required: true,
      trim: true,
    },

    componentType: {
      type: String,
      enum: [
        "learning_card",
        "moral_story",
        "multiple_choice",
        "listening_challenge",
        "matching_board",
        "arrange_builder",
        "puzzle_board",
        "focus_breathing",
      ],
      default: "multiple_choice",
    },

    moralValue: {
      type: String,
      enum: [
        "patience",
        "gratitude",
        "kindness",
        "honesty",
        "sharing",
        "mercy",
        "justice",
        "respect",
      ],
      default: "kindness",
    },

    valuePoints: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000,
    },

    questionPreview: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    instruction: {
      type: String,
      required: function (this: { type: string }) {
        return !this.type?.startsWith("education_");
      },
      trim: true,
      minlength: 0,
      maxlength: 500,
      default: "",
    },

    sourceText: {
      type: String,
      required: function (this: { type: string }) {
        return !this.type?.startsWith("education_");
      },
      trim: true,
      minlength: 0,
      maxlength: 1000,
      default: "",
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
      default: [],
      validate: function (this: { type: string }, arr: string[]) {
        if (this.type?.startsWith("education_")) {
          // Education screens should not require answers
          return Array.isArray(arr) ? arr.length === 0 || arr.length >= 0 : true;
        }
        return Array.isArray(arr) && arr.length > 0;
      },
    },

    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (this: { type: string }, value: string[]) {
          const nonEmptyOptions = Array.isArray(value)
            ? value.filter((option) => option?.trim().length > 0)
            : [];

          if (optionSupportedTypes.includes(this.type)) {
            return nonEmptyOptions.length > 0;
          }

          return nonEmptyOptions.length === 0;
        },
        message:
          "Options are required for this exercise type and must be empty for others",
      },
    },

    isNewWord: {
      type: Boolean,
      default: false,
    },

    audioUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
      validate: {
        validator: function (this: { type: string }, value: string) {
          if (audioSupportedTypes.includes(this.type)) {
            return typeof value === "string" && value.trim().length > 0;
          }
          return true;
        },
        message: "Audio URL is required for this exercise type",
      },
    },

    // Flexible structure for education content screens
    educationContent: {
      type: (Schema.Types as any).Mixed,
      default: null,
    },

    mediaPack: {
      idleAnimationUrl: { type: String, trim: true, maxlength: 500 },
      successAnimationUrl: { type: String, trim: true, maxlength: 500 },
      failAnimationUrl: { type: String, trim: true, maxlength: 500 },
      characterName: { type: String, trim: true, maxlength: 120 },
    },

    hoverHint: {
      text: { type: String, trim: true, maxlength: 300 },
      audioUrl: { type: String, trim: true, maxlength: 500 },
    },

    answerAudioUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    ttsVoiceId: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    autoRevealMilliseconds: {
      type: Number,
      min: 0,
      default: null,
    },

    neutralAnswerImage: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/128/14853/14853363.png",
      maxlength: 500,
    },

    badAnswerImage: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/128/2461/2461878.png",
      maxlength: 500,
    },

    correctAnswerImage: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/128/10851/10851297.png",
      maxlength: 500,
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
ExerciseSchema.index({ lessonId: 1, isActive: 1, order: 1 });

// 3. Create Types
export type ExerciseType = InferSchemaType<typeof ExerciseSchema>;
export type ExerciseDocument = HydratedDocument<ExerciseType>;

export interface ExerciseModel extends mongoose.Model<ExerciseType> {
  findActiveLanguages(): Promise<ExerciseDocument[]>;
  disableById(id: string): Promise<ExerciseDocument | null>;
}

// 5. Statics
// Note: "findActiveLanguages" is kept to match the existing interface naming.
// It returns active exercises.
// If needed later, consider renaming to a clearer name like findActiveExercises.
// These are runtime statics used by API routes (e.g., DELETE uses disableById).
// Implementations mirror other models (Language, Lesson, Unit, Chapter).
// Keeping behavior consistent: soft-delete by setting isActive to false.
(ExerciseSchema.statics as any).findActiveLanguages = function () {
  return this.find({ isActive: true });
};

(ExerciseSchema.statics as any).disableById = function (id: string) {
  return this.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  ).exec();
};

// 4. Export Model (hot reload safe)
const Exercise =
  (models.Exercise as ExerciseModel) ||
  model<ExerciseType, ExerciseModel>("Exercise", ExerciseSchema);

export default Exercise;
