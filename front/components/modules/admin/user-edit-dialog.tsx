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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { AppUser } from "@/types";

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser;
}

export default function UserEditDialog({
  open,
  onOpenChange,
  user,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<AppUser>(user);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    console.log("Güncellenen kullanıcı verisi:", formData);

    // Show success message and close dialog
    alert("Kullanıcı bilgileri başarıyla güncellendi!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kullanıcı Profilini Düzenle</DialogTitle>
          <DialogDescription>
            Kullanıcı bilgilerini güncelleyin. İşiniz bittiğinde kaydedin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={formData.publicMetadata.avatar}
                  alt={formData.publicMetadata.name}
                />
                <AvatarFallback>
                  {formData?.publicMetadata.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar">Profil Görseli URL</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  value={formData?.publicMetadata.avatar}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.publicMetadata.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData?.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biyografi</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.publicMetadata.bio}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Dil</Label>
                <Input
                  id="language"
                  name="language"
                  value={formData?.publicMetadata.language}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Ülke</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData?.publicMetadata.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Saat Dilimi</Label>
              <Input
                id="timezone"
                name="timezone"
                value={formData.publicMetadata.timezone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
            <h3 className="text-sm font-semibold text-muted-foreground">Ebeveyn Kontrolleri</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="parental-enabled"
                checked={formData.parentalControls?.enabled ?? false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentalControls: {
                      enabled: checked,
                      guardianContact:
                        prev.parentalControls?.guardianContact ?? "",
                    },
                  }))
                }
              />
              <Label htmlFor="parental-enabled">Veli onayı gereksin</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianContact">Veli iletişim e-postası</Label>
              <Input
                id="guardianContact"
                value={formData.parentalControls?.guardianContact ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentalControls: {
                      enabled: prev.parentalControls?.enabled ?? false,
                      guardianContact: event.target.value,
                    },
                  }))
                }
                disabled={!formData.parentalControls?.enabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minutesAllowed">Günlük limit (dakika)</Label>
                <Input
                  id="minutesAllowed"
                  type="number"
                  value={formData.dailyLimits?.minutesAllowed ?? 0}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      dailyLimits: {
                        minutesAllowed:
                          Number.parseInt(event.target.value) || 0,
                        minutesUsed: prev.dailyLimits?.minutesUsed ?? 0,
                        lastResetAt: prev.dailyLimits?.lastResetAt ?? null,
                      },
                    }))
                  }
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutesUsed">Bugün kullanılan dakika</Label>
                <Input
                  id="minutesUsed"
                  type="number"
                  value={formData.dailyLimits?.minutesUsed ?? 0}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      dailyLimits: {
                        minutesAllowed: prev.dailyLimits?.minutesAllowed ?? 0,
                        minutesUsed:
                          Number.parseInt(event.target.value) || 0,
                        lastResetAt: prev.dailyLimits?.lastResetAt ?? null,
                      },
                    }))
                  }
                  min={0}
                />
              </div>
            </div>
            {formData.dailyLimits?.lastResetAt && (
              <p className="text-xs text-muted-foreground">
                Son sıfırlama: {new Date(formData.dailyLimits.lastResetAt).toLocaleString()}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit">Değişiklikleri Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
