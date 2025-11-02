"use client";

import { FormattedMessage } from "react-intl";
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
      <DialogContent>
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
                <SelectValue placeholder="Select chapter" />
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
                <SelectValue placeholder="Select unit" />
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
              placeholder="e.g. Basic Phrases"
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
              placeholder="e.g. Learn essential everyday phrases"
            />
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-image">
              <FormattedMessage
                id="admin.lessons.imageUrl"
                defaultMessage="Image URL"
              />
            </Label>
            <Input
              id="lesson-image"
              value={newLesson.imageUrl}
              onChange={(e) =>
                setNewLesson({ ...newLesson, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* XP Reward */}
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
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
