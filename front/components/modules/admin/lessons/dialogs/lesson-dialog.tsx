"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import type { Language } from "@/types/lessons";
import type { MoralValue } from "@/types";
import { UploadField } from "@/components/ui/upload-field";

// Define the form type for new lessons
export interface NewLessonForm {
  chapterId: string;
  unitId: string;
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  valuePointsReward: number;
  moralValue: MoralValue;
  teachingPhase: "teach" | "practice" | "assess";
  pedagogyFocus: string;
  moralStory: {
    title: string;
    text: string;
    placement: "pre_lesson" | "mid_lesson" | "post_lesson";
  };
  imageUrl: string;
  order: number;
}

interface LessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newLesson: NewLessonForm;
  setNewLesson: (lesson: NewLessonForm) => void;
  currentLanguage?: Language;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  isEdit: boolean;
}

const MORAL_VALUE_OPTIONS: MoralValue[] = [
  "patience",
  "gratitude",
  "kindness",
  "honesty",
  "sharing",
  "mercy",
  "justice",
  "respect",
];

/**
 * Lesson Dialog Component
 *
 * Dialog for creating and editing lessons within units.
 *
 * Features:
 * - Chapter and unit selection dropdowns
 * - Title and description input
 * - Premium, test, and active toggles
 * - XP reward configuration
 * - Order management
 * - Image URL input
 * - Form validation with cascading dropdowns
 */
export function LessonDialog({
  isOpen,
  onClose,
  newLesson,
  setNewLesson,
  currentLanguage,
  onSubmit,
  isLoading,
  isEdit,
}: LessonDialogProps) {
  const intl = useIntl();
  const [simpleMode, setSimpleMode] = useState(true);
  
  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!newLesson.chapterId || !newLesson.unitId || !newLesson.title.trim()) {
      return;
    }
    await onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editLesson"
                defaultMessage="Edit Lesson"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewLesson"
                defaultMessage="Add New Lesson"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="admin.lessons.lessonDialogDescription"
              defaultMessage="Create a new lesson within a unit."
            />
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
          <span>{simpleMode ? "Hızlı Mod" : "Gelişmiş Mod"}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSimpleMode((prev) => !prev)}
          >
            {simpleMode ? "Gelişmiş Alanları Aç" : "Hızlı Moda Dön"}
          </Button>
        </div>

        <div className="grid gap-4 py-4">
          {/* Chapter Selection */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-chapter">
              <FormattedMessage
                id="admin.lessons.chapter"
                defaultMessage="Chapter"
              />
            </Label>
            <Select
              value={newLesson.chapterId.toString()}
              onValueChange={(value) =>
                setNewLesson({
                  ...newLesson,
                  chapterId: value,
                  unitId: "", // Reset unit when chapter changes
                })
              }
            >
              <SelectTrigger id="lesson-chapter">
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
          </div>

          {/* Unit Selection */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-unit">
              <FormattedMessage id="admin.lessons.unit" defaultMessage="Unit" />
            </Label>
            <Select
              value={newLesson.unitId.toString()}
              onValueChange={(value) =>
                setNewLesson({ ...newLesson, unitId: value })
              }
              disabled={!newLesson.chapterId}
            >
              <SelectTrigger id="lesson-unit">
                <SelectValue placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.unit",
                  defaultMessage: "Ünite seç"
                })} />
              </SelectTrigger>
              <SelectContent>
                {newLesson.chapterId &&
                  currentLanguage &&
                  currentLanguage.chapters
                    .find((chapter) => chapter._id === newLesson.chapterId)
                    ?.units.map((unit) => (
                      <SelectItem key={unit._id} value={unit._id.toString()}>
                        {unit.title}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lesson Title */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-title">
              <FormattedMessage
                id="admin.lessons.title"
                defaultMessage="Title"
              />
            </Label>
            <Input
              id="lesson-title"
              value={newLesson.title}
              onChange={(e) =>
                setNewLesson({ ...newLesson, title: e.target.value })
              }
              placeholder={intl.formatMessage({
                id: "admin.lessons.placeholder.lessonTitle",
                defaultMessage: "örn. Temel İfadeler"
              })}
            />
          </div>

          {/* Lesson Description */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-description">
              <FormattedMessage
                id="admin.lessons.description"
                defaultMessage="Description"
              />
            </Label>
            <Textarea
              id="lesson-description"
              value={newLesson.description}
              onChange={(e) =>
                setNewLesson({ ...newLesson, description: e.target.value })
              }
              placeholder={intl.formatMessage({
                id: "admin.lessons.placeholder.lessonDescription",
                defaultMessage: "örn. Günlük temel ifadeleri öğren"
              })}
            />
          </div>

          {!simpleMode && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="lesson-phase">Ders Aşaması</Label>
              <Select
                value={newLesson.teachingPhase}
                onValueChange={(value) =>
                  setNewLesson({
                    ...newLesson,
                    teachingPhase: value as "teach" | "practice" | "assess",
                    isTest: value === "assess",
                  })
                }
              >
                <SelectTrigger id="lesson-phase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teach">Öğretim</SelectItem>
                  <SelectItem value="practice">Alıştırma</SelectItem>
                  <SelectItem value="assess">Değerlendirme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lesson-moral">Ahlaki Değer</Label>
              <Select
                value={newLesson.moralValue}
                onValueChange={(value) =>
                  setNewLesson({ ...newLesson, moralValue: value as MoralValue })
                }
              >
                <SelectTrigger id="lesson-moral">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MORAL_VALUE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          {!simpleMode && (
            <div className="grid gap-2">
              <Label htmlFor="lesson-pedagogy">Pedagojik Odak</Label>
              <Textarea
                id="lesson-pedagogy"
                value={newLesson.pedagogyFocus}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, pedagogyFocus: e.target.value })
                }
                placeholder="Bu derste önce ne öğretilecek, hangi beceri hedeflenecek?"
              />
            </div>
          )}

          {/* Image Upload */}
          <UploadField
            id="lesson-image"
            label={intl.formatMessage({ id: "admin.lessons.imageUrl", defaultMessage: "Image URL" })}
            value={newLesson.imageUrl}
            onChange={(url) => setNewLesson({ ...newLesson, imageUrl: url })}
            accept="image/*"
            placeholder={intl.formatMessage({ id: "admin.lessons.placeholder.lessonImage", defaultMessage: "https://example.com/image.jpg" })}
          />

          {/* XP Reward */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
            <Label htmlFor="lesson-xp">
              <FormattedMessage
                id="admin.lessons.xpReward"
                defaultMessage="XP Reward"
              />
            </Label>
            <Input
              id="lesson-xp"
              type="number"
              value={newLesson.xpReward}
              onChange={(e) =>
                setNewLesson({
                  ...newLesson,
                  xpReward: Number(e.target.value),
                })
              }
              min="1"
              />
            </div>
            {!simpleMode && (
              <div className="grid gap-2">
                <Label htmlFor="lesson-value-points">Değer Puanı Ödülü</Label>
                <Input
                  id="lesson-value-points"
                  type="number"
                  min="0"
                  value={newLesson.valuePointsReward}
                  onChange={(e) =>
                    setNewLesson({
                      ...newLesson,
                      valuePointsReward: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>

          {!simpleMode && (
          <div className="grid gap-4 rounded-md border p-3">
            <h4 className="text-sm font-semibold">Ders Çıkarımı (Moral Story)</h4>
            <div className="grid gap-2">
              <Label htmlFor="lesson-moral-title">Başlık</Label>
              <Input
                id="lesson-moral-title"
                value={newLesson.moralStory?.title || ""}
                onChange={(e) =>
                  setNewLesson({
                    ...newLesson,
                    moralStory: {
                      ...(newLesson.moralStory || {
                        title: "",
                        text: "",
                        placement: "post_lesson",
                      }),
                      title: e.target.value,
                    },
                  })
                }
                placeholder="Örn. Sabırla Kazanmak"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-moral-text">Hikaye Metni</Label>
              <Textarea
                id="lesson-moral-text"
                value={newLesson.moralStory?.text || ""}
                onChange={(e) =>
                  setNewLesson({
                    ...newLesson,
                    moralStory: {
                      ...(newLesson.moralStory || {
                        title: "",
                        text: "",
                        placement: "post_lesson",
                      }),
                      text: e.target.value,
                    },
                  })
                }
                placeholder="Ders sonunda çocuğun çıkarım yapacağı kısa hikaye..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-moral-placement">Konum</Label>
              <Select
                value={newLesson.moralStory?.placement || "post_lesson"}
                onValueChange={(value) =>
                  setNewLesson({
                    ...newLesson,
                    moralStory: {
                      ...(newLesson.moralStory || {
                        title: "",
                        text: "",
                        placement: "post_lesson",
                      }),
                      placement: value as "pre_lesson" | "mid_lesson" | "post_lesson",
                    },
                  })
                }
              >
                <SelectTrigger id="lesson-moral-placement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_lesson">Ders Başında</SelectItem>
                  <SelectItem value="mid_lesson">Ders Ortasında</SelectItem>
                  <SelectItem value="post_lesson">Ders Sonunda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          {/* Order */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-order">
              <FormattedMessage
                id="admin.lessons.order"
                defaultMessage="Order"
              />
            </Label>
            <Input
              id="lesson-order"
              type="number"
              min="1"
              value={newLesson.order}
              onChange={(e) =>
                setNewLesson({ ...newLesson, order: Number(e.target.value) })
              }
            />
          </div>

          {/* Premium Content Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="lesson-premium"
              checked={newLesson.isPremium}
              onCheckedChange={(checked) =>
                setNewLesson({ ...newLesson, isPremium: checked })
              }
            />
            <Label htmlFor="lesson-premium">
              <FormattedMessage
                id="admin.lessons.premiumContent"
                defaultMessage="Premium Content"
              />
            </Label>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="lesson-active"
              checked={newLesson.isActive}
              onCheckedChange={(checked) =>
                setNewLesson({ ...newLesson, isActive: checked })
              }
            />
            <Label htmlFor="lesson-active">
              <FormattedMessage
                id="admin.lessons.active"
                defaultMessage="Active"
              />
            </Label>
          </div>

          {/* Test Lesson Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="lesson-test"
              checked={newLesson.isTest}
              onCheckedChange={(checked) =>
                setNewLesson({ ...newLesson, isTest: checked })
              }
            />
            <Label htmlFor="lesson-test">
              <FormattedMessage
                id="admin.lessons.entryTest"
                defaultMessage="Entry Test"
              />
            </Label>
            <p className="text-xs text-muted-foreground ml-2">
              <FormattedMessage
                id="admin.lessons.entryTestNote"
                defaultMessage="Use to test user knowledge when they did not complete last unit"
              />
            </p>
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
            disabled={
              !newLesson.chapterId ||
              !newLesson.unitId ||
              !newLesson.title ||
              isLoading
            }
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Save Changes"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addLesson"
                defaultMessage="Add Lesson"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
