"use client";

import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CircleDot, Loader2 } from "lucide-react";
import type { Language } from "@/types/lessons";
import { UploadField } from "@/components/ui/upload-field";

// Define the form type for new chapters
export interface NewChapterForm {
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
}

interface ChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newChapter: NewChapterForm;
  setNewChapter: (chapter: NewChapterForm) => void;
  currentLanguage?: Language;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  isEdit: boolean;
}

/**
 * Chapter Dialog Component
 *
 * Dialog for creating and editing chapters.
 * Includes form fields for chapter metadata and validation.
 *
 * Features:
 * - Title and description input
 * - Premium content toggle
 * - Order management
 * - Image URL input
 * - Form validation
 */
export function ChapterDialog({
  isOpen,
  onClose,
  newChapter,
  setNewChapter,
  currentLanguage,
  onSubmit,
  isLoading,
  isEdit,
}: ChapterDialogProps) {
  const intl = useIntl();
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
  }, [isOpen, isEdit]);

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    const nextErrors: { title?: string } = {};
    if (!newChapter.title.trim()) {
      nextErrors.title = "Bölüm başlığı zorunludur.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    await onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editChapter"
                defaultMessage="Bölümü Düzenle"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewChapter"
                defaultMessage="Yeni Bölüm Ekle"
              />
            )}
          </DialogTitle>
          <DialogDescription>
              <FormattedMessage
                id="admin.lessons.chapterDialogDescription"
                defaultMessage="{languageName} için yeni bir bölüm oluşturun."
                values={{
                languageName: currentLanguage?.name || "seçili program",
              }}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <CircleDot className="h-3.5 w-3.5" />
          <span>Başlık zorunludur. Premium ve varsayılan açık ayarlarını isteğe göre belirleyin.</span>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <h4 className="text-sm font-semibold">Temel Bilgiler</h4>

            <div className="grid gap-2">
              <Label htmlFor="chapter-title">
                <FormattedMessage
                  id="admin.lessons.title"
                  defaultMessage="Başlık"
                />
              </Label>
              <Input
                id="chapter-title"
                className={errors.title ? "border-red-500 focus-visible:ring-red-500" : undefined}
                value={newChapter.title}
                onChange={(e) => {
                  setNewChapter({ ...newChapter, title: e.target.value });
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.chapterTitle",
                  defaultMessage: "örn. Temel Kavramlar"
                })}
              />
              {errors.title ? (
                <p className="text-xs text-red-600">{errors.title}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chapter-description">
                <FormattedMessage
                  id="admin.lessons.description"
                  defaultMessage="Açıklama"
                />
              </Label>
              <Textarea
                id="chapter-description"
                value={newChapter.description}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    description: e.target.value,
                  })
                }
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.chapterDescription",
                  defaultMessage: "örn. Temel kavramlar ve kelime hazinesi"
                })}
              />
            </div>

            <UploadField
              id="chapter-image"
              label={intl.formatMessage({ id: "admin.lessons.imageUrl", defaultMessage: "Görsel URL" })}
              value={newChapter.imageUrl}
              onChange={(url) => setNewChapter({ ...newChapter, imageUrl: url })}
              accept="image/*"
              placeholder={intl.formatMessage({ id: "admin.lessons.placeholder.chapterImage", defaultMessage: "https://example.com/image.jpg" })}
            />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Ayarlar</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="chapter-order">
                  <FormattedMessage
                    id="admin.lessons.order"
                    defaultMessage="Sıra"
                  />
                </Label>
                <Input
                  id="chapter-order"
                  type="number"
                  min="0"
                  value={newChapter.order}
                  onChange={(e) =>
                    setNewChapter({ ...newChapter, order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="chapter-premium"
                    checked={newChapter.isPremium}
                    onCheckedChange={(checked) =>
                      setNewChapter({ ...newChapter, isPremium: checked })
                    }
                  />
                  <Label htmlFor="chapter-premium">
                    <FormattedMessage
                      id="admin.lessons.premiumContent"
                      defaultMessage="Premium İçerik"
                    />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="chapter-expanded"
                    checked={newChapter.isExpanded}
                    onCheckedChange={(checked) =>
                      setNewChapter({ ...newChapter, isExpanded: checked })
                    }
                  />
                  <Label htmlFor="chapter-expanded">
                    <FormattedMessage
                      id="admin.lessons.expandedByDefault"
                      defaultMessage="Varsayılan Olarak Açık"
                    />
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button className="w-full sm:w-auto" variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Vazgeç"
            />
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={!newChapter.title.trim() || !currentLanguage || isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Değişiklikleri Kaydet"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addChapter"
                defaultMessage="Bölümü Kaydet"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
