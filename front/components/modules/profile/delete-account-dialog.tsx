"use client";

import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

/**
 * DeleteAccountDialog Component
 *
 * Dialog for confirming account deletion with safety measures.
 * Features:
 * - Confirmation dialog with warning styling
 * - Text input confirmation requirement
 * - Loading state during deletion process
 * - Internationalized text content
 * - Disabled state until proper confirmation
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {boolean} props.isLoading - Whether the delete action is in progress
 * @param {string} props.confirmation - User's confirmation text
 * @param {Function} props.onConfirmationChange - Function to update confirmation text
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Function} props.onDelete - Function to handle account deletion
 */
export function DeleteAccountDialog({
  isOpen,
  isLoading,
  confirmation,
  onConfirmationChange,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  isLoading: boolean;
  confirmation: string;
  onConfirmationChange: (value: string) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="text-red-500">
            <FormattedMessage
              id="deleteAccount.title"
              defaultMessage="Hesabımı Sil"
            />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="deleteAccount.description"
              defaultMessage="Bu işlem geri alınamaz. İlerlemen dahil tüm verilerin kalıcı olarak silinir."
            />
          </DialogDescription>
        </DialogHeader>

        {/* Confirmation Input Section */}
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-2">
            <FormattedMessage
              id="deleteAccount.confirmation.prompt"
              defaultMessage="Onaylamak için aşağıya 'SIL' yaz:"
            />
          </p>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => onConfirmationChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="SIL"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <FormattedMessage
              id="deleteAccount.cancel"
              defaultMessage="Vazgeç"
            />
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={confirmation !== "SIL" || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            <FormattedMessage
              id="deleteAccount.confirm"
              defaultMessage="Kalıcı Olarak Sil"
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
