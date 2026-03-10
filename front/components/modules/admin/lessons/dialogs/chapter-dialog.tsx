"use client";

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
import { Loader2 } from "lucide-react";
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

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!newChapter.title.trim()) {
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
                defaultMessage="Edit Chapter"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewChapter"
                defaultMessage="Add New Chapter"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="admin.lessons.chapterDialogDescription"
              defaultMessage="Create a new chapter for {languageName}."
              values={{
                languageName: currentLanguage?.name || "selected language",
              }}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <h4 className="text-sm font-semibold">Temel Bilgiler</h4>

            <div className="grid gap-2">
              <Label htmlFor="chapter-title">
                <FormattedMessage
                  id="admin.lessons.title"
                  defaultMessage="Title"
                />
              </Label>
              <Input
                id="chapter-title"
                value={newChapter.title}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.chapterTitle",
                  defaultMessage: "örn. Temel Kavramlar"
                })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chapter-description">
                <FormattedMessage
                  id="admin.lessons.description"
                  defaultMessage="Description"
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
              label={intl.formatMessage({ id: "admin.lessons.imageUrl", defaultMessage: "Image URL" })}
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
                    defaultMessage="Order"
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
                      defaultMessage="Premium Content"
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
                      defaultMessage="Expanded by Default"
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
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={!newChapter.title || !currentLanguage || isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Save Changes"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addChapter"
                defaultMessage="Add Chapter"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
