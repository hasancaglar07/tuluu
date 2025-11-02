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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  BookOpen,
  Star,
  TestTube,
} from "lucide-react";
import type { Language } from "@/types/lessons";
import Image from "next/image";

interface LessonsGridViewProps {
  currentLanguage?: Language;
  onAddLesson: () => void;
  onEditLesson?: (lesson: any, chapterId: string, unitId: string) => void;
  onDeleteLesson?: (
    chapterId: string,
    unitId: string,
    lessonId: string
  ) => void;
}

/**
 * Lessons Grid View Component
 *
 * Displays all lessons across all units and chapters for the selected language.
 * Provides a flat view of lessons for easier management and bulk operations.
 *
 * Features:
 * - Grid layout showing all lessons from all units and chapters
 * - Chapter and unit context for each lesson
 * - Lesson metadata display (XP reward, premium status, test status, etc.)
 * - Edit and delete actions for each lesson
 * - Exercise count display
 * - Responsive design with lesson type indicators
 */
export function LessonsGridView({
  currentLanguage,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: LessonsGridViewProps) {
  // Flatten all lessons from all units and chapters
  const allLessons =
    currentLanguage?.chapters.flatMap((chapter) =>
      chapter.units.flatMap((unit) =>
        unit.lessons.map((lesson) => ({
          ...lesson,
          chapterTitle: chapter.title,
          chapterId: chapter._id,
          unitTitle: unit.title,
          unitId: unit._id,
          unitColor: unit.color || "bg-blue-500",
        }))
      )
    ) || [];

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
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
        <Button onClick={onAddLesson}>
          <BookOpen className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addLesson"
            defaultMessage="Add Lesson"
          />
        </Button>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allLessons.map((lesson) => (
            <Card key={`${lesson.chapterId}-${lesson.unitId}-${lesson._id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {lesson.isTest ? (
                          <TestTube className="h-4 w-4 text-orange-500" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        )}
                        {lesson.title}
                      </div>
                    </CardTitle>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {lesson.isPremium && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 text-xs"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          <FormattedMessage
                            id="admin.lessons.premium"
                            defaultMessage="Premium"
                          />
                        </Badge>
                      )}

                      {lesson.isTest && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 text-xs"
                        >
                          <TestTube className="h-3 w-3 mr-1" />
                          <FormattedMessage
                            id="admin.lessons.test"
                            defaultMessage="Test"
                          />
                        </Badge>
                      )}

                      <Badge variant="outline" className="text-xs">
                        <FormattedMessage
                          id="admin.lessons.xpReward"
                          defaultMessage="{xp} XP"
                          values={{ xp: lesson.xpReward }}
                        />
                      </Badge>
                    </div>

                    <CardDescription className="mt-2 text-xs">
                      <FormattedMessage
                        id="admin.lessons.lessonPath"
                        defaultMessage="{chapterTitle} → {unitTitle}"
                        values={{
                          chapterTitle: lesson.chapterTitle,
                          unitTitle: lesson.unitTitle,
                        }}
                      />
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          onEditLesson?.(
                            lesson,
                            lesson.chapterId,
                            lesson.unitId
                          )
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="admin.lessons.editLesson"
                          defaultMessage="Edit Lesson"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          onDeleteLesson?.(
                            lesson.chapterId,
                            lesson.unitId,
                            lesson._id
                          )
                        }
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
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lesson.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.exercises"
                          defaultMessage="Exercises:"
                        />
                      </span>
                      <span className="font-medium">
                        {lesson.exercises?.length || 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.order"
                          defaultMessage="Order:"
                        />
                      </span>
                      <span className="font-medium">{lesson.order}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.status.label"
                          defaultMessage="Status:"
                        />
                      </span>
                      <Badge
                        variant={lesson.isActive ? "default" : "secondary"}
                      >
                        {lesson.isActive ? (
                          <FormattedMessage
                            id="admin.lessons.status.active"
                            defaultMessage="Active"
                          />
                        ) : (
                          <FormattedMessage
                            id="admin.lessons.status.inactive"
                            defaultMessage="Inactive"
                          />
                        )}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.type"
                          defaultMessage="Type:"
                        />
                      </span>
                      <span className="font-medium">
                        {lesson.isTest ? (
                          <FormattedMessage
                            id="admin.lessons.entryTest"
                            defaultMessage="Entry Test"
                          />
                        ) : (
                          <FormattedMessage
                            id="admin.lessons.regularLesson"
                            defaultMessage="Regular"
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {lesson.imageUrl && (
                    <div className="mt-3">
                      <Image
                        src={lesson.imageUrl || "/placeholder.svg"}
                        alt={lesson.title}
                        className="w-full h-24 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                         width={300}
                        height={150}
                      />
                    </div>
                  )}

                  {/* Progress indicator based on exercises */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        <FormattedMessage
                          id="admin.lessons.exerciseProgress"
                          defaultMessage="Exercise Progress"
                        />
                      </span>
                      <span>{lesson.exercises?.length || 0}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((lesson.exercises?.length || 0) / 10) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
