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
  FolderPlus,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { UnitCard } from "./unit-card";
import type { Chapter, Unit, Lesson } from "@/types/lessons";

interface ChapterCardProps {
  chapter: Chapter;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddUnit: () => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit: (unit: Unit) => void;
  onAddLesson: (unitId: string) => void;
  onEditLesson: (lesson: Lesson, unitId: string) => void;
  onDeleteLesson: (unitId: string, lessonId: string) => void;
  onAddExercise: (unitId: string, lessonId: string) => void;
  onToggleUnit: (unitId: string) => void;
}

/**
 * Chapter Card Component
 *
 * Displays a chapter with its metadata and contains all units within the chapter.
 * Features:
 * - Expandable/collapsible view
 * - Edit and delete actions
 * - Add unit functionality
 * - Premium badge display
 * - Nested unit cards when expanded
 */
export function ChapterCard({
  chapter,
  onToggle,
  onEdit,
  onDelete,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddExercise,
  onToggleUnit,
}: ChapterCardProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          {/* Chapter Title and Expand/Collapse Button */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onToggle}
          >
            {chapter.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <CardTitle className="text-lg flex items-center gap-2">
              {chapter.title}
              {chapter.isPremium && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  <FormattedMessage
                    id="admin.lessons.premium"
                    defaultMessage="Premium"
                  />
                </span>
              )}
            </CardTitle>
          </div>

          {/* Chapter Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAddUnit}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <FormattedMessage
                id="admin.lessons.addUnit"
                defaultMessage="Add Unit"
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
                    id="admin.lessons.editChapter"
                    defaultMessage="Edit Chapter"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.deleteChapter"
                    defaultMessage="Delete Chapter"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription>{chapter.description}</CardDescription>
      </CardHeader>

      {/* Expanded Chapter Content - Units */}
      {chapter.isExpanded && (
        <CardContent>
          <div className="space-y-4 pl-6">
            {chapter.units.length === 0 ? (
              <div className="text-center p-6 border rounded-md">
                <p className="text-sm text-slate-500 mb-2">
                  <FormattedMessage
                    id="admin.lessons.noUnits"
                    defaultMessage="No units in this chapter yet."
                  />
                </p>
                <Button variant="outline" onClick={onAddUnit}>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.addUnit"
                    defaultMessage="Add Unit"
                  />
                </Button>
              </div>
            ) : (
              chapter.units.map((unit) => (
                <UnitCard
                  key={unit._id}
                  unit={unit}
                  onToggle={() => onToggleUnit(unit._id)}
                  onEdit={() => onEditUnit(unit)}
                  onDelete={() => onDeleteUnit(unit)}
                  onAddLesson={() => onAddLesson(unit._id)}
                  onEditLesson={(lesson) => onEditLesson(lesson, unit._id)}
                  onDeleteLesson={(lessonId) =>
                    onDeleteLesson(unit._id, lessonId)
                  }
                  onAddExercise={(lessonId) =>
                    onAddExercise(unit._id, lessonId)
                  }
                />
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
