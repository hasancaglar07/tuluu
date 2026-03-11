"use client";

import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  FilePlus,
  FolderPlus,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import type { Chapter, Language, Lesson, Unit } from "@/types/lessons";

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

type SelectedNode =
  | { type: "chapter"; chapterId: string }
  | { type: "unit"; chapterId: string; unitId: string }
  | { type: "lesson"; chapterId: string; unitId: string; lessonId: string };

const getLanguageById = (id: string) => {
  const availableLanguages = [
    { _id: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  ];

  return (
    availableLanguages.find((lang) => lang._id === id) || {
      name: id,
      flag: "🌐",
    }
  );
};

const matchesText = (value: string, query: string) =>
  value.toLowerCase().includes(query);

const lessonMatches = (lesson: Lesson, query: string) =>
  matchesText(lesson.title, query) || matchesText(lesson.description || "", query);

const unitMatches = (unit: Unit, query: string) =>
  matchesText(unit.title, query) ||
  matchesText(unit.description || "", query) ||
  unit.lessons.some((lesson) => lessonMatches(lesson, query));

const chapterMatches = (chapter: Chapter, query: string) =>
  matchesText(chapter.title, query) ||
  matchesText(chapter.description || "", query) ||
  chapter.units.some((unit) => unitMatches(unit, query));

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
  const router = useLocalizedRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const chapters = useMemo(() => currentLanguage?.chapters ?? [], [currentLanguage]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isSearchActive = normalizedSearch.length > 0;

  const filteredChapters = chapters.filter((chapter) =>
    !isSearchActive ? true : chapterMatches(chapter, normalizedSearch)
  );

  const selectedChapter = useMemo(() => {
    if (!selectedNode) return null;
    return chapters.find((chapter) => chapter._id === selectedNode.chapterId) || null;
  }, [chapters, selectedNode]);

  const selectedUnit = useMemo(() => {
    if (!selectedNode || selectedNode.type === "chapter") return null;
    const chapter = chapters.find((item) => item._id === selectedNode.chapterId);
    if (!chapter) return null;
    return chapter.units.find((unit) => unit._id === selectedNode.unitId) || null;
  }, [chapters, selectedNode]);

  const selectedLesson = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "lesson") return null;
    const chapter = chapters.find((item) => item._id === selectedNode.chapterId);
    if (!chapter) return null;
    const unit = chapter.units.find((unit) => unit._id === selectedNode.unitId);
    if (!unit) return null;
    return unit.lessons.find((lesson) => lesson._id === selectedNode.lessonId) || null;
  }, [chapters, selectedNode]);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }

    if (selectedNode.type === "chapter") {
      if (!chapters.some((chapter) => chapter._id === selectedNode.chapterId)) {
        setSelectedNode(null);
      }
      return;
    }

    const chapter = chapters.find((item) => item._id === selectedNode.chapterId);
    if (!chapter) {
      setSelectedNode(null);
      return;
    }

    const unit = chapter.units.find((item) => item._id === selectedNode.unitId);
    if (!unit) {
      setSelectedNode(null);
      return;
    }

    if (selectedNode.type === "lesson") {
      const lessonExists = unit.lessons.some((item) => item._id === selectedNode.lessonId);
      if (!lessonExists) {
        setSelectedNode(null);
      }
    }
  }, [chapters, selectedNode]);

  useEffect(() => {
    if (selectedNode || chapters.length === 0) {
      return;
    }

    setSelectedNode({ type: "chapter", chapterId: chapters[0]._id });
  }, [chapters, selectedNode]);

  if (!currentLanguage) {
    return null;
  }

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

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h2 className="text-xl font-bold leading-tight sm:text-2xl">
              {currentLanguage.flag} {currentLanguage.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <FormattedMessage id="admin.lessons.baseLanguage" defaultMessage="Kaynak Dil:" />{" "}
                {getLanguageById(currentLanguage.baseLanguage).flag}{" "}
                {getLanguageById(currentLanguage.baseLanguage).name}
              </Badge>
              <Badge variant={currentLanguage.isActive ? "default" : "secondary"}>
                {currentLanguage.isActive ? (
                  <FormattedMessage id="admin.lessons.status.active" defaultMessage="Aktif" />
                ) : (
                  <FormattedMessage
                    id="admin.lessons.status.inactive"
                    defaultMessage="Pasif"
                  />
                )}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              size="sm"
              onClick={() => onEditLanguage(currentLanguage)}
            >
              <Edit className="mr-2 h-4 w-4" />
              <FormattedMessage
                id="admin.lessons.editLanguage"
                defaultMessage="Programı Düzenle"
              />
            </Button>
            <Button className="w-full sm:w-auto" size="sm" onClick={onAddChapter}>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage
                id="admin.lessons.addChapter"
                defaultMessage="Bölüm Ekle"
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <CardTitle className="text-base">İçerik Ağacı</CardTitle>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Bölüm, ünite veya ders ara..."
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredChapters.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                Eşleşen içerik bulunamadı.
              </div>
            ) : (
              filteredChapters.map((chapter) => {
                const visibleUnits = chapter.units.filter((unit) =>
                  !isSearchActive ? true : unitMatches(unit, normalizedSearch)
                );

                return (
                  <div key={chapter._id} className="rounded-md border p-2">
                    <div className="flex items-start gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => toggleChapter(chapter._id)}
                      >
                        {chapter.isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      <button
                        type="button"
                        className={`min-w-0 flex-1 rounded px-2 py-1 text-left transition-colors ${
                          selectedNode?.type === "chapter" &&
                          selectedNode.chapterId === chapter._id
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                        onClick={() =>
                          setSelectedNode({ type: "chapter", chapterId: chapter._id })
                        }
                      >
                        <p className="line-clamp-1 text-sm font-medium">{chapter.title}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px]">
                            {chapter.units.length} ünite
                          </Badge>
                          {chapter.isPremium && (
                            <Badge variant="secondary" className="text-[10px]">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </button>

                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Ünite ekle"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddUnit(chapter._id);
                          }}
                        >
                          <FolderPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600"
                          title="Bölümü sil"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChapter(chapter);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {chapter.isExpanded && (
                      <div className="mt-2 space-y-1 pl-8">
                        {visibleUnits.length === 0 ? (
                          <div className="rounded border border-dashed p-2 text-xs text-muted-foreground">
                            Bu bölümde eşleşen ünite yok.
                          </div>
                        ) : (
                          visibleUnits.map((unit) => {
                            const visibleLessons = unit.lessons.filter((lesson) =>
                              !isSearchActive
                                ? true
                                : lessonMatches(lesson, normalizedSearch)
                            );

                            return (
                              <div key={unit._id} className="rounded-md border p-2">
                                <div className="flex items-start gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => toggleUnit(chapter._id, unit._id)}
                                  >
                                    {unit.isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>

                                  <button
                                    type="button"
                                    className={`min-w-0 flex-1 rounded px-2 py-1 text-left transition-colors ${
                                      selectedNode?.type === "unit" &&
                                      selectedNode.chapterId === chapter._id &&
                                      selectedNode.unitId === unit._id
                                        ? "bg-primary/10"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() =>
                                      setSelectedNode({
                                        type: "unit",
                                        chapterId: chapter._id,
                                        unitId: unit._id,
                                      })
                                    }
                                  >
                                    <p className="line-clamp-1 text-sm font-medium">{unit.title}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      <Badge variant="outline" className="text-[10px]">
                                        {unit.lessons.length} ders
                                      </Badge>
                                      {!unit.isActive && (
                                        <Badge variant="secondary" className="text-[10px]">
                                          Pasif
                                        </Badge>
                                      )}
                                    </div>
                                  </button>

                                  <div className="flex shrink-0 gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      title="Ders ekle"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAddLesson(chapter._id, unit._id);
                                      }}
                                    >
                                      <FilePlus className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-red-600"
                                      title="Üniteyi sil"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteUnit(unit, chapter);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {unit.isExpanded && (
                                  <div className="mt-2 space-y-1 pl-7">
                                    {visibleLessons.length === 0 ? (
                                      <div className="rounded border border-dashed p-2 text-xs text-muted-foreground">
                                        Bu ünitede eşleşen ders yok.
                                      </div>
                                    ) : (
                                      visibleLessons.map((lesson) => (
                                        <div
                                          key={lesson._id}
                                          className={`flex items-center gap-2 rounded px-2 py-1.5 ${
                                            selectedNode?.type === "lesson" &&
                                            selectedNode.chapterId === chapter._id &&
                                            selectedNode.unitId === unit._id &&
                                            selectedNode.lessonId === lesson._id
                                              ? "bg-primary/10"
                                              : "hover:bg-muted"
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            className="min-w-0 flex-1 text-left"
                                            onClick={() =>
                                              setSelectedNode({
                                                type: "lesson",
                                                chapterId: chapter._id,
                                                unitId: unit._id,
                                                lessonId: lesson._id,
                                              })
                                            }
                                          >
                                            <p className="line-clamp-1 text-sm font-medium">
                                              {lesson.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {lesson.exercises?.length ?? 0} egzersiz • {lesson.xpReward} XP
                                            </p>
                                          </button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            title="Egzersiz yönet"
                                            onClick={() => router.push(`/admin/lessons/${lesson._id}`)}
                                          >
                                            <Layers className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Hızlı Düzenleme Paneli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedNode && (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                Soldaki ağaçtan bir bölüm, ünite veya ders seç.
              </div>
            )}

            {selectedNode?.type === "chapter" && selectedChapter && (
              <>
                <h3 className="text-base font-semibold">{selectedChapter.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedChapter.description || "-"}</p>
                <div className="grid gap-2 rounded-md border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ünite</span>
                    <span>{selectedChapter.units.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sıra</span>
                    <span>{selectedChapter.order}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium</span>
                    <span>{selectedChapter.isPremium ? "Evet" : "Hayır"}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button variant="outline" onClick={() => onEditChapter(selectedChapter)}>
                    <Edit className="mr-2 h-4 w-4" /> Bölümü Düzenle
                  </Button>
                  <Button variant="outline" onClick={() => onAddUnit(selectedChapter._id)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> Ünite Ekle
                  </Button>
                  <Button variant="destructive" onClick={() => onDeleteChapter(selectedChapter)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Bölümü Sil
                  </Button>
                </div>
              </>
            )}

            {selectedNode?.type === "unit" && selectedChapter && selectedUnit && (
              <>
                <h3 className="text-base font-semibold">{selectedUnit.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedUnit.description || "-"}</p>
                <div className="grid gap-2 rounded-md border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bölüm</span>
                    <span className="line-clamp-1 max-w-[60%] text-right">{selectedChapter.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ders</span>
                    <span>{selectedUnit.lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durum</span>
                    <span>{selectedUnit.isActive ? "Aktif" : "Pasif"}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button variant="outline" onClick={() => onEditUnit(selectedUnit, selectedChapter._id)}>
                    <Edit className="mr-2 h-4 w-4" /> Üniteyi Düzenle
                  </Button>
                  <Button variant="outline" onClick={() => onAddLesson(selectedChapter._id, selectedUnit._id)}>
                    <FilePlus className="mr-2 h-4 w-4" /> Ders Ekle
                  </Button>
                  <Button variant="destructive" onClick={() => onDeleteUnit(selectedUnit, selectedChapter)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Üniteyi Sil
                  </Button>
                </div>
              </>
            )}

            {selectedNode?.type === "lesson" && selectedChapter && selectedUnit && selectedLesson && (
              <>
                <h3 className="text-base font-semibold">{selectedLesson.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedLesson.description || "-"}</p>
                <div className="grid gap-2 rounded-md border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bölüm</span>
                    <span className="line-clamp-1 max-w-[60%] text-right">{selectedChapter.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ünite</span>
                    <span className="line-clamp-1 max-w-[60%] text-right">{selectedUnit.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP</span>
                    <span>{selectedLesson.xpReward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Egzersiz</span>
                    <span>{selectedLesson.exercises?.length ?? 0}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      onEditLesson(selectedLesson, selectedChapter._id, selectedUnit._id)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" /> Dersi Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      onAddExercise(
                        selectedChapter._id,
                        selectedUnit._id,
                        selectedLesson._id
                      )
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Egzersiz Ekle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/lessons/${selectedLesson._id}`)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" /> Egzersizleri Yönet
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      onDeleteLesson(
                        selectedChapter._id,
                        selectedUnit._id,
                        selectedLesson._id
                      )
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Dersi Sil
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
