import { z } from "zod";

// Utility for MongoDB ObjectId validation (24-char hex string)
// const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const optionSupportedTypes = ["translate", "select", "arrange", "match"];
const audioSupportedTypes = ["listen"];
const educationTypes = [
  "education_image_intro",
  "education_visual",
  "education_video",
  "education_audio",
  "education_tip",
];

const mediaPackSchema = z
  .object({
    idleAnimationUrl: z.string().url().optional().or(z.literal("")),
    successAnimationUrl: z.string().url().optional().or(z.literal("")),
    failAnimationUrl: z.string().url().optional().or(z.literal("")),
    characterName: z.string().min(1).max(120).optional(),
  })
  .optional();

const hoverHintSchema = z
  .object({
    text: z.string().min(1).max(300),
    audioUrl: z.string().url().optional().or(z.literal("")),
  })
  .optional();

// Education content schemas
const imageCardSchema = z.object({
  imageUrl: z.string().url().min(1),
  text: z.string().min(1),
  audioUrl: z.string().url().optional().or(z.literal("")),
  isCorrect: z.boolean().optional(),
});

const educationImageIntroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cards: z.array(imageCardSchema).min(1).max(6),
  showContinueButton: z.boolean().default(true).optional(),
  autoAdvanceSeconds: z.number().int().positive().optional().nullable(),
});

const educationVisualSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url().min(1),
  description: z.string().min(1),
  narrationAudioUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  gallery: z.array(z.string().url().min(1)).max(4).optional(),
});

const educationVideoSchema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().url().min(1),
  coverImageUrl: z.string().url().optional(),
  captions: z.string().optional(),
  autoplay: z.boolean().default(false).optional(),
});

const educationAudioSchema = z.object({
  title: z.string().min(1),
  instructionText: z.string().min(1),
  audioUrl: z.string().url().min(1),
  contentText: z.string().min(1),
  repeatCount: z.number().int().min(1).max(10).default(1),
});

const educationTipSchema = z.object({
  tipType: z.enum(["important", "note", "culture", "pronunciation", "reminder"]).default("note"),
  icon: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  sampleAudioUrl: z.string().url().optional().or(z.literal("")),
  backgroundColor: z.string().optional(),
});

export const exerciseSchema = z
  .object({
    lessonId: z.string().min(1, "Lesson ID is required"),
    unitId: z.string().min(1, "Unit ID is required"),
    chapterId: z.string().min(1, "Chapter ID is required"),
    languageId: z.string().min(1, "Language ID is required"),

    type: z.enum([
      "translate",
      "select",
      "arrange",
      "match",
      "listen",
      ...educationTypes,
    ]),

    componentType: z
      .enum([
        "learning_card",
        "moral_story",
        "multiple_choice",
        "listening_challenge",
        "matching_board",
        "arrange_builder",
        "puzzle_board",
        "focus_breathing",
      ])
      .default("multiple_choice"),

    moralValue: z
      .enum([
        "patience",
        "gratitude",
        "kindness",
        "honesty",
        "sharing",
        "mercy",
        "justice",
        "respect",
      ])
      .default("kindness"),

    valuePoints: z.number().int().min(0).max(1000).default(0),

    questionPreview: z.string().max(500).optional().default(""),

    instruction: z
      .string()
      .trim()
      .min(0)
      .max(500)
      .default(""),

    sourceText: z
      .string()
      .trim()
      .min(0)
      .max(1000)
      .default(""),

    sourceLanguage: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .transform((val) => val.toLowerCase()),

    targetLanguage: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .transform((val) => val.toLowerCase()),

    correctAnswer: z
      .array(z.string())
      .max(20, "No more than 20 correct answers allowed")
      .default([]),

    options: z.array(z.string()).max(20, "No more than 20 options allowed").default([]),

    isNewWord: z.boolean().default(false),

    audioUrl: z
      .preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().trim().max(500, "Audio URL is too long").optional()
      )
      .optional(),

    neutralAnswerImage: z
      .string()
      .trim()
      .max(500, "Image URL is too long")
      .default("https://cdn-icons-png.flaticon.com/128/14853/14853363.png"),

    badAnswerImage: z
      .string()
      .trim()
      .max(500, "Image URL is too long")
      .default("https://cdn-icons-png.flaticon.com/128/2461/2461878.png"),

    correctAnswerImage: z
      .string()
      .trim()
      .max(500, "Image URL is too long")
      .default("https://cdn-icons-png.flaticon.com/128/10851/10851297.png"),

    order: z.number().default(0),
    isActive: z.boolean().optional().default(true),

    // Flexible education content bucket
    educationContent: z
      .union([
        educationImageIntroSchema,
        educationVisualSchema,
        educationVideoSchema,
        educationAudioSchema,
        educationTipSchema,
      ])
      .optional()
      .nullable(),

    mediaPack: mediaPackSchema,
    hoverHint: hoverHintSchema,
    answerAudioUrl: z
      .string()
      .url()
      .max(500, "Answer audio URL is too long")
      .optional()
      .or(z.literal("")),
    ttsVoiceId: z.string().max(100).optional(),
    autoRevealMilliseconds: z.number().int().min(0).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const nonEmptyOptions = data.options.filter(
      (option) => option.trim().length > 0
    );

    if (educationTypes.includes(data.type)) {
      // For education types, instruction/source/correctAnswer should not be enforced
      if (!data.educationContent) {
        ctx.addIssue({
          code: "custom",
          path: ["educationContent"],
          message: "Bu tür için eğitim içeriği gerekli",
        });
      }
      return;
    }

    if (optionSupportedTypes.includes(data.type)) {
      if (nonEmptyOptions.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "Bu egzersiz türü için en az bir seçenek eklemelisiniz",
        });
      }
    } else if (nonEmptyOptions.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Bu egzersiz türü seçenekleri desteklemiyor",
      });
    }

    if (audioSupportedTypes.includes(data.type)) {
      if (!data.audioUrl || data.audioUrl.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["audioUrl"],
          message: "Bu egzersiz türü için ses dosyası zorunludur",
        });
      }
    }

    // For non-education types enforce basic requireds
    if (!educationTypes.includes(data.type)) {
      if (!data.instruction?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["instruction"],
          message: "Yönerge alanı boş bırakılamaz",
        });
      }
      if (!data.sourceText?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceText"],
          message: "Kaynak alanı boş bırakılamaz",
        });
      }
      if (data.correctAnswer.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "En az bir doğru cevap eklemelisiniz",
        });
      }
    }
  });
export type ExerciseInput = z.infer<typeof exerciseSchema>;
