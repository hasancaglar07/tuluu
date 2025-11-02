"use client";

import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus } from "lucide-react";
import { ChapterCard } from "./chapter-card";
import type { Language, Chapter, Unit, Lesson } from "@/types/lessons";

interface SkillTreeViewProps {
  currentLanguage?: Language;
  data: { languages: Language[] };
  setData: (data: { languages: Language[] }) => void;
  selectedLanguage?: string;
  onEditLanguage: (language: Language) => void;
  onAddChapter: () => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
  onAddUnit: (chapterId: string) => void;
  onEditUnit: (unit: Unit, chapterId: string) => void;
  onDeleteUnit: (unit: Unit, chapter: Chapter) => void;
  onAddLesson: (chapterId: string, unitId: string) => void;
  onEditLesson: (lesson: Lesson, chapterId: string, unitId: string) => void;
  onDeleteLesson: (chapterId: string, unitId: string, lessonId: string) => void;
  onAddExercise: (chapterId: string, unitId: string, lessonId: string) => void;
}

/**
 * Skill Tree View Component
 *
 * Displays the hierarchical structure of the selected language including:
 * - Language header with edit controls
 * - Expandable chapters containing units
 * - Expandable units containing lessons
 * - Lesson items with exercise management
 *
 * This component handles the tree expansion/collapse state and provides
 * action buttons for CRUD operations on each level.
 */
export function SkillTreeView({
  currentLanguage,
  data,
  setData,
  selectedLanguage,
  onEditLanguage,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddExercise,
}: SkillTreeViewProps) {
  // Helper function to get language details by ID
  const getLanguageById = (id: string) => {
    const availableLanguages = [
      { _id: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
      { _id: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
      { _id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
      { _id: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
      { _id: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
      { _id: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
      { _id: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
      { _id: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
      { _id: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
      { _id: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
      { _id: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
    ];

    return (
      availableLanguages.find((lang) => lang._id === id) || {
        name: id,
        flag: "🌐",
      }
    );
  };

  /**
   * Toggles the expansion state of a chapter
   * @param chapterId - ID of the chapter to toggle
   */
  const toggleChapter = (chapterId: string) => {
    setData({
      ...data,
      languages: data.languages.map((lang) =>
        lang._id === selectedLanguage
          ? {
              ...lang,
              chapters: lang.chapters.map((chapter) =>
                chapter._id === chapterId
                  ? { ...chapter, isExpanded: !chapter.isExpanded }
                  : chapter
              ),
            }
          : lang
      ),
    });
  };

  /**
   * Toggles the expansion state of a unit within a chapter
   * @param chapterId - ID of the parent chapter
   * @param unitId - ID of the unit to toggle
   */
  const toggleUnit = (chapterId: string, unitId: string) => {
    setData({
      ...data,
      languages: data.languages.map((lang) =>
        lang._id === selectedLanguage
          ? {
              ...lang,
              chapters: lang.chapters.map((chapter) =>
                chapter._id === chapterId
                  ? {
                      ...chapter,
                      units: chapter.units.map((unit) =>
                        unit._id === unitId
                          ? { ...unit, isExpanded: !unit.isExpanded }
                          : unit
                      ),
                    }
                  : chapter
              ),
            }
          : lang
      ),
    });
  };

  if (!currentLanguage) {
    return null;
  }

  return (
    <>
      {/* Language Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {currentLanguage.flag} {currentLanguage.name}
          </h2>
          <Badge variant="outline">
            <FormattedMessage
              id="admin.lessons.baseLanguage"
              defaultMessage="Base:"
            />{" "}
            {getLanguageById(currentLanguage.baseLanguage).flag}{" "}
            {getLanguageById(currentLanguage.baseLanguage).name}
          </Badge>
          {currentLanguage.isActive ? (
            <Badge variant="default">
              <FormattedMessage
                id="admin.lessons.status.active"
                defaultMessage="Active"
              />
            </Badge>
          ) : (
            <Badge variant="secondary">
              <FormattedMessage
                id="admin.lessons.status.inactive"
                defaultMessage="Inactive"
              />
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditLanguage(currentLanguage)}
          >
            <Edit className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.lessons.editLanguage"
              defaultMessage="Edit Language"
            />
          </Button>
          <Button size="sm" onClick={onAddChapter}>
            <Plus className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.lessons.addChapter"
              defaultMessage="Add Chapter"
            />
          </Button>
        </div>
      </div>

      {/* Chapters List */}
      {currentLanguage.chapters.length === 0 ? (
        <div className="text-center p-12 border rounded-md">
          <div className="inline-flex h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-4">
            <Plus className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium">
            <FormattedMessage
              id="admin.lessons.noChapters.title"
              defaultMessage="No chapters yet"
            />
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            <FormattedMessage
              id="admin.lessons.noChapters.subtitle"
              defaultMessage="Get started by creating your first chapter for {languageName}."
              values={{ languageName: currentLanguage.name }}
            />
          </p>
          <Button onClick={onAddChapter}>
            <Plus className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.lessons.addChapter"
              defaultMessage="Add Chapter"
            />
          </Button>
        </div>
      ) : (
        currentLanguage.chapters.map((chapter) => (
          <ChapterCard
            key={chapter._id}
            chapter={chapter}
            onToggle={() => toggleChapter(chapter._id)}
            onEdit={() => onEditChapter(chapter)}
            onDelete={() => onDeleteChapter(chapter)}
            onAddUnit={() => onAddUnit(chapter._id)}
            onEditUnit={(unit) => onEditUnit(unit, chapter._id)}
            onDeleteUnit={(unit) => onDeleteUnit(unit, chapter)}
            onAddLesson={(unitId) => onAddLesson(chapter._id, unitId)}
            onEditLesson={(lesson, unitId) =>
              onEditLesson(lesson, chapter._id, unitId)
            }
            onDeleteLesson={(unitId, lessonId) =>
              onDeleteLesson(chapter._id, unitId, lessonId)
            }
            onAddExercise={(unitId, lessonId) =>
              onAddExercise(chapter._id, unitId, lessonId)
            }
            onToggleUnit={(unitId) => toggleUnit(chapter._id, unitId)}
          />
        ))
      )}
    </>
  );
}
