"use client";

import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Edit, Trash2 } from "lucide-react";
import type { Language } from "@/types/lessons";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LanguagesGridViewProps {
  languages: Language[];
  onAddLanguage: () => void;
  onEditLanguage: (language: Language) => void;
  onDeleteLanguage: (language: Language) => void;
}

export function LanguagesGridView({
  languages,
  onAddLanguage,
  onEditLanguage,
  onDeleteLanguage,
}: LanguagesGridViewProps) {
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredLanguages = useMemo(
    () =>
      languages.filter((language) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          term.length === 0 ||
          language.name.toLowerCase().includes(term) ||
          language.nativeName.toLowerCase().includes(term) ||
          language.baseLanguage.toLowerCase().includes(term) ||
          language.locale.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? language.isActive : !language.isActive);
        return matchesSearch && matchesStatus;
      }),
    [languages, searchTerm, statusFilter]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== "all";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">
          <FormattedMessage
            id="admin.lessons.tabs.languages"
            defaultMessage="Programs"
          />
        </h2>
        <Button className="w-full sm:w-auto" onClick={onAddLanguage}>
          <Globe className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addLanguage"
            defaultMessage="Add Program"
          />
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
        <div className="grid gap-2 lg:grid-cols-[1fr,180px,auto]">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Program adı, dil veya locale ara..."
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

      {languages.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.lessons.noLanguages.subtitle"
              defaultMessage="Get started by adding your first language."
            />
          </p>
        </div>
      ) : filteredLanguages.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Aramanıza uyan program bulunamadı.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Temel Dil</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Bölüm</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLanguages.map((language) => {
                const difficulty = language.themeMetadata?.difficultyLevel || "beginner";
                return (
                  <TableRow key={language._id}>
                    <TableCell className="whitespace-normal">
                      <div className="min-w-[220px]">
                        <p className="line-clamp-1 font-medium">
                          <span className="mr-2">{language.flag}</span>
                          {language.name}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {language.nativeName || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{language.locale?.toUpperCase() || "-"}</TableCell>
                    <TableCell>{language.baseLanguage?.toUpperCase() || "-"}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {intl.formatMessage({
                            id: `category.${language.category || "undefined"}`,
                            defaultMessage:
                              language.category ||
                              intl.formatMessage({
                                id: "category.undefined",
                                defaultMessage: "Other",
                              }),
                          })}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {intl.formatMessage({
                            id: `difficulty.${difficulty}`,
                            defaultMessage: difficulty,
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{language.chapters.length}</TableCell>
                    <TableCell>
                      <Badge variant={language.isActive ? "default" : "secondary"}>
                        {language.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditLanguage(language)}
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => onDeleteLanguage(language)}
                          disabled={languages.length === 1}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
