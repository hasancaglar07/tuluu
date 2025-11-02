"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuestDetailsDialog as QuestDetails } from "@/components/modules/admin/quest-details-dialog";

import type { Quest } from "@/types";

interface QuestDetailsDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback for dialog open/close state changes */
  onOpenChange: (open: boolean) => void;
  /** Quest data to display */
  quest: Quest | null;
  /** Callback for editing the quest */
  onEdit: () => void;
}

/**
 * Quest Details Dialog Component
 *
 * Modal dialog that displays detailed information about a quest.
 * Shows comprehensive quest data including progress, participants, and analytics.
 *
 * @param {QuestDetailsDialogProps} props - The component props
 * @returns {JSX.Element} Modal dialog with quest details
 */
export function QuestDetailsDialog({
  isOpen,
  onOpenChange,
  quest,
  onEdit,
}: QuestDetailsDialogProps) {
  if (!quest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <QuestDetails quest={quest} onEdit={onEdit} />
      </DialogContent>
    </Dialog>
  );
}
