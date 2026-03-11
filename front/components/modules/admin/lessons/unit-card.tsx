"use client";

import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  FilePlus,
  MoreHorizontal,
  Plus,
  Trash2,
  BookOpen,
  ListChecks,
  Layers,
} from "lucide-react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import type { Unit, Lesson } from "@/types/lessons";
import { Badge } from "@/components/ui/badge";

interface UnitCardProps {
  unit: Unit;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onAddExercise: (lessonId: string) => void;
}

/**
 * Unit Card Component
 *
 * Displays a unit with its metadata and contains all lessons within the unit.
 * Features:
 * - Expandable/collapsible view
 * - Edit and delete actions
 * - Add lesson functionality
 * - Premium badge display
 * - Lesson management with exercise controls
 */
export function UnitCard({
  unit,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddExercise,
}: UnitCardProps) {
  const router = useLocalizedRouter();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          {/* Unit Title and Expand/Collapse Button */}
          <div
            className="flex min-w-0 cursor-pointer items-start gap-2"
            onClick={onToggle}
          >
            {unit.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <CardTitle className="text-md flex flex-wrap items-center gap-2 leading-tight">
              <span className="break-words">{unit.title}</span>
              {unit.isPremium && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  <FormattedMessage
                    id="admin.lessons.premium"
                    defaultMessage="Premium"
                  />
                </span>
              )}
            </CardTitle>
          </div>

          {/* Unit Actions */}
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              size="sm"
              onClick={onAddLesson}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              <FormattedMessage
                id="admin.lessons.addLesson"
                defaultMessage="Ders Ekle"
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.editUnit"
                    defaultMessage="Üniteyi Düzenle"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.deleteUnit"
                    defaultMessage="Üniteyi Sil"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{unit.description}</CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{unit.lessons.length} ders</Badge>
          <Badge variant={unit.isActive ? "default" : "secondary"}>
            {unit.isActive ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </CardHeader>

      {/* Expanded Unit Content - Lessons */}
      {unit.isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3 pl-2 sm:pl-4">
            {unit.lessons.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-sm text-slate-500 mb-2">
                  <FormattedMessage
                    id="admin.lessons.noLessons"
                    defaultMessage="Bu ünitede henüz ders yok."
                  />
                </p>
                <Button variant="outline" onClick={onAddLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.addLesson"
                    defaultMessage="Ders Ekle"
                  />
                </Button>
              </div>
            ) : (
              unit.lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="rounded-md border p-3 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-2">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-medium">
                        {lesson.title}
                        {lesson.isPremium && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            <FormattedMessage
                              id="admin.lessons.premium"
                              defaultMessage="Premium"
                            />
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          <FormattedMessage
                            id="admin.lessons.xpReward"
                            defaultMessage="{xp} XP"
                            values={{ xp: lesson.xpReward }}
                          />
                        </span>
                        </p>
                        <p className="line-clamp-2 text-sm text-slate-500">
                        {lesson.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => onAddExercise(lesson._id)}
                    >
                      <ListChecks className="mr-2 h-4 w-4" />
                      <FormattedMessage
                        id="admin.lessons.addExercise"
                        defaultMessage="Egzersiz Ekle"
                      />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        router.push(`/admin/lessons/${lesson._id}`)
                      }
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      <FormattedMessage
                        id="admin.lessons.manageExercises"
                        defaultMessage="Egzersizleri Yönet"
                      />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditLesson(lesson)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <FormattedMessage
                            id="admin.lessons.editLesson"
                            defaultMessage="Dersi Düzenle"
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDeleteLesson(lesson._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <FormattedMessage
                            id="admin.lessons.deleteLesson"
                            defaultMessage="Dersi Sil"
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
