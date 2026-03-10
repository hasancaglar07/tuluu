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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Bu işlem geri alınamaz.
        </div>
        <div className="mt-4 flex flex-col justify-end gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            className="w-full sm:w-auto"
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
