"use client";

import { FormattedMessage, useIntl } from "react-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Language, NewLanguageForm } from "@/types/lessons";

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newLanguage: Language | NewLanguageForm;
  setNewLanguage:
    | ((language: Language) => void)
    | ((language: NewLanguageForm) => void);
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  isEdit: boolean;
}

/**
 * Language Dialog Component
 *
 * A reusable dialog for both creating new languages and editing existing ones.
 * Features:
 * - Language selection from predefined list
 * - Base language selection
 * - Active/inactive toggle
 * - Form validation
 * - Loading states
 *
 * @param isEdit - Determines if this is an edit or create operation
 */
export function LanguageDialog({
  isOpen,
  onClose,
  newLanguage,
  setNewLanguage,
  onSubmit,
  isLoading,
  isEdit,
}: LanguageDialogProps) {
  const intl = useIntl();

  // Available languages for selection
  const availableLanguages = [
    { _id: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197560.png" },
    { _id: "en", name: "English", nativeName: "English", flag: "🇬🇧", imageUrl: "https://cdn-icons-png.flaticon.com/128/9906/9906532.png" },
    { _id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", imageUrl: "https://cdn-icons-png.flaticon.com/128/10601/10601048.png" },
    { _id: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197571.png" },
    { _id: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197626.png" },
    { _id: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197463.png" },
    { _id: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197604.png" },
    { _id: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", imageUrl: "https://cdn-icons-png.flaticon.com/128/5372/5372696.png" },
    { _id: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197582.png" },
    { _id: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197408.png" },
    { _id: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197569.png" },
    { _id: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197518.png" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editLanguage"
                defaultMessage="Edit Language"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewLanguage"
                defaultMessage="Add New Language"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editLanguageDescription"
                defaultMessage="Update language details."
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addLanguageDescription"
                defaultMessage="Add a new language to your course offerings."
              />
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="language-select">
                <FormattedMessage
                  id="admin.lessons.selectLanguage"
                  defaultMessage="Select Language"
                />
              </Label>
              <Select
                value={newLanguage._id}
                onValueChange={(value) => {
                  const selectedLang = availableLanguages.find(
                    (lang) => lang._id === value
                  );
                  if (selectedLang && setNewLanguage) {
                    (setNewLanguage as (language: NewLanguageForm) => void)({
                      ...(newLanguage as NewLanguageForm),
                      _id: selectedLang._id,
                      name: selectedLang.name,
                      nativeName: selectedLang.nativeName,
                      flag: selectedLang.flag,
                      imageUrl: selectedLang.imageUrl,
                    });
                  }
                }}
              >
                <SelectTrigger id="language-select">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "admin.lessons.selectLanguagePlaceholder",
                      defaultMessage: "Select a language",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang._id} value={lang._id}>
                      <span className="flex items-center">
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name} ({lang.nativeName})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isEdit && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="edit-language-name">
                  <FormattedMessage
                    id="admin.lessons.name"
                    defaultMessage="Name"
                  />
                </Label>
                <Input
                  id="edit-language-name"
                  value={newLanguage.name}
                  onChange={(e) =>
                    setNewLanguage &&
                    (setNewLanguage as (language: Language) => void)({
                      ...(newLanguage as Language),
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-language-native">
                  <FormattedMessage
                    id="admin.lessons.nativeName"
                    defaultMessage="Native Name"
                  />
                </Label>
                <Input
                  id="edit-language-native"
                  value={newLanguage.nativeName}
                  onChange={(e) =>
                    setNewLanguage &&
                    (setNewLanguage as (language: Language) => void)({
                      ...(newLanguage as Language),
                      nativeName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-language-flag">
                  <FormattedMessage
                    id="admin.lessons.flag"
                    defaultMessage="Flag"
                  />
                </Label>
                <Input
                  id="edit-language-flag"
                  value={newLanguage.flag}
                  onChange={(e) =>
                    setNewLanguage &&
                    (setNewLanguage as (language: Language) => void)({
                      ...(newLanguage as Language),
                      flag: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-language-imageUrl">
                  <FormattedMessage
                    id="admin.lessons.imageUrl"
                    defaultMessage="image Url"
                  />
                </Label>
                <Input
                  id="edit-language-imageUrl"
                  value={newLanguage.imageUrl}
                  onChange={(e) =>
                    setNewLanguage &&
                    (setNewLanguage as (language: Language) => void)({
                      ...(newLanguage as Language),
                      imageUrl: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="language-base">
              <FormattedMessage
                id="admin.lessons.baseLanguage"
                defaultMessage="Base Language"
              />
            </Label>
            <Select
              value={newLanguage.baseLanguage}
              onValueChange={(value) =>
                setNewLanguage &&
                (setNewLanguage as any)({ ...newLanguage, baseLanguage: value })
              }
            >
              <SelectTrigger id="language-base">
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "admin.lessons.selectBaseLanguage",
                    defaultMessage: "Select base language",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang._id} value={lang._id}>
                    <span className="flex items-center">
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                id="admin.lessons.baseLanguageDescription"
                defaultMessage="The base language is the language that users already know and are learning from."
              />
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="language-active"
              checked={newLanguage.isActive}
              onCheckedChange={(checked) =>
                setNewLanguage &&
                (setNewLanguage as any)({ ...newLanguage, isActive: checked })
              }
            />
            <Label htmlFor="language-active">
              <FormattedMessage
                id="admin.lessons.status.active"
                defaultMessage="Active"
              />
            </Label>
            <p className="text-xs text-muted-foreground ml-2">
              <FormattedMessage
                id="admin.lessons.inactiveLanguageNote"
                defaultMessage="Inactive languages won't be visible to users."
              />
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            onClick={onSubmit}
            disabled={(!isEdit && !newLanguage._id) || isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Save Changes"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addLanguage"
                defaultMessage="Add Language"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
