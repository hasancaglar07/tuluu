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
import { Edit, Trash2, MoreHorizontal, FolderPlus } from "lucide-react";
import type { Language } from "@/types/lessons";
import Image from "next/image";

interface UnitsGridViewProps {
  currentLanguage?: Language;
  onAddUnit: () => void;
  onEditUnit?: (unit: any, chapterId: string) => void;
  onDeleteUnit?: (unit: any, chapter: any) => void;
}

/**
 * Units Grid View Component
 *
 * Displays all units across all chapters for the selected language.
 * Provides a flat view of units for easier management and bulk operations.
 *
 * Features:
 * - Grid layout showing all units from all chapters
 * - Chapter context for each unit
 * - Unit metadata display (lessons count, premium status, etc.)
 * - Edit and delete actions for each unit
 * - Responsive design
 */
export function UnitsGridView({
  currentLanguage,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}: UnitsGridViewProps) {
  // Flatten all units from all chapters
  const allUnits =
    currentLanguage?.chapters.flatMap((chapter) =>
      chapter.units.map((unit) => ({
        ...unit,
        chapterTitle: chapter.title,
        chapterId: chapter._id,
        chapter: chapter,
      }))
    ) || [];

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            <FormattedMessage
              id="admin.lessons.tabs.units"
              defaultMessage="Units"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.lessons.unitsGridDescription"
              defaultMessage="Manage all units across chapters for {languageName}"
              values={{
                languageName: currentLanguage?.name || "selected language",
              }}
            />
          </p>
        </div>
        <Button onClick={onAddUnit}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addUnit"
            defaultMessage="Add Unit"
          />
        </Button>
      </div>

      {allUnits.length === 0 ? (
        <div className="text-center p-12 border rounded-md">
          <div className="inline-flex h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-4">
            <FolderPlus className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium">
            <FormattedMessage
              id="admin.lessons.noUnits.title"
              defaultMessage="No units yet"
            />
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            <FormattedMessage
              id="admin.lessons.noUnits.subtitle"
              defaultMessage="Create chapters first, then add units to organize your lessons."
            />
          </p>
          <Button onClick={onAddUnit}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.lessons.addUnit"
              defaultMessage="Add Unit"
            />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allUnits.map((unit) => (
            <Card key={`${unit.chapterId}-${unit._id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {unit.title}
                      {unit.isPremium && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          <FormattedMessage
                            id="admin.lessons.premium"
                            defaultMessage="Premium"
                          />
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <FormattedMessage
                        id="admin.lessons.unitInChapter"
                        defaultMessage="In chapter: {chapterTitle}"
                        values={{ chapterTitle: unit.chapterTitle }}
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
                        onClick={() => onEditUnit?.(unit, unit.chapterId)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="admin.lessons.editUnit"
                          defaultMessage="Edit Unit"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteUnit?.(unit, unit.chapter)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="admin.lessons.deleteUnit"
                          defaultMessage="Delete Unit"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {unit.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.lessons"
                          defaultMessage="Lessons:"
                        />
                      </span>
                      <span className="font-medium">{unit.lessons.length}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.order"
                          defaultMessage="Order:"
                        />
                      </span>
                      <span className="font-medium">{unit.order}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.status.label"
                          defaultMessage="Status:"
                        />
                      </span>
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? (
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
                          id="admin.lessons.expanded"
                          defaultMessage="Expanded:"
                        />
                      </span>
                      <span className="font-medium">
                        {unit.isExpanded ? (
                          <FormattedMessage
                            id="admin.lessons.yes"
                            defaultMessage="Yes"
                          />
                        ) : (
                          <FormattedMessage
                            id="admin.lessons.no"
                            defaultMessage="No"
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {unit.imageUrl && (
                    <div className="mt-3">
                      <Image
                        src={unit.imageUrl || "/placeholder.svg"}
                        alt={unit.title}
                        className="w-full h-24 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        width={300}
                        height={150}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
