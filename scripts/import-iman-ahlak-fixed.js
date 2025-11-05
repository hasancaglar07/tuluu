import mongoose from 'mongoose';

// MongoDB Connection URI
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// ============================================
// MODEL DEFINITIONS (matching api/models)
// ============================================

const LanguageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nativeName: { type: String, required: true, trim: true },
  flag: { type: String, required: true, trim: true },
  baseLanguage: { type: String, required: true, trim: true, lowercase: true },
  imageUrl: { type: String, default: "" },
  locale: { type: String, default: "tr" },
  isActive: { type: Boolean, default: true },
  category: {
    type: String,
    enum: ["faith_morality", "quran_arabic", "math_logic", "science_discovery", "language_learning", "mental_spiritual", "personal_social"],
    default: "faith_morality"
  },
  themeMetadata: {
    islamicContent: { type: Boolean, default: false },
    ageGroup: { type: String, enum: ["kids_4-7", "kids_8-12", "teens_13-17", "all"], default: "kids_8-12" },
    moralValues: { type: [String], default: [] },
    educationalFocus: { type: String, trim: true },
    difficultyLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" }
  }
}, { timestamps: true });

const ChapterSchema = new mongoose.Schema({
  languageId: { type: String, required: true, ref: "Language" },
  title: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: true, lowercase: true, trim: true },
  isPremium: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  contentType: { type: String, enum: ["lesson", "story", "game", "meditation", "quiz", "activity"], default: "lesson" },
  moralLesson: {
    value: { type: String, enum: ["patience", "gratitude", "kindness", "honesty", "sharing", "mercy", "justice", "respect"], default: "kindness" },
    title: { type: String, trim: true },
    storyText: { type: String, trim: true },
    mediaUrl: { type: String, trim: true },
    displayTiming: { type: String, enum: ["pre_lesson", "mid_lesson", "post_lesson"], default: "post_lesson" }
  },
  miniGame: {
    type: { type: String, enum: ["match", "quiz", "puzzle", "story", "breathing"], default: "quiz" },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
}, { timestamps: true });

const UnitSchema = new mongoose.Schema({
  chapterId: { type: String, required: true, ref: "Chapter", trim: true },
  languageId: { type: String, required: true, ref: "Language", trim: true },
  title: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: true, trim: true, lowercase: true },
  isPremium: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 1 },
  color: { type: String, default: "bg-[#ff2dbd]" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  unitId: { type: String, required: true, ref: "Unit", trim: true },
  chapterId: { type: String, required: true, ref: "Chapter", trim: true },
  languageId: { type: String, required: true, ref: "Language", trim: true },
  title: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: true, trim: true, lowercase: true },
  isPremium: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  xpReward: { type: Number, default: 10, min: 1 },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isTest: { type: Boolean, default: false }
}, { timestamps: true });

const ExerciseSchema = new mongoose.Schema({
  lessonId: { type: String, required: true, ref: "Lesson" },
  unitId: { type: String, required: true, ref: "Unit" },
  chapterId: { type: String, required: true, ref: "Chapter" },
  languageId: { type: String, required: true, ref: "Language" },
  type: { type: String, enum: ["translate", "select", "arrange", "match", "listen", "speak"], required: true, trim: true },
  instruction: { type: String, required: true, trim: true, lowercase: true },
  sourceText: { type: String, required: true, trim: true, lowercase: true },
  sourceLanguage: { type: String, required: true, trim: true, lowercase: true },
  targetLanguage: { type: String, required: true, trim: true, lowercase: true },
  correctAnswer: { type: [String], required: true },
  options: { type: [String], default: [] },
  isNewWord: { type: Boolean, default: false },
  audioUrl: { type: String, trim: true, default: "" },
  neutralAnswerImage: { type: String, default: "https://cdn-icons-png.flaticon.com/128/14853/14853363.png" },
  badAnswerImage: { type: String, default: "https://cdn-icons-png.flaticon.com/128/2461/2461878.png" },
  correctAnswerImage: { type: String, default: "https://cdn-icons-png.flaticon.com/128/10851/10851297.png" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Models
const Language = mongoose.models.Language || mongoose.model('Language', LanguageSchema);
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
const Unit = mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);

console.log('✅ Script loaded successfully!');
console.log('📝 Note: Word database needs to be completed for all 124 lessons');
console.log('📝 Current status: Bölüm 1-3 completed, Bölüm 4-5 partial, Bölüm 6-10 pending');
console.log('📝 To run import: node scripts/import-iman-ahlak-fixed.js');