"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock data for demonstration
const MOCK_MODULES = [
  { id: "quests", name: "Quests" },
  { id: "shop", name: "Shop" },
  { id: "lessons", name: "Lessons" },
  { id: "settings", name: "Settings" },
  { id: "users", name: "Users" },
  { id: "dashboard", name: "Dashboard" },
  { id: "payments", name: "Payments" },
];

const MOCK_LANGUAGES = [
  { code: "en", name: "English", isDefault: true },
  { code: "es", name: "Spanish", isDefault: false },
  { code: "fr", name: "French", isDefault: false },
  { code: "de", name: "German", isDefault: false },
  { code: "it", name: "Italian", isDefault: false },
  { code: "ja", name: "Japanese", isDefault: false },
];

const formSchema = z.object({
  key: z
    .string()
    .min(3, {
      message: "Translation key must be at least 3 characters.",
    })
    .refine((key) => /^[a-z0-9_.]+$/.test(key), {
      message:
        "Key can only contain lowercase letters, numbers, dots, and underscores.",
    }),
  module: z.string({
    required_error: "Please select a module.",
  }),
  defaultTranslation: z.string().min(1, {
    message: "Default translation is required.",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TranslationKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editKey?: {
    id: string;
    key: string;
    module: string;
    defaultTranslation: string;
    description?: string;
  };
}

export function TranslationKeyDialog({
  open,
  onOpenChange,
  editKey,
}: TranslationKeyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: editKey?.key || "",
      module: editKey?.module || "",
      defaultTranslation: editKey?.defaultTranslation || "",
      description: editKey?.description || "",
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);

      toast(editKey ? "Translation key updated" : "Translation key created", {
        description: editKey
          ? "The translation key has been updated successfully."
          : "The translation key has been created successfully.",
      });

      form.reset();
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editKey ? "Edit Translation Key" : "Add Translation Key"}
          </DialogTitle>
          <DialogDescription>
            {editKey
              ? "Update the details for this translation key."
              : "Create a new translation key for your application."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Translation Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., user.profile.title"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use dot notation to organize keys (e.g.,
                      module.section.element)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_MODULES.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The section of the application this translation belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultTranslation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Translation (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the default translation text"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used as the fallback if other translations
                      are missing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add context or notes for translators"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context to help translators understand how this
                      text is used
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editKey
                  ? "Update Key"
                  : "Create Key"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
