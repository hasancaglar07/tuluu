"use client";

import { FormattedMessage } from "react-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading: boolean;
}

/**
 * Delete Confirmation Dialog Component
 *
 * A reusable confirmation dialog for delete operations.
 * Provides a clear warning and requires explicit confirmation.
 */
export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  isLoading,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            <FormattedMessage
              id="admin.lessons.confirmDelete"
              defaultMessage="Confirm Delete"
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
