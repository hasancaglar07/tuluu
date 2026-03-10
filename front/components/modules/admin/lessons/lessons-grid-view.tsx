"use client";

import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, Layers, Trash2 } from "lucide-react";
import type { Language, Lesson } from "@/types/lessons";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LessonTableRow extends Lesson {
  chapterTitle: string;
  chapterId: string;
  unitTitle: string;
  unitId: string;
}

interface LessonsGridViewProps {
  currentLanguage?: Language;
  onAddLesson: () => void;
  onEditLesson?: (lesson: LessonTableRow, chapterId: string, unitId: string) => void;
  onDeleteLesson?: (
    chapterId: string,
    unitId: string,
    lessonId: string
  ) => void;
}

/**
 * Lessons Grid View Component
 *
 * Displays all lessons across all units and chapters in a management table.
 * Includes search, filters and bulk deletion for faster admin workflows.
 */
export function LessonsGridView({
  currentLanguage,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: LessonsGridViewProps) {
  const router = useLocalizedRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "regular" | "test">("all");
  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);

  // Flatten all lessons from all units and chapters
  const allLessons = useMemo<LessonTableRow[]>(
    () =>
      currentLanguage?.chapters.flatMap((chapter) =>
        chapter.units.flatMap((unit) =>
          unit.lessons.map((lesson) => ({
            ...lesson,
            chapterTitle: chapter.title,
            chapterId: chapter._id,
            unitTitle: unit.title,
            unitId: unit._id,
          }))
        )
      ) || [],
    [currentLanguage]
  );

  const chapterOptions = useMemo(
    () =>
      Array.from(
        new Map(allLessons.map((lesson) => [lesson.chapterId, lesson.chapterTitle])).entries()
      ).map(([id, title]) => ({ id, title })),
    [allLessons]
  );

  const filteredLessons = useMemo(
    () =>
      allLessons.filter((lesson) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          term.length === 0 ||
          lesson.title.toLowerCase().includes(term) ||
          lesson.description.toLowerCase().includes(term) ||
          lesson.chapterTitle.toLowerCase().includes(term) ||
          lesson.unitTitle.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? lesson.isActive : !lesson.isActive);
        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "test" ? lesson.isTest : !lesson.isTest);
        const matchesChapter =
          chapterFilter === "all" || lesson.chapterId === chapterFilter;
        return matchesSearch && matchesStatus && matchesType && matchesChapter;
      }),
    [allLessons, chapterFilter, searchTerm, statusFilter, typeFilter]
  );

  const visibleIds = useMemo(
    () => new Set(filteredLessons.map((lesson) => lesson._id)),
    [filteredLessons]
  );

  const selectedVisibleCount = useMemo(
    () => selectedLessonIds.filter((id) => visibleIds.has(id)).length,
    [selectedLessonIds, visibleIds]
  );

  const allVisibleSelected =
    filteredLessons.length > 0 &&
    filteredLessons.every((lesson) => selectedLessonIds.includes(lesson._id));
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    setSelectedLessonIds((prev) =>
      prev.filter((id) => allLessons.some((lesson) => lesson._id === id))
    );
  }, [allLessons]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setChapterFilter("all");
  };

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    chapterFilter !== "all";

  const toggleSelectAllVisible = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedLessonIds((prev) =>
        Array.from(new Set([...prev, ...filteredLessons.map((lesson) => lesson._id)]))
      );
      return;
    }
    setSelectedLessonIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  const toggleSelectLesson = (id: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedLessonIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return;
    }
    setSelectedLessonIds((prev) => prev.filter((lessonId) => lessonId !== id));
  };

  const deleteSelectedLessons = () => {
    if (!onDeleteLesson || selectedLessonIds.length === 0) {
      return;
    }

    const selectedLessons = allLessons.filter((lesson) =>
      selectedLessonIds.includes(lesson._id)
    );

    if (selectedLessons.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `${selectedLessons.length} dersi silmek istediğinize emin misiniz?`
    );
    if (!confirmed) {
      return;
    }

    selectedLessons.forEach((lesson) => {
      onDeleteLesson(lesson.chapterId, lesson.unitId, lesson._id);
    });
    setSelectedLessonIds([]);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">
            <FormattedMessage
              id="admin.lessons.tabs.lessons"
              defaultMessage="Lessons"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.lessons.lessonsGridDescription"
              defaultMessage="Manage all lessons across units and chapters for {languageName}"
              values={{
                languageName: currentLanguage?.name || "selected language",
              }}
            />
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onAddLesson}>
          <BookOpen className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addLesson"
            defaultMessage="Add Lesson"
          />
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/20 p-3 sm:p-4">
        <div className="grid gap-2 xl:grid-cols-[1fr,170px,170px,220px,auto]">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ders, bölüm veya ünite ara..."
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "all" | "regular" | "test")
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Tüm Tipler</option>
            <option value="regular">Normal</option>
            <option value="test">Test</option>
          </select>
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Tüm Bölümler</option>
            {chapterOptions.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="w-full xl:w-auto"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Temizle
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredLessons.length} ders listeleniyor
            {selectedLessonIds.length > 0 ? ` • ${selectedLessonIds.length} seçili` : ""}
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            disabled={selectedLessonIds.length === 0 || !onDeleteLesson}
            onClick={deleteSelectedLessons}
          >
            Seçilileri Sil
          </Button>
        </div>
      </div>

      {allLessons.length === 0 ? (
        <div className="text-center p-12 border rounded-md">
          <div className="inline-flex h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium">
            <FormattedMessage
              id="admin.lessons.noLessons.title"
              defaultMessage="No lessons yet"
            />
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            <FormattedMessage
              id="admin.lessons.noLessons.subtitle"
              defaultMessage="Create chapters and units first, then add lessons to teach your content."
            />
          </p>
          <Button onClick={onAddLesson}>
            <BookOpen className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.lessons.addLesson"
              defaultMessage="Add Lesson"
            />
          </Button>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aramanıza uyan ders bulunamadı.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                    onCheckedChange={toggleSelectAllVisible}
                    aria-label="Tüm görünen dersleri seç"
                  />
                </TableHead>
                <TableHead>Ders</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Değer</TableHead>
                <TableHead>Değer Puanı</TableHead>
                <TableHead>Aşama</TableHead>
                <TableHead>Egzersiz</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => (
                <TableRow key={`${lesson.chapterId}-${lesson.unitId}-${lesson._id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLessonIds.includes(lesson._id)}
                      onCheckedChange={(checked) =>
                        toggleSelectLesson(lesson._id, checked)
                      }
                      aria-label={`${lesson.title} dersini seç`}
                    />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="min-w-[220px]">
                      <p className="line-clamp-1 font-medium">{lesson.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {lesson.description || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="min-w-[180px] text-xs text-muted-foreground">
                      <p className="line-clamp-1">{lesson.chapterTitle}</p>
                      <p className="line-clamp-1">{lesson.unitTitle}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lesson.isTest ? "secondary" : "outline"}>
                      {lesson.isTest ? "Test" : "Normal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lesson.isActive ? "default" : "secondary"}>
                      {lesson.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{lesson.xpReward}</TableCell>
                  <TableCell>{lesson.moralValue || "-"}</TableCell>
                  <TableCell>{lesson.valuePointsReward ?? 0}</TableCell>
                  <TableCell>{lesson.teachingPhase || "-"}</TableCell>
                  <TableCell>{lesson.exercises?.length ?? 0}</TableCell>
                  <TableCell>{lesson.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Egzersizleri yönet"
                        onClick={() => router.push(`/admin/lessons/${lesson._id}`)}
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Düzenle"
                        onClick={() =>
                          onEditLesson?.(lesson, lesson.chapterId, lesson.unitId)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        title="Sil"
                        onClick={() =>
                          onDeleteLesson?.(lesson.chapterId, lesson.unitId, lesson._id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
