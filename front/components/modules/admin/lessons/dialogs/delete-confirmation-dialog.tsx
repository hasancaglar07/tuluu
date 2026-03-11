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
import { AlertTriangle, Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Bu işlem geri alınamaz. Yanlış silme işlemlerini önlemek için devam etmeden önce bilgiyi kontrol edin.
        </div>
        <div className="mt-4 flex flex-col justify-end gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Vazgeç"
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
              defaultMessage="Evet, Sil"
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
