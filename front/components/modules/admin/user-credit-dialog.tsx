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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Gem, Heart, Droplets } from "lucide-react";
import { AppUser } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser;
}

export default function UserCreditDialog({
  open,
  onOpenChange,
  user,
}: UserCreditDialogProps) {
  const [activeTab, setActiveTab] = useState("xp");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await getToken();
      const parsedAmount = Number.parseInt(amount);
      if (Number.isNaN(parsedAmount)) {
        toast.error("Please enter a valid amount");
        setIsLoading(false);
        return;
      }

      await apiClient.post(
        `/api/admin/users/${user.id}/credit`,
        {
          type: activeTab,
          amount: parsedAmount,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`${activeTab.toUpperCase()} adjusted successfully`);
      onOpenChange(false);
      // Refresh current view to reflect updated values
      try {
        router.refresh();
      } catch {
        // no-op if router not available
      }
    } catch (error) {
      console.error("Failed to adjust credits:", error);
      toast.error("Failed to adjust credits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adjust User Credits</DialogTitle>
          <DialogDescription>
            Add or remove XP, Gems, Hearts, or Gel for user {user.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="xp" className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                XP
              </TabsTrigger>
              <TabsTrigger value="gems" className="flex items-center gap-1">
                <Gem className="h-4 w-4 text-blue-500" />
                Gems
              </TabsTrigger>
              <TabsTrigger value="hearts" className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                Hearts
              </TabsTrigger>
              <TabsTrigger value="gel" className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-cyan-500" />
                Gel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xp" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span>Current XP:</span>
                <span className="font-bold flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {user.xp.toLocaleString()}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="gems" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span>Current Gems:</span>
                <span className="font-bold flex items-center">
                  <Gem className="h-4 w-4 text-blue-500 mr-1" />
                  {user.gems.toLocaleString()}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="hearts" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span>Current Hearts:</span>
                <span className="font-bold flex items-center">
                  <Heart className="h-4 w-4 text-red-500 mr-1" />
                  {user.hearts} / 5
                </span>
              </div>
            </TabsContent>

            <TabsContent value="gel" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span>Current Gel:</span>
                <span className="font-bold flex items-center">
                  <Droplets className="h-4 w-4 text-cyan-500 mr-1" />
                  {user.gel.toLocaleString()}
                </span>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (use negative for deduction)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you're adjusting this user's credits"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Applying..." : "Apply Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
