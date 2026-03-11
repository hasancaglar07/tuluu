"use client";

import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash2 } from "lucide-react";
import type { Chapter, Language } from "@/types/lessons";

interface ChaptersGridViewProps {
  currentLanguage?: Language;
  onAddChapter: () => void;
  onEditChapter?: (chapter: Chapter) => void;
  onDeleteChapter?: (chapter: Chapter) => void;
}

export function ChaptersGridView({
  currentLanguage,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
}: ChaptersGridViewProps) {
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState("");
  const [premiumFilter, setPremiumFilter] = useState<"all" | "premium" | "free">("all");

  const chapters = useMemo(() => currentLanguage?.chapters ?? [], [currentLanguage]);

  const filteredChapters = useMemo(
    () =>
      chapters.filter((chapter) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          term.length === 0 ||
          chapter.title.toLowerCase().includes(term) ||
          chapter.description.toLowerCase().includes(term);
        const matchesPremium =
          premiumFilter === "all" ||
          (premiumFilter === "premium" ? chapter.isPremium : !chapter.isPremium);
        return matchesSearch && matchesPremium;
      }),
    [chapters, premiumFilter, searchTerm]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setPremiumFilter("all");
  };

  const hasActiveFilters = searchTerm.trim().length > 0 || premiumFilter !== "all";
  const premiumCount = chapters.filter((chapter) => chapter.isPremium).length;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">
            <FormattedMessage
              id="admin.lessons.tabs.chapters"
              defaultMessage="Bölümler"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            Bölüm yapısını sade bir tabloyla yönetin ve içerik planını net tutun.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onAddChapter}>
          <Plus className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addChapter"
            defaultMessage="Bölüm Ekle"
          />
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline">{chapters.length} bölüm</Badge>
          <Badge variant="secondary">{premiumCount} premium bölüm</Badge>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1fr,180px,auto]">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Bölüm adı veya açıklama ara..."
          />
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value as "all" | "premium" | "free")}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Tüm Planlar</option>
            <option value="premium">Premium</option>
            <option value="free">Ücretsiz</option>
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

      {chapters.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.lessons.noChapters.subtitle"
              defaultMessage="İlk bölümü oluşturarak başlayın."
            />
          </p>
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Aramanıza uyan bölüm bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bölüm</TableHead>
                <TableHead>İçerik Tipi</TableHead>
                <TableHead>Ünite</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChapters.map((chapter) => (
                <TableRow key={chapter._id}>
                  <TableCell className="whitespace-normal">
                    <div className="min-w-[240px]">
                      <p className="line-clamp-1 font-medium">{chapter.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {chapter.description || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {intl.formatMessage({
                        id: `contentType.${chapter.contentType ?? "lesson"}`,
                        defaultMessage: chapter.contentType ?? "Ders",
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell>{chapter.units.length}</TableCell>
                  <TableCell>{chapter.order}</TableCell>
                  <TableCell>
                    <Badge variant={chapter.isPremium ? "secondary" : "outline"}>
                      {chapter.isPremium ? "Premium" : "Ücretsiz"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditChapter?.(chapter)}
                        disabled={!onEditChapter}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => onDeleteChapter?.(chapter)}
                        disabled={!onDeleteChapter}
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
