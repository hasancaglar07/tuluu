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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleDot, Loader2 } from "lucide-react";
import type { Language } from "@/types/lessons";
import { UploadField } from "@/components/ui/upload-field";

// Define the form type for new units
export interface NewUnitForm {
  chapterId: string;
  title: string;
  description: string;
  isExpanded: boolean;
  isPremium: boolean;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

interface UnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newUnit: NewUnitForm;
  setNewUnit: (unit: NewUnitForm) => void;
  currentLanguage?: Language;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  isEdit: boolean;
}

/**
 * Unit Dialog Component
 *
 * Dialog for creating and editing units within chapters.
 *
 * Features:
 * - Chapter selection dropdown
 * - Title and description input
 * - Premium and active toggles
 * - Order management
 * - Image URL input
 * - Form validation
 */
export function UnitDialog({
  isOpen,
  onClose,
  newUnit,
  setNewUnit,
  currentLanguage,
  onSubmit,
  isLoading,
  isEdit,
}: UnitDialogProps) {
  const intl = useIntl();
  const [errors, setErrors] = useState<{
    chapterId?: string;
    title?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
  }, [isOpen, isEdit]);

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    const nextErrors: { chapterId?: string; title?: string } = {};
    if (!newUnit.chapterId || !newUnit.title.trim()) {
      if (!newUnit.chapterId) {
        nextErrors.chapterId = "Bölüm seçimi zorunludur.";
      }
      if (!newUnit.title.trim()) {
        nextErrors.title = "Ünite başlığı zorunludur.";
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    await onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editUnit"
                defaultMessage="Üniteyi Düzenle"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewUnit"
                defaultMessage="Yeni Ünite Ekle"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="admin.lessons.unitDialogDescription"
              defaultMessage="Seçtiğiniz bölüm içinde yeni bir ünite oluşturun."
            />
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <CircleDot className="h-3.5 w-3.5" />
          <span>Önce bölüm seçin, sonra ünite başlığı ve sırasını belirleyin. Aktif olmayan üniteler öğrenciye görünmez.</span>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <h4 className="text-sm font-semibold">Temel Bilgiler</h4>
            <div className="grid gap-2">
              <Label htmlFor="unit-chapter">
                <FormattedMessage
                  id="admin.lessons.chapter"
                  defaultMessage="Bölüm"
                />
              </Label>
              <Select
                value={newUnit.chapterId.toString()}
                onValueChange={(value) =>
                  {
                    setNewUnit({ ...newUnit, chapterId: value });
                    if (errors.chapterId) {
                      setErrors((prev) => ({ ...prev, chapterId: undefined }));
                    }
                  }
                }
              >
                <SelectTrigger
                  id="unit-chapter"
                  className={errors.chapterId ? "border-red-500 focus-visible:ring-red-500" : undefined}
                >
                  <SelectValue placeholder={intl.formatMessage({
                    id: "admin.lessons.placeholder.chapter",
                    defaultMessage: "Bölüm seç"
                  })} />
                </SelectTrigger>
                <SelectContent>
                  {currentLanguage &&
                    currentLanguage.chapters.map((chapter) => (
                      <SelectItem
                        key={chapter._id}
                        value={chapter._id.toString()}
                      >
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.chapterId ? (
                  <p className="text-xs text-red-600">{errors.chapterId}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit-title">
                  <FormattedMessage
                    id="admin.lessons.title"
                    defaultMessage="Başlık"
                  />
                </Label>
                <Input
                  id="unit-title"
                  className={errors.title ? "border-red-500 focus-visible:ring-red-500" : undefined}
                  value={newUnit.title}
                  onChange={(e) => {
                    setNewUnit({ ...newUnit, title: e.target.value });
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder={intl.formatMessage({
                    id: "admin.lessons.placeholder.unitTitle",
                    defaultMessage: "örn. Selamlaşmalar"
                  })}
                />
                {errors.title ? (
                  <p className="text-xs text-red-600">{errors.title}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit-description">
                  <FormattedMessage
                    id="admin.lessons.description"
                    defaultMessage="Açıklama"
                  />
                </Label>
              <Textarea
                id="unit-description"
                value={newUnit.description}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, description: e.target.value })
                }
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.unitDescription",
                  defaultMessage: "örn. İnsanları nasıl selamlayacağını öğren"
                })}
              />
            </div>

            <UploadField
              id="unit-image"
              label={intl.formatMessage({ id: "admin.lessons.imageUrl", defaultMessage: "Görsel URL" })}
              value={newUnit.imageUrl}
              onChange={(url) => setNewUnit({ ...newUnit, imageUrl: url })}
              accept="image/*"
              placeholder={intl.formatMessage({ id: "admin.lessons.placeholder.unitImage", defaultMessage: "https://example.com/image.jpg" })}
            />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Ayarlar</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="unit-order">
                  <FormattedMessage
                    id="admin.lessons.order"
                    defaultMessage="Sıra"
                  />
                </Label>
                <Input
                  id="unit-order"
                  type="number"
                  min="0"
                  value={newUnit.order}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unit-premium"
                    checked={newUnit.isPremium}
                    onCheckedChange={(checked) =>
                      setNewUnit({ ...newUnit, isPremium: checked })
                    }
                  />
                  <Label htmlFor="unit-premium">
                    <FormattedMessage
                      id="admin.lessons.premiumContent"
                      defaultMessage="Premium İçerik"
                    />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unit-active"
                    checked={newUnit.isActive}
                    onCheckedChange={(checked) =>
                      setNewUnit({ ...newUnit, isActive: checked })
                    }
                  />
                  <Label htmlFor="unit-active">
                    <FormattedMessage
                      id="admin.lessons.active"
                      defaultMessage="Aktif"
                    />
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id="admin.lessons.inactiveUnitNote"
                    defaultMessage="Pasif üniteler öğrencilere gösterilmez."
                  />
                </p>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unit-expanded"
                    checked={newUnit.isExpanded}
                    onCheckedChange={(checked) =>
                      setNewUnit({ ...newUnit, isExpanded: checked })
                    }
                  />
                  <Label htmlFor="unit-expanded">
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
            disabled={!newUnit.chapterId || !newUnit.title.trim() || isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Değişiklikleri Kaydet"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addUnit"
                defaultMessage="Üniteyi Kaydet"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
