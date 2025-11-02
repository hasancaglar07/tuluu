"use client";

import type React from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface UserAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded?: () => void;
}

export default function UserAddDialog({
  open,
  onOpenChange,
  onUserAdded,
}: UserAddDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "free",
    subscription: "free",
    avatar: "",
    bio: "",
    language: "English",
    country: "",
    timezone: "",
    sendWelcomeEmail: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const { getToken } = useAuth();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const generatePassword = () => {
    // Generate a random password with letters, numbers, and special characters
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let generatedPassword = "";
    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }
    setPassword(generatedPassword);
    return generatedPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate a password if not already set
      const userPassword = password || generatePassword();

      const token = await getToken();
      // Prepare data for API
      const userData = {
        name: formData.name,
        email: formData.email,
        password: userPassword,
        role: formData.role,
        subscription: formData.subscription,
        publicMetadata: {
          name: formData.name,
          avatar: formData.avatar,
          bio: formData.bio,
          language: formData.language,
          country: formData.country,
          timezone: formData.timezone,
        },
      };

      // Create user via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Send welcome email if option is selected
      if (formData.sendWelcomeEmail) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/welcome`,
            {
              email: formData.email,
              name: formData.name,
              password: userPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          toast.success("Welcome email sent successfully");
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
          toast.error("Failed to send welcome email, but user was created");
        }
      }

      // Show success message
      toast.success("User added successfully!");

      // Call the onUserAdded callback if provided
      if (onUserAdded && response.data) {
        onUserAdded();
      }

      // Close dialog and reset form
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        role: "free",
        subscription: "free",
        avatar: "",
        bio: "",
        language: "English",
        country: "",
        timezone: "",
        sendWelcomeEmail: true,
      });
      setPassword("");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={formData.avatar || "/placeholder.svg?height=64&width=64"}
                  alt="Avatar"
                />
                <AvatarFallback>
                  {formData.name ? formData.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar">Profile Image URL</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password (Auto-generated if empty)
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for auto-generated password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free User</SelectItem>
                    <SelectItem value="paid">Paid User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription</Label>
                <Select
                  value={formData.subscription}
                  onValueChange={(value) =>
                    handleSelectChange("subscription", value)
                  }
                >
                  <SelectTrigger id="subscription">
                    <SelectValue placeholder="Select subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    handleSelectChange("language", value)
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="User bio (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  placeholder="e.g. America/New_York (optional)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
                <p className="text-sm text-muted-foreground">
                  Send an email with login instructions
                </p>
              </div>
              <Switch
                id="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) =>
                  handleSwitchChange("sendWelcomeEmail", checked)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding User...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
