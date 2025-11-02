"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  Check,
  Edit,
  GripVertical,
  Languages,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock data for demonstration
const MOCK_LANGUAGES = [
  {
    id: "1",
    code: "en",
    name: "English",
    isDefault: true,
    completionPercentage: 100,
  },
  {
    id: "2",
    code: "es",
    name: "Spanish",
    isDefault: false,
    completionPercentage: 87,
  },
  {
    id: "3",
    code: "fr",
    name: "French",
    isDefault: false,
    completionPercentage: 76,
  },
  {
    id: "4",
    code: "de",
    name: "German",
    isDefault: false,
    completionPercentage: 65,
  },
  {
    id: "5",
    code: "it",
    name: "Italian",
    isDefault: false,
    completionPercentage: 42,
  },
  {
    id: "6",
    code: "ja",
    name: "Japanese",
    isDefault: false,
    completionPercentage: 31,
  },
];

// Mock translation data for demonstration
const MOCK_TRANSLATIONS = [
  {
    id: "1",
    key: "quest.daily.title",
    module: "quests",
    translations: {
      en: "Daily Quest",
      es: "Misión diaria",
      fr: "Quête quotidienne",
      de: "Tägliche Quest",
      it: "",
      ja: "",
    },
  },
  {
    id: "2",
    key: "shop.item.purchase",
    module: "shop",
    translations: {
      en: "Purchase Item",
      es: "Comprar artículo",
      fr: "Acheter l'article",
      de: "Artikel kaufen",
      it: "Acquista articolo",
      ja: "",
    },
  },
  {
    id: "3",
    key: "lesson.complete.message",
    module: "lessons",
    translations: {
      en: "Lesson completed!",
      es: "¡Lección completada!",
      fr: "Leçon terminée !",
      de: "Lektion abgeschlossen!",
      it: "Lezione completata!",
      ja: "レッスン完了！",
    },
  },
  {
    id: "4",
    key: "settings.language.title",
    module: "settings",
    translations: {
      en: "Language Settings",
      es: "Configuración de idioma",
      fr: "Paramètres de langue",
      de: "Spracheinstellungen",
      it: "",
      ja: "",
    },
  },
  {
    id: "5",
    key: "user.profile.edit",
    module: "users",
    translations: {
      en: "Edit Profile",
      es: "Editar perfil",
      fr: "Modifier le profil",
      de: "Profil bearbeiten",
      it: "Modifica profilo",
      ja: "プロフィール編集",
    },
  },
];

const formSchema = z.object({
  code: z
    .string()
    .min(2, {
      message: "Language code must be at least 2 characters.",
    })
    .max(5)
    .refine((code) => /^[a-z]{2,5}$/.test(code), {
      message:
        "Language code must be 2-5 lowercase letters (e.g., 'en', 'es', 'fr').",
    }),
  name: z.string().min(2, {
    message: "Language name must be at least 2 characters.",
  }),
  isDefault: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface LanguageManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageManagementDialog({
  open,
  onOpenChange,
}: LanguageManagementDialogProps) {
  const [languages, setLanguages] = useState(MOCK_LANGUAGES);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTranslation, setEditingTranslation] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [translations, setTranslations] = useState(MOCK_TRANSLATIONS);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      isDefault: false,
    },
  });

  function onSubmit(values: FormValues) {
    // Check if language code already exists
    if (languages.some((lang) => lang.code === values.code)) {
      form.setError("code", {
        type: "manual",
        message: "This language code already exists.",
      });
      return;
    }

    // Add new language
    const newLanguage = {
      id: Date.now().toString(),
      code: values.code,
      name: values.name,
      isDefault: values.isDefault,
      completionPercentage: 0,
    };

    // If this is set as default, update other languages
    const updatedLanguages = languages.map((lang) => ({
      ...lang,
      isDefault: values.isDefault ? false : lang.isDefault,
    }));

    setLanguages([...updatedLanguages, newLanguage]);
    setIsAddingLanguage(false);
    form.reset();

    toast("Language added", {
      description: `${values.name} has been added to your supported languages.`,
    });
  }

  const handleSetDefault = (id: string) => {
    setLanguages(
      languages.map((lang) => ({
        ...lang,
        isDefault: lang.id === id,
      }))
    );

    toast("Default language updated", {
      description: `${
        languages.find((lang) => lang.id === id)?.name
      } is now the default language.`,
    });
  };

  const handleDeleteLanguage = (id: string) => {
    // Check if it's the default language
    const isDefault = languages.find((lang) => lang.id === id)?.isDefault;

    if (isDefault) {
      toast("Cannot delete default language", {
        description:
          "Please set another language as default before deleting this one.",
        variant: "destructive",
      });
      return;
    }

    setLanguages(languages.filter((lang) => lang.id !== id));
    setDeleteConfirmId(null);

    toast("Language deleted", {
      description: `${
        languages.find((lang) => lang.id === id)?.name
      } has been removed.`,
    });
  };

  const handleSaveTranslation = (translationId: string, langCode: string) => {
    if (editingTranslation) {
      setTranslations(
        translations.map((translation) => {
          if (translation.id === translationId) {
            return {
              ...translation,
              translations: {
                ...translation.translations,
                [langCode]: editingTranslation.value,
              },
            };
          }
          return translation;
        })
      );

      setEditingTranslation(null);

      toast("Translation updated", {
        description: "The translation has been updated successfully.",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setSelectedLanguage(null);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Languages</DialogTitle>
          <DialogDescription>
            Add, edit, or remove languages for your application.
          </DialogDescription>
        </DialogHeader>

        {selectedLanguage ? (
          // Language translations view
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {
                    languages.find((lang) => lang.code === selectedLanguage)
                      ?.name
                  }{" "}
                  Translations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Edit translations for{" "}
                  {
                    languages.find((lang) => lang.code === selectedLanguage)
                      ?.name
                  }
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedLanguage(null)}
              >
                Back to Languages
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full sm:w-[400px] grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="translated">Translated</TabsTrigger>
                <TabsTrigger value="missing">Missing</TabsTrigger>
                <TabsTrigger value="edited">Recently Edited</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 flex-1">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {translations
                      .filter(
                        (translation) =>
                          translation.key
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          translation.translations[
                            selectedLanguage as keyof typeof translation.translations
                          ]
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      )
                      .map((translation) => {
                        const isEditing =
                          editingTranslation?.id === translation.id;
                        const value =
                          translation.translations[
                            selectedLanguage as keyof typeof translation.translations
                          ] || "";
                        const isEmpty = value === "";

                        return (
                          <div
                            key={translation.id}
                            className="border rounded-md p-3 space-y-2"
                          >
                            <div className="flex justify-between">
                              <div>
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {translation.key}
                                </code>
                                <Badge variant="outline" className="ml-2">
                                  {translation.module}
                                </Badge>
                              </div>
                              {!isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditingTranslation({
                                      id: translation.id,
                                      value,
                                    })
                                  }
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </div>

                            <div className="pl-2 border-l-2 border-muted">
                              <div className="text-sm text-muted-foreground mb-1">
                                English (Default):
                              </div>
                              <div className="font-medium mb-2">
                                {translation.translations.en}
                              </div>

                              <div className="text-sm text-muted-foreground mb-1">
                                {
                                  languages.find(
                                    (lang) => lang.code === selectedLanguage
                                  )?.name
                                }
                                :
                              </div>

                              {isEditing ? (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={editingTranslation.value}
                                    onChange={(e) =>
                                      setEditingTranslation({
                                        ...editingTranslation,
                                        value: e.target.value,
                                      })
                                    }
                                    className="flex-1"
                                    autoFocus
                                  />
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSaveTranslation(
                                          translation.id,
                                          selectedLanguage
                                        )
                                      }
                                    >
                                      <Save className="h-3.5 w-3.5 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setEditingTranslation(null)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="font-medium">
                                  {isEmpty ? (
                                    <span className="text-red-500 flex items-center">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Missing translation
                                    </span>
                                  ) : (
                                    value
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="translated" className="mt-4">
                {/* Similar content as "all" but filtered for translated items */}
                <div className="text-center p-4 text-muted-foreground">
                  Showing only translated items
                </div>
              </TabsContent>

              <TabsContent value="missing" className="mt-4">
                {/* Similar content as "all" but filtered for missing translations */}
                <div className="text-center p-4 text-muted-foreground">
                  Showing only items with missing translations
                </div>
              </TabsContent>

              <TabsContent value="edited" className="mt-4">
                {/* Similar content as "all" but filtered for recently edited */}
                <div className="text-center p-4 text-muted-foreground">
                  Showing only recently edited items
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Language list view
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Language list */}
            <div className="space-y-4">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-move" />
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{language.name}</span>
                        {language.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <code className="bg-muted px-1 rounded text-xs mr-2">
                          {language.code}
                        </code>
                        <div className="flex items-center">
                          <span className="mr-2">
                            {language.completionPercentage}% complete
                          </span>
                          <div className="w-20">
                            <Progress
                              value={language.completionPercentage}
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLanguage(language.code)}
                    >
                      <Languages className="h-3.5 w-3.5 mr-1" />
                      View Translations
                    </Button>

                    {!language.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(language.id)}
                      >
                        <Star className="h-3.5 w-3.5 mr-1" />
                        Set Default
                      </Button>
                    )}

                    {deleteConfirmId === language.id ? (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLanguage(language.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteConfirmId(language.id)}
                        disabled={language.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add language form */}
            {isAddingLanguage ? (
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Add New Language</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsAddingLanguage(false);
                      form.reset();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language Code</FormLabel>
                            <FormControl>
                              <Input placeholder="en" {...field} />
                            </FormControl>
                            <FormDescription>
                              ISO code (e.g., en, es, fr)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language Name</FormLabel>
                            <FormControl>
                              <Input placeholder="English" {...field} />
                            </FormControl>
                            <FormDescription>
                              Display name for this language
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Set as Default</FormLabel>
                            <FormDescription>
                              Make this the default language for your
                              application
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit">Add Language</Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAddingLanguage(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Language
              </Button>
            )}

            {/* Information about default language */}
            <Alert>
              <Languages className="h-4 w-4" />
              <AlertTitle>About Default Language</AlertTitle>
              <AlertDescription>
                The default language is used as a fallback when translations are
                missing in other languages. It should always have 100%
                translation coverage.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={() => {
              setSelectedLanguage(null);
              onOpenChange(false);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
