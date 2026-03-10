"use client";

import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, FolderPlus, Trash2 } from "lucide-react";
import type { Chapter, Language, Unit } from "@/types/lessons";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UnitTableRow extends Unit {
  chapterTitle: string;
  chapterId: string;
  chapter: Chapter;
}

interface UnitsGridViewProps {
  currentLanguage?: Language;
  onAddUnit: () => void;
  onEditUnit?: (unit: UnitTableRow, chapterId: string) => void;
  onDeleteUnit?: (unit: UnitTableRow, chapter: Chapter) => void;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [chapterFilter, setChapterFilter] = useState<string>("all");

  // Flatten all units from all chapters
  const allUnits = useMemo<UnitTableRow[]>(
    () =>
      currentLanguage?.chapters.flatMap((chapter) =>
        chapter.units.map((unit) => ({
          ...unit,
          chapterTitle: chapter.title,
          chapterId: chapter._id,
          chapter: chapter,
        }))
      ) || [],
    [currentLanguage]
  );

  const chapterOptions = useMemo(
    () =>
      Array.from(
        new Map(allUnits.map((unit) => [unit.chapterId, unit.chapterTitle])).entries()
      ).map(([id, title]) => ({ id, title })),
    [allUnits]
  );

  const filteredUnits = useMemo(
    () =>
      allUnits.filter((unit) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          term.length === 0 ||
          unit.title.toLowerCase().includes(term) ||
          unit.description.toLowerCase().includes(term) ||
          unit.chapterTitle.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? unit.isActive : !unit.isActive);
        const matchesChapter =
          chapterFilter === "all" || unit.chapterId === chapterFilter;

        return matchesSearch && matchesStatus && matchesChapter;
      }),
    [allUnits, chapterFilter, searchTerm, statusFilter]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setChapterFilter("all");
  };

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "all" ||
    chapterFilter !== "all";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
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
        <Button className="w-full sm:w-auto" onClick={onAddUnit}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addUnit"
            defaultMessage="Add Unit"
          />
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
        <div className="grid gap-2 lg:grid-cols-[1fr,180px,220px,auto]">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ünite, açıklama veya bölüm ara..."
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
            className="w-full lg:w-auto"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Temizle
          </Button>
        </div>
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
      ) : filteredUnits.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aramanıza uyan ünite bulunamadı.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ünite</TableHead>
                <TableHead>Bölüm</TableHead>
                <TableHead>Ders</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Özellik</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={`${unit.chapterId}-${unit._id}`}>
                  <TableCell className="whitespace-normal">
                    <div className="min-w-[220px]">
                      <p className="line-clamp-1 font-medium">{unit.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {unit.description || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <span className="line-clamp-1">{unit.chapterTitle}</span>
                  </TableCell>
                  <TableCell>{unit.lessons.length}</TableCell>
                  <TableCell>{unit.order}</TableCell>
                  <TableCell>
                    <Badge variant={unit.isActive ? "default" : "secondary"}>
                      {unit.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {unit.isPremium ? (
                      <Badge variant="outline">Premium</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditUnit?.(unit, unit.chapterId)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => onDeleteUnit?.(unit, unit.chapter)}
                        title="Sil"
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
