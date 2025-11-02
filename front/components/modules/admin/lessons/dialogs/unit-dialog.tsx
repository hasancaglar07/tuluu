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
  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!newUnit.chapterId || !newUnit.title.trim()) {
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
                id="admin.lessons.editUnit"
                defaultMessage="Edit Unit"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewUnit"
                defaultMessage="Add New Unit"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="admin.lessons.unitDialogDescription"
              defaultMessage="Create a new unit within a chapter."
            />
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Chapter Selection */}
          <div className="grid gap-2">
            <Label htmlFor="unit-chapter">
              <FormattedMessage
                id="admin.lessons.chapter"
                defaultMessage="Chapter"
              />
            </Label>
            <Select
              value={newUnit.chapterId.toString()}
              onValueChange={(value) =>
                setNewUnit({ ...newUnit, chapterId: value })
              }
            >
              <SelectTrigger id="unit-chapter">
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

          {/* Unit Title */}
          <div className="grid gap-2">
            <Label htmlFor="unit-title">
              <FormattedMessage
                id="admin.lessons.title"
                defaultMessage="Title"
              />
            </Label>
            <Input
              id="unit-title"
              value={newUnit.title}
              onChange={(e) =>
                setNewUnit({ ...newUnit, title: e.target.value })
              }
              placeholder="e.g. Greetings"
            />
          </div>

          {/* Unit Description */}
          <div className="grid gap-2">
            <Label htmlFor="unit-description">
              <FormattedMessage
                id="admin.lessons.description"
                defaultMessage="Description"
              />
            </Label>
            <Textarea
              id="unit-description"
              value={newUnit.description}
              onChange={(e) =>
                setNewUnit({ ...newUnit, description: e.target.value })
              }
              placeholder="e.g. Learn how to greet people"
            />
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="unit-image">
              <FormattedMessage
                id="admin.lessons.imageUrl"
                defaultMessage="Image URL"
              />
            </Label>
            <Input
              id="unit-image"
              value={newUnit.imageUrl}
              onChange={(e) =>
                setNewUnit({ ...newUnit, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Order */}
          <div className="grid gap-2">
            <Label htmlFor="unit-order">
              <FormattedMessage
                id="admin.lessons.order"
                defaultMessage="Order"
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

          {/* Premium Content Toggle */}
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
                defaultMessage="Premium Content"
              />
            </Label>
          </div>

          {/* Active Toggle */}
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
                defaultMessage="Active"
              />
            </Label>
            <p className="text-xs text-muted-foreground ml-2">
              <FormattedMessage
                id="admin.lessons.inactiveUnitNote"
                defaultMessage="Inactive units won't be visible to users."
              />
            </p>
          </div>

          {/* Expanded by Default Toggle */}
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
                defaultMessage="Expanded by Default"
              />
            </Label>
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
            disabled={!newUnit.chapterId || !newUnit.title || isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Save Changes"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addUnit"
                defaultMessage="Add Unit"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
