import {
  Schema,
  model,
  models,
  type Model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
import Lesson from "./Lesson";
import Chapter from "./Chapter";
import Unit from "./Unit";
import { Types } from "mongoose";

interface CompletedLesson {
  isCompleted: boolean;
  lessonId?: string | { _id: string };
}

// 1. Subdocument schemas

const CurrentLessonSchema = new Schema(
  {
    lessonId: { type: String, ref: "Lesson", required: false },
    progress: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { _id: false }
);
const CurrentChapterSchema = new Schema(
  {
    chapterId: { type: String, ref: "Chapter", required: false },
    progress: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { _id: false }
);
const CurrentUnitSchema = new Schema(
  {
    unitId: { type: String, ref: "Unit", required: false },
    progress: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { _id: false }
);

const XpBoostSchema = new Schema({
  durationMinutes: { type: Number },
  multiplier: { type: Number },
});

const RewardSchema = new Schema({
  xp: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  gel: { type: Number, default: 0 },
  hearts: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  xpBoost: {
    type: XpBoostSchema,
    default: null,
  },
});

const UserProgressSchema = new Schema(
  {
    userId: { type: String, required: true, ref: "User" },
    languageId: { type: String, required: true, ref: "Language" },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },

    completedChapters: [
      {
        chapterId: { type: String, ref: "Chapter" },
        completedAt: { type: Date, default: Date.now },
        rewards: RewardSchema,
      },
    ],

    completedUnits: [
      {
        unitId: { type: String, ref: "Unit" },
        completedAt: { type: Date, default: Date.now },
        rewards: RewardSchema,
      },
    ],

    completedLessons: [
      {
        lessonId: { type: String, ref: "Lesson" },
        completedAt: { type: Date, default: Date.now },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        rewards: RewardSchema,
        completedExerciseIds: [
          {
            exerciseId: { type: String, required: true },
            completedAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],

    currentStreak: {
      type: Number,
      default: 0,
    },
    lastStreakDate: {
      type: Date,
    },

    streakHistory: [
      {
        date: { type: Date, required: true },
        streakCount: { type: Number, required: true },
      },
    ],

    currentLesson: CurrentLessonSchema,
    currentChapter: CurrentChapterSchema,
    currentUnit: CurrentUnitSchema,

    rewardHistory: [
      {
        lessonId: { type: String, ref: "Lesson" },
        type: {
          type: String,
          enum: ["xp", "gems", "gel", "hearts"],
          required: true,
        },
        amount: { type: Number, required: true },
        reason: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 3. Indexes
UserProgressSchema.index({ userId: 1, languageId: 1 }, { unique: true });

// 4. Static methods

UserProgressSchema.statics.addReward = async function (
  userId: string,
  lessonId: string,
  type: "xp" | "gems" | "gel" | "hearts",
  amount: number,
  reason: string
) {
  if (!lessonId || !Types.ObjectId.isValid(lessonId)) {
    throw new Error("Invalid or missing lessonId");
  }

  const lesson = await Lesson.findById(lessonId).select("languageId");

  if (!lesson || !lesson.languageId) {
    throw new Error("Lesson not found or missing languageId");
  }

  const languageId = new Types.ObjectId(lesson.languageId);
  return this.findOneAndUpdate(
    { userId, languageId },
    {
      $inc: { [`${type}`]: amount },
      $push: {
        rewardHistory: {
          lessonId,
          type,
          amount,
          reason,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
};

UserProgressSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ userId });
};

UserProgressSchema.statics.addCompletedLesson = async function (
  userId: string,
  lessonData: {
    lessonId: string;
    xp: number;
    gems: number;
    gel?: number;
    xpBoost?: { durationMinutes: number; multiplier: number } | null;
  }
) {
  const progress = await this.findOne({ userId });
  const lesson = await Lesson.findById(lessonData.lessonId);
  if (!progress) return null;

  const alreadyCompleted = progress.completedLessons.find(
    (lesson: { lessonId: string; isCompleted: boolean }) =>
      lesson.lessonId?.toString() === lessonData.lessonId?.toString() &&
      lesson.isCompleted === true
  );

  if (alreadyCompleted) {
    return {
      updated: false,
      currentStreak: progress.currentStreak,
      currentUnit: lesson?.unitId,
      currentChapter: lesson?.chapterId,
      lastStreakDate: progress.lastStreakDate,
      streakHistory: progress.streakHistory,
      completedLessons: progress.completedLessons,
      newlyCompleted: false,
    };
  }

  // Remove any existing entries with same lessonId
  progress.completedLessons = progress.completedLessons.filter(
    (lesson: { lessonId: string; isCompleted: boolean }) =>
      lesson.lessonId?.toString() !== lessonData.lessonId?.toString()
  );

  // Push new completed lesson
  progress.completedLessons.push({
    lessonId: lessonData.lessonId,
    completedAt: new Date(),
    isCompleted: true, // ✅ Add this field to match your check
    rewards: {
      xp: lessonData.xp,
      gems: lessonData.gems,
      gel: lessonData.gel ?? 0,
      xpBoost: lessonData.xpBoost ?? null,
    },
  });
  if (!progress.lastStreakDate) {
    progress.currentStreak = 1;
    progress.lastStreakDate = new Date();
    progress.streakHistory.push({
      date: new Date(),
      streakCount: 1,
    });
  } else {
    const today = new Date();
    const lastDate = new Date(progress.lastStreakDate);

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const lastDateStart = new Date(lastDate.setHours(0, 0, 0, 0));

    const diffMs = todayStart.getTime() - lastDateStart.getTime();

    const isSameDay = Math.abs(diffMs) < 1000;
    const isNextDay = Math.abs(diffMs - 86400000) < 1000;

    if (!isSameDay) {
      if (isNextDay) {
        progress.currentStreak += 1;
      } else {
        progress.currentStreak = 1;
      }

      progress.lastStreakDate = new Date();

      progress.streakHistory.push({
        date: new Date(),
        streakCount: progress.currentStreak,
      });
    }
  }

  try {
    await progress.save();
  } catch (err) {
    console.error("Save failed:", err);
  }

  return {
    updated: true,
    currentStreak: progress.currentStreak,
    currentUnit: lesson?.unitId,
    currentChapter: lesson?.chapterId,
    lastStreakDate: progress.lastStreakDate,
    streakHistory: progress.streakHistory,
    completedLessons: progress.completedLessons,
    newlyCompleted: true,
  };
};

UserProgressSchema.statics.addCompletedUnit = async function (
  userId: string,
  unitData: {
    unitId: string;
    xp: number;
    gems: number;
    gel?: number;
    hearts?: number;
    streak?: number;
    xpBoost?: { durationMinutes: number; multiplier: number } | null;
  }
) {
  const progress = await this.findOne({ userId });
  if (!progress) return null;

  progress.completedUnits.push({
    unitId: unitData.unitId,
    completedAt: new Date(),
    rewards: {
      xp: unitData.xp,
      gems: unitData.gems,
      gel: unitData.gel ?? 0,
      streak: unitData.streak ?? 0,
      hearts: unitData.hearts ?? 0,
      xpBoost: unitData.xpBoost ?? null,
    },
  });

  return progress.save();
};

UserProgressSchema.statics.addCompletedChapter = async function (
  userId: string,
  chapterData: {
    chapterId: string;
    xp: number;
    gems: number;
    gel?: number;
    hearts?: number;
    streak?: number;
    xpBoost?: { durationMinutes: number; multiplier: number } | null;
  }
) {
  const progress = await this.findOne({ userId });
  if (!progress) return null;

  progress.completedChapters.push({
    chapterId: chapterData.chapterId,
    completedAt: new Date(),
    rewards: {
      xp: chapterData.xp,
      gems: chapterData.gems,
      gel: chapterData.gel ?? 0,
      streak: chapterData.streak ?? 0,
      hearts: chapterData.hearts ?? 0,
      xpBoost: chapterData.xpBoost ?? null,
    },
  });

  return progress.save();
};

UserProgressSchema.statics.getTotalStats = async function (
  userId: string,
  languageId?: string // optional
) {
  const match: { userId: string; languageId?: string } = {
    userId: userId,
  };
  if (languageId) {
    match.languageId = languageId;
  }

  const result = await this.aggregate([
    { $match: match },
    { $unwind: "$rewardHistory" },
    {
      $group: {
        _id: null,
        totalXp: {
          $sum: {
            $cond: [
              { $eq: ["$rewardHistory.type", "xp"] },
              "$rewardHistory.amount",
              0,
            ],
          },
        },
        totalGems: {
          $sum: {
            $cond: [
              { $eq: ["$rewardHistory.type", "gems"] },
              "$rewardHistory.amount",
              0,
            ],
          },
        },
        totalGel: {
          $sum: {
            $cond: [
              { $eq: ["$rewardHistory.type", "gel"] },
              "$rewardHistory.amount",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalXp: 1,
        totalGems: 1,
        totalGel: 1,
      },
    },
  ]);

  return result[0] || { totalXp: 0, totalGems: 0, totalGel: 0 };
};

UserProgressSchema.statics.getUserCountPerLanguage = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$languageId",
        userCount: { $sum: 1 },
      },
    },
    {
      $addFields: {
        languageObjectId: {
          $convert: {
            input: "$_id",
            to: "objectId",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "languages",
        localField: "languageObjectId",
        foreignField: "_id",
        as: "language",
      },
    },
    { $unwind: "$language" },
    {
      $project: {
        languageId: "$_id",
        name: "$language.name",
        userCount: 1,
        _id: 0,
      },
    },
    { $sort: { userCount: -1 } },
  ]);
};

UserProgressSchema.statics.startLearningLanguage = async function (
  userId: string,
  languageId: string
) {
  // Check if progress already exists
  const existing = await this.findOne({ userId, languageId });
  if (existing) return existing;

  // Step 1: Get Chapter 1
  const chapter = await Chapter.findOne({ languageId }).sort({ order: 1 });
  if (!chapter) throw new Error("No Chapter 1 found for this language");

  // Step 2: Get Unit 1 in Chapter 1
  const unit = await Unit.findOne({ chapterId: chapter._id }).sort({
    order: 1,
  });
  if (!unit) throw new Error("No Unit 1 found in Chapter 1");

  // Step 3: Get Lesson 1 in Unit 1
  const lesson = await Lesson.findOne({ unitId: unit._id }).sort({ order: 1 });
  if (!lesson) throw new Error("No Lesson 1 found in Unit 1");

  // Create new user progress
  return this.create({
    userId,
    languageId,
    currentLesson: {
      lessonId: lesson._id,
      progress: 0,
      lastAccessed: new Date(),
    },
    completedLessons: [],
    completedChapters: [],
    completedUnits: [],
  });
};

UserProgressSchema.statics.markExerciseCompleted = async function (
  userId: string,
  languageId: string,
  lessonId: string,
  exerciseIds: string[]
) {
  const now = new Date();

  // Try to add exerciseIds to an existing lesson
  const updated = await this.findOneAndUpdate(
    {
      userId,
      languageId,
      "completedLessons.lessonId": lessonId,
    },
    {
      $addToSet: {
        "completedLessons.$.completedExerciseIds": {
          $each: exerciseIds.map((id) => ({
            exerciseId: id,
            completedAt: now,
          })),
        },
      },
    },
    { new: true }
  );

  // If lesson not found, push a new one
  if (!updated) {
    await this.findOneAndUpdate(
      { userId, languageId },
      {
        $push: {
          completedLessons: {
            lessonId,
            completedAt: now,
            completedExerciseIds: exerciseIds.map((id) => ({
              exerciseId: id,
              completedAt: now,
            })),
            rewards: {},
          },
        },
      },
      { new: true }
    );
  }

  return { success: true };
};

UserProgressSchema.statics.getCurrentProgressData = async function (
  userId: string,
  languageId: string
) {
  const progress = await this.findOne({ userId, languageId })
    .populate("completedLessons.lessonId")
    .populate("completedUnits.unitId")
    .populate("completedChapters.chapterId");

  let currentLesson = null;
  let currentUnit = null;
  let currentChapter = null;

  currentChapter = await Chapter.findOne({ languageId }).sort({
    order: 1,
  });
  if (currentChapter) {
    currentUnit = await Unit.findOne({ chapterId: currentChapter._id }).sort({
      order: 1,
    });
    if (currentUnit) {
      currentLesson = await Lesson.findOne({
        unitId: currentUnit._id,
        isTest: { $ne: true },
        isActive: true,
      }).sort({ order: 1 });
    }
  }
  if (!progress) {
    // No progress found, get the first chapter, unit, and lesson

    return {
      currentChapter: currentChapter,
      currentUnit: currentUnit,
      unitColor: currentUnit?.color ?? "bg-[#ff2dbd]",
      currentLesson: currentLesson,
      completedLessons: [],
      completedUnits: [],
      completedChapters: [],
      lastCompletedLesson: null,
      error: "No progress found",
      loading: false,
    };
  }

  const completedLessonIds = progress.completedLessons
    .filter((l: CompletedLesson) => {
      if (!l.isCompleted || !l.lessonId) return false;
      if (typeof l.lessonId === "string") {
        return Types.ObjectId.isValid(l.lessonId);
      }
      if (typeof l.lessonId === "object" && l.lessonId._id) {
        return Types.ObjectId.isValid(l.lessonId._id);
      }
      return false;
    })
    .map((l: CompletedLesson) => {
      const id = typeof l.lessonId === "object" ? l.lessonId._id : l.lessonId;
      return new Types.ObjectId(id);
    });

  const lastCompletedLesson =
    progress.completedLessons.length > 0
      ? progress.completedLessons[progress.completedLessons.length - 1].lessonId
      : null;

  const lastCompletedUnitId = lastCompletedLesson?.unitId;

  if (lastCompletedUnitId) {
    const lastLessonInUnit = await Lesson.findOne({
      unitId: lastCompletedUnitId,
      isTest: { $ne: true },
      isActive: true,
    })
      .sort({ order: -1 })
      .lean();

    const lastCompletedLessonId =
      typeof lastCompletedLesson === "object"
        ? lastCompletedLesson._id?.toString()
        : lastCompletedLesson?.toString();

    const isLastLessonInUnit =
      lastLessonInUnit &&
      lastLessonInUnit._id.toString() === lastCompletedLessonId;

    if (isLastLessonInUnit) {
      const currentUnitData = await Unit.findById(lastCompletedUnitId);
      if (currentUnitData) {
        const nextUnit = await Unit.findOne({
          chapterId: currentUnitData.chapterId,
          order: currentUnitData.order + 1,
        });

        if (nextUnit) {
          currentUnit = nextUnit;
          currentChapter = await Chapter.findById(nextUnit.chapterId);

          currentLesson = await Lesson.findOne({
            unitId: nextUnit._id,
            isTest: { $ne: true },
            isActive: true,
          }).sort({ order: 1 });
        }
      }
    } else {
      currentLesson = await Lesson.findOne({
        unitId: lastCompletedUnitId,
        _id: { $nin: completedLessonIds },
        isTest: { $ne: true },
        isActive: true,
      }).sort({ order: 1 });

      if (currentLesson) {
        currentUnit = await Unit.findById(currentLesson.unitId);
        currentChapter = await Chapter.findById(currentUnit?.chapterId);
      }
    }
  }

  return {
    currentChapter: currentChapter,
    currentUnit: currentUnit,
    unitColor: currentUnit?.color ?? "bg-[#ff2dbd]",
    currentLesson,
    completedLessons:
      progress.completedLessons.map((l: { lessonId: string }) => l.lessonId) ??
      [],
    completedUnits:
      progress.completedUnits.map((u: { unitId: string }) => u.unitId) ?? [],
    completedChapters:
      progress.completedChapters.map(
        (c: { chapterId: string }) => c.chapterId
      ) ?? [],
    lastCompletedLesson: lastCompletedLesson ?? null,
    error: null,
    loading: false,
  };
};

UserProgressSchema.statics.isUnitCompleted = async function (
  userId: string,
  unitId: string
) {
  const userProgress = await this.findOne({
    userId,
    "completedUnits.unitId": unitId,
  });
  return !!userProgress; // returns true if unit is found, false otherwise
};

// 5. Types
export type UserProgressType = InferSchemaType<typeof UserProgressSchema>;
export type UserProgressDocument = HydratedDocument<UserProgressType>;

export interface UserProgressModel extends Model<UserProgressType> {
  findByUserId(userId: string): Promise<UserProgressDocument | null>;
  addCompletedLesson(
    userId: string,
    lessonData: {
      lessonId: string;
      xp: number;
      gems: number;
      gel?: number;
      hearts?: number;
      streak?: number;
      xpBoost?: { durationMinutes: number; multiplier: number } | null;
    }
  ): Promise<UserProgressDocument | null>;
  addCompletedUnit(
    userId: string,
    unitData: {
      unitId: string;
      xp: number;
      gems: number;
      gel?: number;
      hearts?: number;
      streak?: number;
      xpBoost?: { durationMinutes: number; multiplier: number } | null;
    }
  ): Promise<UserProgressDocument | null>;
  addCompletedChapter(
    userId: string,
    chapterData: {
      chapterId: string;
      xp: number;
      gems: number;
      gel?: number;
      hearts?: number;
      streak?: number;
      xpBoost?: { durationMinutes: number; multiplier: number } | null;
    }
  ): Promise<UserProgressDocument | null>;
  addCompletedLanguage(
    userId: string,
    languageData: {
      languageId: string;
      xp: number;
      gems: number;
      gel?: number;
      hearts?: number;
      streak?: number;
      xpBoost?: { durationMinutes: number; multiplier: number } | null;
    }
  ): Promise<UserProgressDocument | null>;

  getTotalStats(userId: string): Promise<{
    totalXp: number;
    totalGems: number;
    totalGel: number;
    totalHeart: number;
    totalStreak: number;
  }>;
  getUserCountPerLanguage(): Promise<
    { languageId: string; name: string; userCount: number }[]
  >;
  startLearningLanguage(
    userId: string,
    langaugeId: string
  ): Promise<UserProgressDocument | null>;
  getCurrentProgressData(
    userId: string,
    langaugeId: string
  ): Promise<UserProgressDocument | null>;
  markExerciseCompleted(
    userId: string,
    langaugeId: string,
    lessonId: string,
    exerciseIds: string[]
  ): Promise<UserProgressDocument | null>;
  addReward(
    userId: string,
    lessonId: string,
    type: "xp" | "gems" | "gel" | "hearts",
    amount: number,
    reason: string
  ): Promise<UserProgressDocument | null>;
  isUnitCompleted(userId: string, unitId: string): Promise<boolean>;
}

// 6. Model export
const UserProgress =
  (models.UserProgress as UserProgressModel) ||
  model<UserProgressType, UserProgressModel>(
    "UserProgress",
    UserProgressSchema
  );

export default UserProgress;
