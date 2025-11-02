"use client";

import { FormattedMessage } from "react-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestForm } from "@/components/modules/admin/quest-form";

import type { Quest } from "@/types";

interface QuestFormDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback for dialog open/close state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback for successful form submission */
  onSuccess: (quest: Quest) => void;
  /** Dialog mode - create or edit */
  mode: "create" | "edit";
  /** Quest data for edit mode */
  quest?: Quest | null;
}

/**
 * Quest Form Dialog Component
 *
 * Modal dialog that contains the quest creation/editing form.
 * Handles both create and edit modes with appropriate titles and descriptions.
 *
 * @param {QuestFormDialogProps} props - The component props
 * @returns {JSX.Element} Modal dialog with quest form
 */
export function QuestFormDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  mode,
  quest,
}: QuestFormDialogProps) {
  const isEditing = mode === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? (
              <FormattedMessage
                id="admin.quests.dialog.edit.title"
                defaultMessage="Edit Quest"
              />
            ) : (
              <FormattedMessage
                id="admin.quests.dialog.create.title"
                defaultMessage="Create New Quest"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? (
              <FormattedMessage
                id="admin.quests.dialog.edit.description"
                defaultMessage="Make changes to the quest details, goals, or rewards."
              />
            ) : (
              <FormattedMessage
                id="admin.quests.dialog.create.description"
                defaultMessage="Create a new quest for your users to complete and earn rewards."
              />
            )}
          </DialogDescription>
        </DialogHeader>
        <QuestForm
          quest={quest}
          onSubmit={() => onOpenChange(false)}
          onSuccess={onSuccess}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
