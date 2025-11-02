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
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          {/* Unit Title and Expand/Collapse Button */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onToggle}
          >
            {unit.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <CardTitle className="text-md flex items-center gap-2">
              {unit.title}
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAddLesson}>
              <FilePlus className="mr-2 h-4 w-4" />
              <FormattedMessage
                id="admin.lessons.addLesson"
                defaultMessage="Add Lesson"
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
                    defaultMessage="Edit Unit"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.deleteUnit"
                    defaultMessage="Delete Unit"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription>{unit.description}</CardDescription>
      </CardHeader>

      {/* Expanded Unit Content - Lessons */}
      {unit.isExpanded && (
        <CardContent>
          <div className="space-y-2 pl-6">
            {unit.lessons.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-sm text-slate-500 mb-2">
                  <FormattedMessage
                    id="admin.lessons.noLessons"
                    defaultMessage="No lessons in this unit yet."
                  />
                </p>
                <Button variant="outline" onClick={onAddLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.addLesson"
                    defaultMessage="Add Lesson"
                  />
                </Button>
              </div>
            ) : (
              unit.lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
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
                      <p className="text-sm text-slate-500">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddExercise(lesson._id)}
                    >
                      <ListChecks className="mr-2 h-4 w-4" />
                      <FormattedMessage
                        id="admin.lessons.addExercise"
                        defaultMessage="Add Exercise"
                      />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/lessons/${lesson._id}`)
                      }
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      <FormattedMessage
                        id="admin.lessons.manageExercises"
                        defaultMessage="Manage Exercises"
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
                            defaultMessage="Edit Lesson"
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDeleteLesson(lesson._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <FormattedMessage
                            id="admin.lessons.deleteLesson"
                            defaultMessage="Delete Lesson"
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
