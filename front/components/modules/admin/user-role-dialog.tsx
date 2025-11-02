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
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { AppUser } from "@/types";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser;
}

export default function UserRoleDialog({
  open,
  onOpenChange,
  user,
}: UserRoleDialogProps) {
  const [role, setRole] = useState<string>(user.privateMetadata.role);
  const [reason, setReason] = useState("");
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Function to get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500";
      case "moderator":
        return "bg-blue-500";
      case "content_reviewer":
        return "bg-teal-500";
      case "student":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await getToken(); // or "admin" if you configured one

      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + `/api/admin/users/${user.id}/role`,
        {
          userId: user.id,
          role,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User role updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update role. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Update role and permissions for user {user.publicMetadata.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>Current Role:</span>
              <Badge className={getRoleColor(user.privateMetadata.role)}>
                {user.privateMetadata.role.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>New Role</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="font-normal">
                    Free
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="font-normal">
                    Admin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {role === "admin" && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Elevated Permissions Warning
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This role grants significant permissions including user
                        management and content moderation. Only assign to
                        trusted users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you're changing this user's role"
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between w-full">
            <Button
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {" "}
              {isLoading && <Loader2 className="animate-spin" />}Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
