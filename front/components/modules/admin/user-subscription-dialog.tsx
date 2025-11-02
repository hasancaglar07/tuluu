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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppUser } from "@/types";

interface UserSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser;
}

export default function UserSubscriptionDialog({
  open,
  onOpenChange,
  user,
}: UserSubscriptionDialogProps) {
  const [plan, setPlan] = useState<string>(user.privateMetadata.subscription);
  const [duration, setDuration] = useState("1");
  const [autoRenew, setAutoRenew] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you would send this data to your API
    console.log("Subscription update:", {
      userId: user.id,
      plan,
      duration: Number.parseInt(duration),
      autoRenew,
    });

    // Show success message and close dialog
    alert("Subscription updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manage Subscription
          </DialogTitle>
          <DialogDescription>
            Update privateMetadata.subscription plan for user{" "}
            {user.privateMetadata.subscription}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>Current Plan:</span>
              <Badge
                className={
                  user.privateMetadata.subscription === "premium"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }
              >
                {user.privateMetadata.subscription.charAt(0).toUpperCase() +
                  user.privateMetadata.subscription.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <RadioGroup
                value={plan}
                onValueChange={setPlan}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="font-normal">
                    Free
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium" className="font-normal">
                    Premium
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {plan === "premium" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-renew">
                      Auto-renew privateMetadata.subscription
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically renew when period ends
                    </p>
                  </div>
                  <Switch
                    id="auto-renew"
                    checked={autoRenew}
                    onCheckedChange={setAutoRenew}
                  />
                </div>

                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Subscription Information
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          This will override any existing
                          privateMetadata.subscription. The new
                          privateMetadata.subscription will start immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {plan === "free" &&
              user.privateMetadata.subscription === "premium" && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Downgrade Warning
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Downgrading to the free plan will immediately remove
                          all premium features for this user.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Subscription</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
