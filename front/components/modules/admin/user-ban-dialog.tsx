"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, AlertTriangle } from "lucide-react";
import { AppUser } from "@/types";

interface UserBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser;
}

export default function UserBanDialog({
  open,
  onOpenChange,
  user,
}: UserBanDialogProps) {
  const [action, setAction] = useState(
    user.status === "active" ? "suspend" : "activate"
  );
  const [duration, setDuration] = useState("7");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you would send this data to your API
    console.log("Account action:", {
      userId: user.id,
      action,
      duration: action === "activate" ? null : Number.parseInt(duration),
      reason,
    });

    // Show success message and close dialog
    alert(
      `User account ${
        action === "activate" ? "activated" : action + "ed"
      } successfully!`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            {user.status === "active" ? "Restrict Account" : "Activate Account"}
          </DialogTitle>
          <DialogDescription>
            {user.status === "active"
              ? "Suspend or ban this user's account."
              : "Reactivate this user's account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {user.status === "active" ? (
              <>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <RadioGroup
                    value={action}
                    onValueChange={setAction}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suspend" id="suspend" />
                      <Label htmlFor="suspend" className="font-normal">
                        Suspend temporarily
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ban" id="ban" />
                      <Label htmlFor="ban" className="font-normal">
                        Ban permanently
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {action === "suspend" && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Reactivating account
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        You are about to reactivate this user&apos;s account.
                        They will regain access to all features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  user.status === "active"
                    ? "Explain why you're restricting this account"
                    : "Explain why you're reactivating this account"
                }
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={user.status === "active" ? "destructive" : "default"}
            >
              {user.status === "active"
                ? action === "ban"
                  ? "Ban Account"
                  : "Suspend Account"
                : "Activate Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
