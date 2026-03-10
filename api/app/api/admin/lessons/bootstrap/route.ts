import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import Language from "@/models/Language";
import Chapter from "@/models/Chapter";
import Unit from "@/models/Unit";
import Lesson from "@/models/Lesson";
import Exercise from "@/models/Exercise";
import {
  buildTrCurriculumBlueprint,
  summarizeTrCurriculumBlueprint,
} from "@/lib/curriculum/tr-curriculum";

type BootstrapRequestBody = {
  locale?: string;
  dryRun?: boolean;
  resetExisting?: boolean;
};

export async function GET() {
  try {
    const guard = await authGuard();
    if (guard instanceof NextResponse) {
      return guard;
    }

    return NextResponse.json(
      {
        status: true,
        data: summarizeTrCurriculumBlueprint(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to get curriculum bootstrap summary:", error);
    return NextResponse.json(
      {
        status: false,
        error: "TR müfredat özeti alınamadı.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await authGuard();
    if (guard instanceof NextResponse) {
      return guard;
    }

    const body = (await req.json().catch(() => ({}))) as BootstrapRequestBody;
    const locale = (body?.locale || "tr").toLowerCase();
    const resetExisting = body?.resetExisting !== false;

    if (locale !== "tr") {
      return NextResponse.json(
        {
          status: false,
          error: "Şimdilik sadece 'tr' müfredatı destekleniyor.",
        },
        { status: 400 }
      );
    }

    if (body?.dryRun) {
      return NextResponse.json(
        {
          status: true,
          dryRun: true,
          data: summarizeTrCurriculumBlueprint(),
        },
        { status: 200 }
      );
    }

    await connectDB();

    const programs = buildTrCurriculumBlueprint();
    const ageGroupEnumPath = Language.schema.path("themeMetadata.ageGroup") as {
      enumValues?: string[];
    };
    const supportedAgeGroups = ageGroupEnumPath?.enumValues ?? [];

    const normalizeAgeGroupForRuntimeSchema = (ageGroup: string) => {
      if (supportedAgeGroups.length === 0 || supportedAgeGroups.includes(ageGroup)) {
        return ageGroup;
      }
      if (ageGroup === "kids_2-6" && supportedAgeGroups.includes("kids_4-7")) {
        return "kids_4-7";
      }
      if (ageGroup === "kids_7-12" && supportedAgeGroups.includes("kids_8-12")) {
        return "kids_8-12";
      }
      if (supportedAgeGroups.includes("all")) {
        return "all";
      }
      return ageGroup;
    };

    const stats = {
      reset: {
        programs: 0,
        chapters: 0,
        units: 0,
        lessons: 0,
        exercises: 0,
      },
      created: {
        programs: 0,
        chapters: 0,
        units: 0,
        lessons: 0,
        exercises: 0,
      },
      updated: {
        programs: 0,
        chapters: 0,
        units: 0,
        lessons: 0,
      },
      refreshed: {
        exerciseSets: 0,
      },
    };

    if (resetExisting) {
      const trLanguages = await Language.find({ baseLanguage: "tr" }).select("_id");
      const trLanguageIds = trLanguages.map((doc) => doc._id.toString());

      if (trLanguageIds.length > 0) {
        const [exerciseReset, lessonReset, unitReset, chapterReset, languageReset] =
          await Promise.all([
            Exercise.deleteMany({ languageId: { $in: trLanguageIds } }),
            Lesson.deleteMany({ languageId: { $in: trLanguageIds } }),
            Unit.deleteMany({ languageId: { $in: trLanguageIds } }),
            Chapter.deleteMany({ languageId: { $in: trLanguageIds } }),
            Language.deleteMany({ _id: { $in: trLanguageIds } }),
          ]);

        stats.reset.programs = languageReset.deletedCount ?? 0;
        stats.reset.chapters = chapterReset.deletedCount ?? 0;
        stats.reset.units = unitReset.deletedCount ?? 0;
        stats.reset.lessons = lessonReset.deletedCount ?? 0;
        stats.reset.exercises = exerciseReset.deletedCount ?? 0;
      }
    }

    for (const program of programs) {
      const existingLanguage = await Language.findOne({
        name: program.language.name,
        baseLanguage: program.language.baseLanguage,
      });

      const normalizedAgeGroup = normalizeAgeGroupForRuntimeSchema(
        program.language.themeMetadata.ageGroup
      );

      const languagePayload = {
        ...program.language,
        themeMetadata: {
          ...program.language.themeMetadata,
          ageGroup: normalizedAgeGroup,
        },
        locale: program.locale,
      };

      // Use update upsert flow to avoid runtime model-cache enum issues on hot reload.
      const languageDoc = await Language.findOneAndUpdate(
        {
          name: program.language.name,
          baseLanguage: program.language.baseLanguage,
        },
        { $set: languagePayload },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: false,
        }
      );

      if (!languageDoc) {
        throw new Error(
          `Language upsert failed for ${program.language.name} (${program.language.baseLanguage})`
        );
      }

      if (existingLanguage) {
        stats.updated.programs += 1;
      } else {
        stats.created.programs += 1;
      }

      const languageId = languageDoc._id.toString();

      for (const chapter of program.chapters) {
        const existingChapter = await Chapter.findOne({
          languageId,
          order: chapter.order,
        });

        let chapterDoc;
        if (existingChapter) {
          Object.assign(existingChapter, {
            title: chapter.title,
            description: chapter.description,
            isPremium: chapter.isPremium,
            isExpanded: chapter.isExpanded,
            imageUrl: chapter.imageUrl,
            isActive: chapter.isActive,
            contentType: chapter.contentType,
            moralLesson: chapter.moralLesson,
            miniGame: chapter.miniGame,
          });
          chapterDoc = await existingChapter.save();
          stats.updated.chapters += 1;
        } else {
          chapterDoc = await Chapter.create({
            languageId,
            title: chapter.title,
            description: chapter.description,
            isPremium: chapter.isPremium,
            isExpanded: chapter.isExpanded,
            imageUrl: chapter.imageUrl,
            order: chapter.order,
            isActive: chapter.isActive,
            contentType: chapter.contentType,
            moralLesson: chapter.moralLesson,
            miniGame: chapter.miniGame,
          });
          stats.created.chapters += 1;
        }

        const chapterId = chapterDoc._id.toString();

        for (const unit of chapter.units) {
          const existingUnit = await Unit.findOne({
            languageId,
            chapterId,
            order: unit.order,
          });

          let unitDoc;
          if (existingUnit) {
            Object.assign(existingUnit, {
              title: unit.title,
              description: unit.description,
              isPremium: unit.isPremium,
              isExpanded: unit.isExpanded,
              imageUrl: unit.imageUrl,
              isActive: unit.isActive,
              color: unit.color,
            });
            unitDoc = await existingUnit.save();
            stats.updated.units += 1;
          } else {
            unitDoc = await Unit.create({
              languageId,
              chapterId,
              title: unit.title,
              description: unit.description,
              isPremium: unit.isPremium,
              isExpanded: unit.isExpanded,
              imageUrl: unit.imageUrl,
              isActive: unit.isActive,
              color: unit.color,
              order: unit.order,
            });
            stats.created.units += 1;
          }

          const unitId = unitDoc._id.toString();

          for (const lesson of unit.lessons) {
            const existingLesson = await Lesson.findOne({
              languageId,
              chapterId,
              unitId,
              order: lesson.order,
            });

            let lessonDoc;
            if (existingLesson) {
          Object.assign(existingLesson, {
            title: lesson.title,
            description: lesson.description,
            isPremium: lesson.isPremium,
            isTest: lesson.isTest,
            isActive: lesson.isActive,
            xpReward: lesson.xpReward,
            valuePointsReward: lesson.valuePointsReward,
            moralValue: lesson.moralValue,
            teachingPhase: lesson.teachingPhase,
            pedagogyFocus: lesson.pedagogyFocus,
            moralStory: lesson.moralStory,
            imageUrl: lesson.imageUrl,
          });
              lessonDoc = await existingLesson.save();
              stats.updated.lessons += 1;
            } else {
              lessonDoc = await Lesson.create({
                languageId,
                chapterId,
                unitId,
                title: lesson.title,
                description: lesson.description,
                isPremium: lesson.isPremium,
                isTest: lesson.isTest,
                isActive: lesson.isActive,
                xpReward: lesson.xpReward,
                valuePointsReward: lesson.valuePointsReward,
                moralValue: lesson.moralValue,
                teachingPhase: lesson.teachingPhase,
                pedagogyFocus: lesson.pedagogyFocus,
                moralStory: lesson.moralStory,
                imageUrl: lesson.imageUrl,
                order: lesson.order,
              });
              stats.created.lessons += 1;
            }

            const lessonId = lessonDoc._id.toString();

            await Exercise.deleteMany({
              languageId,
              chapterId,
              unitId,
              lessonId,
            });

            stats.refreshed.exerciseSets += 1;

            if (lesson.exercises.length > 0) {
              await Exercise.insertMany(
                lesson.exercises.map((exercise) => ({
                  languageId,
                  chapterId,
                  unitId,
                  lessonId,
                  ...exercise,
                  isActive: true,
                }))
              );
            }

            stats.created.exercises += lesson.exercises.length;
          }
        }
      }
    }

    return NextResponse.json(
      {
        status: true,
        message:
          "TR müfredatı başarıyla senkronlandı. Programlar, bölümler, üniteler, dersler ve egzersizler hazır.",
        data: {
          locale: "tr",
          totals: summarizeTrCurriculumBlueprint().counts,
          stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to bootstrap TR curriculum:", error);
    return NextResponse.json(
      {
        status: false,
        error:
          "TR müfredatı kurulumu başarısız oldu. Lütfen logları kontrol edip tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}
