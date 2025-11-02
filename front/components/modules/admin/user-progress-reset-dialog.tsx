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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface User {
  id: string;
  name: string;
}

interface UserProgressResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function UserProgressResetDialog({
  open,
  onOpenChange,
  user,
}: UserProgressResetDialogProps) {
  const [resetLessons, setResetLessons] = useState(true);
  const [resetXP, setResetXP] = useState(false);
  const [resetGems, setResetGems] = useState(false);
  const [resetAchievements, setResetAchievements] = useState(false);
  const [resetStreak, setResetStreak] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== "RESET") {
      alert("Please type RESET to confirm");
      return;
    }

    // In a real app, you would send this data to your API
    console.log("Progress reset:", {
      userId: user.id,
      resetLessons,
      resetXP,
      resetGems,
      resetAchievements,
      resetStreak,
      reason,
    });

    // Show success message and close dialog
    alert("User progress reset successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <RotateCcw className="h-5 w-5" />
            Reset User Progress
          </DialogTitle>
          <DialogDescription>
            This action will reset selected progress for user {user.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: This action cannot be undone
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Resetting user progress will permanently delete the
                      selected data. This action cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select what to reset:</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-lessons"
                  checked={resetLessons}
                  onCheckedChange={(checked) =>
                    setResetLessons(checked as boolean)
                  }
                />
                <Label htmlFor="reset-lessons" className="font-normal">
                  Lesson progress
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-xp"
                  checked={resetXP}
                  onCheckedChange={(checked) => setResetXP(checked as boolean)}
                />
                <Label htmlFor="reset-xp" className="font-normal">
                  XP
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-gems"
                  checked={resetGems}
                  onCheckedChange={(checked) =>
                    setResetGems(checked as boolean)
                  }
                />
                <Label htmlFor="reset-gems" className="font-normal">
                  Gems
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-achievements"
                  checked={resetAchievements}
                  onCheckedChange={(checked) =>
                    setResetAchievements(checked as boolean)
                  }
                />
                <Label htmlFor="reset-achievements" className="font-normal">
                  Achievements
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-streak"
                  checked={resetStreak}
                  onCheckedChange={(checked) =>
                    setResetStreak(checked as boolean)
                  }
                />
                <Label htmlFor="reset-streak" className="font-normal">
                  Streak
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you're resetting this user's progress"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-red-600">
                Type RESET to confirm
              </Label>
              <input
                id="confirm"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET"
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
            <Button type="submit" variant="destructive">
              Reset Progress
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
