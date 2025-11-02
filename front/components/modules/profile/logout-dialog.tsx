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
import { Loader2 } from "lucide-react";

/**
 * LogoutDialog Component
 *
 * Dialog for confirming user logout.
 * Features:
 * - Confirmation dialog with clear messaging
 * - Loading state during logout process
 * - Internationalized text content
 * - Cancel and confirm actions
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {boolean} props.isLoading - Whether the logout action is in progress
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Function} props.onLogout - Function to handle logout action
 */
export function LogoutDialog({
  isOpen,
  isLoading,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id="logout.title" defaultMessage="Log out" />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="logout.description"
              defaultMessage="Are you sure you want to log out? You can log back in at any time."
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <FormattedMessage id="logout.cancel" defaultMessage="Cancel" />
          </Button>
          <Button variant="default" disabled={isLoading} onClick={onLogout}>
            <FormattedMessage id="logout.confirm" defaultMessage="Log out" />
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
