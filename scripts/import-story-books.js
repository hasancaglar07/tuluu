import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_ROOT = path.join(__dirname, "Books");

const REQUIRED_MANIFEST_FIELDS = [
  "bookId",
  "title",
  "displayName",
  "totalPages",
  "primaryLocale",
  "supportedLocales",
  "language",
  "pages",
];

const LanguageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    nativeName: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    flag: { type: String, required: true, trim: true, minlength: 1, maxlength: 10 },
    baseLanguage: { type: String, required: true, trim: true, lowercase: true, minlength: 1, maxlength: 50 },
    imageUrl: { type: String, trim: true, maxlength: 500, default: "" },
    locale: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
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
        "story_library",
      ],
      default: "story_library",
    },
    themeMetadata: {
      islamicContent: { type: Boolean, default: false },
      ageGroup: {
        type: String,
        enum: ["kids_4-7", "kids_8-12", "teens_13-17", "all"],
        default: "kids_4-7",
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

const ChapterSchema = new mongoose.Schema(
  {
    languageId: { type: String, required: true, ref: "Language" },
    title: { type: String, required: true, trim: true, lowercase: true, minlength: 2, maxlength: 100 },
    description: { type: String, required: true, lowercase: true, trim: true, minlength: 5, maxlength: 1000 },
    isPremium: { type: Boolean, default: false },
    isExpanded: { type: Boolean, default: false },
    imageUrl: { type: String, default: "", trim: true, maxlength: 500 },
    order: { type: Number, default: 1, min: 1, max: 20 },
    isActive: { type: Boolean, default: true },
    contentType: {
      type: String,
      enum: ["lesson", "story", "game", "meditation", "quiz", "activity"],
      default: "story",
    },
    moralLesson: {
      value: {
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
      },
      title: { type: String, trim: true, maxlength: 150 },
      storyText: { type: String, trim: true, maxlength: 1500 },
      mediaUrl: { type: String, trim: true, maxlength: 255 },
      displayTiming: {
        type: String,
        enum: ["pre_lesson", "mid_lesson", "post_lesson"],
        default: "post_lesson",
      },
    },
    miniGame: {
      type: {
        type: String,
        enum: ["match", "quiz", "puzzle", "story", "breathing"],
        default: "story",
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
  },
  { timestamps: true }
);

const UnitSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true, ref: "Chapter", trim: true },
    languageId: { type: String, required: true, ref: "Language", trim: true },
    title: { type: String, required: true, trim: true, lowercase: true, minlength: 2, maxlength: 100 },
    description: { type: String, required: true, trim: true, lowercase: true, minlength: 5, maxlength: 1000 },
    isPremium: { type: Boolean, default: false },
    isExpanded: { type: Boolean, default: false },
    imageUrl: { type: String, default: "", trim: true, maxlength: 500 },
    order: { type: Number, default: 1, min: 1 },
    color: { type: String, default: "bg-[#60a5fa]" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LessonSchema = new mongoose.Schema(
  {
    unitId: { type: String, required: true, ref: "Unit", trim: true },
    chapterId: { type: String, required: true, ref: "Chapter", trim: true },
    languageId: { type: String, required: true, ref: "Language", trim: true },
    title: { type: String, required: true, trim: true, lowercase: true, minlength: 2, maxlength: 100 },
    description: { type: String, required: true, trim: true, lowercase: true, minlength: 5, maxlength: 1000 },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    xpReward: { type: Number, default: 10, min: 1 },
    imageUrl: { type: String, trim: true, maxlength: 500, default: "" },
    order: { type: Number, default: 1, min: 1, max: 20 },
    isTest: { type: Boolean, default: false },
    storyPages: {
      type: [
        new mongoose.Schema(
          {
            pageNumber: { type: Number, required: true, min: 1 },
            imageUrl: { type: String, required: true, trim: true, maxlength: 500 },
            audioUrl: { type: String, trim: true, maxlength: 500, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    storyMetadata: {
      bookId: { type: String, trim: true, maxlength: 100 },
      displayName: { type: String, trim: true, maxlength: 150 },
      coverImageUrl: { type: String, trim: true, maxlength: 500 },
      themeColor: { type: String, trim: true, maxlength: 50 },
      ageBadge: { type: String, trim: true, maxlength: 50 },
      hasAudio: { type: Boolean, default: false },
      supportedLocales: { type: [String], default: [] },
      primaryLocale: { type: String, trim: true, maxlength: 10 },
    },
  },
  { timestamps: true }
);

const Language =
  mongoose.models.Language || mongoose.model("Language", LanguageSchema);
const Chapter =
  mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);
const Unit = mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);

function readJsonFile(filePath) {
  return fs.readFile(filePath, "utf-8").then((content) => JSON.parse(content));
}

function validateManifest(manifest, manifestPath) {
  const missing = REQUIRED_MANIFEST_FIELDS.filter(
    (field) => manifest[field] === undefined || manifest[field] === null
  );
  if (missing.length > 0) {
    throw new Error(
      `Manifest ${manifestPath} eksik alan içeriyor: ${missing.join(", ")}`
    );
  }
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    throw new Error(
      `Manifest ${manifestPath} en az bir sayfa içermeli (pages[])`
    );
  }
}

function normaliseDescription(description) {
  if (!description || typeof description !== "string") {
    return "story lesson";
  }
  return description;
}

async function ensureLanguage(manifest, coverImageUrl) {
  const { language, primaryLocale } = manifest;
  const locale = primaryLocale.toLowerCase();

  const payload = {
    name: language.name,
    nativeName: language.nativeName,
    flag: language.flag,
    baseLanguage: language.baseLanguage,
    locale,
    category: language.category || "story_library",
    imageUrl: coverImageUrl || language.imageUrl || "",
    themeMetadata: language.themeMetadata || {
      islamicContent: false,
      ageGroup: "kids_4-7",
      moralValues: [],
      educationalFocus: "",
      difficultyLevel: "beginner",
    },
  };

  const existing = await Language.findOne({
    name: payload.name,
    locale: payload.locale,
  });

  if (existing) {
    await Language.updateOne(
      { _id: existing._id },
      { $set: { ...payload, updatedAt: new Date() } }
    );
    return existing._id.toString();
  }

  const created = await Language.create(payload);
  return created._id.toString();
}

async function ensureChapter(languageId, manifest, coverImageUrl) {
  const title = manifest.title;
  const description = normaliseDescription(manifest.description || title);

  const existing = await Chapter.findOne({ languageId, title });
  const chapterPayload = {
    languageId,
    title,
    description,
    isPremium: manifest.isPremium || false,
    imageUrl: coverImageUrl || "",
    order: manifest.order || 1,
    contentType: "story",
    isActive: true,
  };

  if (existing) {
    await Chapter.updateOne(
      { _id: existing._id },
      { $set: { ...chapterPayload, updatedAt: new Date() } }
    );
    return existing._id.toString();
  }

  const created = await Chapter.create(chapterPayload);
  return created._id.toString();
}

async function ensureUnit(languageId, chapterId, manifest) {
  const unitTitle = `${manifest.title}-unit`;
  const description = normaliseDescription(manifest.description || unitTitle);

  const existing = await Unit.findOne({ chapterId, title: unitTitle });
  const unitPayload = {
    chapterId,
    languageId,
    title: unitTitle,
    description,
    isPremium: manifest.isPremium || false,
    imageUrl: manifest.coverImage || "",
    order: 1,
    color: manifest.themeColor || "bg-[#60a5fa]",
    isActive: true,
  };

  if (existing) {
    await Unit.updateOne(
      { _id: existing._id },
      { $set: { ...unitPayload, updatedAt: new Date() } }
    );
    return existing._id.toString();
  }

  const created = await Unit.create(unitPayload);
  return created._id.toString();
}

function buildStoryPages(manifest) {
  const sorted = [...manifest.pages].sort(
    (a, b) => Number(a.pageNumber) - Number(b.pageNumber)
  );

  return sorted.map((page) => ({
    pageNumber: Number(page.pageNumber),
    imageUrl: page.imageUrl,
    audioUrl: page.audioUrl || "",
  }));
}

async function upsertLesson(languageId, chapterId, unitId, manifest) {
  const storyPages = buildStoryPages(manifest);
  const hasAudio =
    manifest.hasAudio ||
    storyPages.some((page) => page.audioUrl && page.audioUrl.length > 0);

  const storyMetadata = {
    bookId: manifest.bookId,
    displayName: manifest.displayName,
    coverImageUrl: manifest.coverImage || manifest.pages[0]?.imageUrl || "",
    themeColor: manifest.themeColor || "",
    ageBadge: manifest.ageBadge || "",
    hasAudio,
    supportedLocales: manifest.supportedLocales || [manifest.primaryLocale],
    primaryLocale: manifest.primaryLocale,
  };

  const lessonPayload = {
    unitId,
    chapterId,
    languageId,
    title: manifest.title,
    description: normaliseDescription(manifest.description || manifest.title),
    isPremium: manifest.isPremium || false,
    isActive: true,
    xpReward: manifest.xpReward || 10,
    imageUrl: manifest.coverImage || "",
    order: 1,
    storyPages,
    storyMetadata,
  };

  const existing = await Lesson.findOne({
    unitId,
    "storyMetadata.bookId": manifest.bookId,
  });

  if (existing) {
    await Lesson.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...lessonPayload,
          updatedAt: new Date(),
        },
      }
    );
    return existing._id.toString();
  }

  const created = await Lesson.create(lessonPayload);
  return created._id.toString();
}

async function processManifest(manifestPath) {
  const manifest = await readJsonFile(manifestPath);
  validateManifest(manifest, manifestPath);

  const coverImageUrl = manifest.coverImage || "";
  const languageId = await ensureLanguage(manifest, coverImageUrl);
  const chapterId = await ensureChapter(languageId, manifest, coverImageUrl);
  const unitId = await ensureUnit(languageId, chapterId, manifest);
  const lessonId = await upsertLesson(
    languageId,
    chapterId,
    unitId,
    manifest
  );

  return { languageId, chapterId, unitId, lessonId, manifest };
}

async function importStoryBooks() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.NEXT_MONGODB_URI ||
    process.env.MONGODB_URL;

  if (!uri) {
    throw new Error(
      "MongoDB bağlantı bilgisi bulunamadı. Lütfen MONGODB_URI ortam değişkenini ayarlayın."
    );
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  const entries = await fs.readdir(BOOKS_ROOT, { withFileTypes: true });
  const bookDirs = entries.filter((entry) => entry.isDirectory());

  if (bookDirs.length === 0) {
    console.log("📁 Hiç kitap klasörü bulunamadı. İşlem sonlandırıldı.");
    return;
  }

  const results = [];
  for (const dir of bookDirs) {
    const manifestPath = path.join(BOOKS_ROOT, dir.name, "manifest.json");
    try {
      const stats = await processManifest(manifestPath);
      results.push({
        dir: dir.name,
        bookId: stats.manifest.bookId,
        languageId: stats.languageId,
        lessonId: stats.lessonId,
      });
      console.log(
        `✅ ${dir.name} import edildi (bookId: ${stats.manifest.bookId}).`
      );
    } catch (error) {
      console.error(`❌ ${dir.name} import edilirken hata: ${error.message}`);
    }
  }

  console.log("📦 Import tamamlandı. Özet:");
  results.forEach((item) => {
    console.log(
      `  • ${item.dir} → bookId: ${item.bookId}, languageId: ${item.languageId}, lessonId: ${item.lessonId}`
    );
  });
}

importStoryBooks()
  .catch((error) => {
    console.error("🚨 Import sırasında beklenmedik hata:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
