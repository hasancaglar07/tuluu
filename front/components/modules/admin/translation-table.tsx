"use client";

import { useState } from "react";
import { Edit, Save, X, AlertCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock data for demonstration
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
  {
    id: "6",
    key: "dashboard.stats.title",
    module: "dashboard",
    translations: {
      en: "Statistics Overview",
      es: "Resumen de estadísticas",
      fr: "Aperçu des statistiques",
      de: "",
      it: "",
      ja: "",
    },
  },
  {
    id: "7",
    key: "payment.success.message",
    module: "payments",
    translations: {
      en: "Payment successful!",
      es: "¡Pago exitoso!",
      fr: "Paiement réussi !",
      de: "Zahlung erfolgreich!",
      it: "Pagamento riuscito!",
      ja: "",
    },
  },
  {
    id: "8",
    key: "quest.weekly.title",
    module: "quests",
    translations: {
      en: "Weekly Challenge",
      es: "Desafío semanal",
      fr: "Défi hebdomadaire",
      de: "Wöchentliche Herausforderung",
      it: "",
      ja: "",
    },
  },
  {
    id: "9",
    key: "shop.currency.gems",
    module: "shop",
    translations: {
      en: "Gems",
      es: "Gemas",
      fr: "Gemmes",
      de: "Edelsteine",
      it: "Gemme",
      ja: "ジェム",
    },
  },
  {
    id: "10",
    key: "lesson.start.button",
    module: "lessons",
    translations: {
      en: "Start Lesson",
      es: "Comenzar lección",
      fr: "Commencer la leçon",
      de: "Lektion starten",
      it: "Inizia lezione",
      ja: "レッスンを開始",
    },
  },
];

const MOCK_LANGUAGES = [
  { code: "en", name: "English", isDefault: true },
  { code: "es", name: "Spanish", isDefault: false },
  { code: "fr", name: "French", isDefault: false },
  { code: "de", name: "German", isDefault: false },
  { code: "it", name: "Italian", isDefault: false },
  { code: "ja", name: "Japanese", isDefault: false },
];

interface TranslationTableProps {
  searchQuery: string;
  selectedModule: string;
  selectedLanguage: string;
  showMissingOnly: boolean;
}

export function TranslationTable({
  searchQuery,
  selectedModule,
  selectedLanguage,
  showMissingOnly,
}: TranslationTableProps) {
  const [editingCell, setEditingCell] = useState<{
    id: string;
    lang: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [translations, setTranslations] = useState(MOCK_TRANSLATIONS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  // Filter translations based on search query, selected module, and missing flag
  const filteredTranslations = translations.filter((translation) => {
    // Filter by search query
    const matchesSearch =
      translation.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(translation.translations).some(
        (value) =>
          value && value.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Filter by module
    const matchesModule =
      selectedModule === "all" || translation.module === selectedModule;

    // Filter by language
    const matchesLanguage =
      selectedLanguage === "all" ||
      (selectedLanguage !== "all" &&
        translation.translations[
          selectedLanguage as keyof typeof translation.translations
        ] === "" &&
        showMissingOnly) ||
      !showMissingOnly;

    // Filter by missing translations
    const hasMissingTranslations =
      !showMissingOnly ||
      Object.values(translation.translations).some((value) => value === "");

    return (
      matchesSearch &&
      matchesModule &&
      matchesLanguage &&
      hasMissingTranslations
    );
  });

  const handleEditStart = (id: string, lang: string, value: string) => {
    setEditingCell({ id, lang });
    setEditValue(value);
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleEditSave = (id: string, lang: string) => {
    // In a real implementation, this would save to the backend
    setTranslations(
      translations.map((translation) => {
        if (translation.id === id) {
          return {
            ...translation,
            translations: {
              ...translation.translations,
              [lang]: editValue,
            },
          };
        }
        return translation;
      })
    );

    setEditingCell(null);
    setEditValue("");

    toast("Translation updated", {
      description: "The translation has been updated successfully.",
    });
  };

  const handleDeleteClick = (id: string) => {
    setKeyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (keyToDelete) {
      // In a real implementation, this would delete from the backend
      setTranslations(translations.filter((t) => t.id !== keyToDelete));

      toast("Translation key deleted", {
        description: "The translation key has been deleted successfully.",
      });

      setDeleteDialogOpen(false);
      setKeyToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Key</TableHead>
              <TableHead>Module</TableHead>
              {MOCK_LANGUAGES.map((language) => (
                <TableHead key={language.code}>
                  {language.name}
                  {language.isDefault && (
                    <Badge variant="outline" className="ml-2">
                      Default
                    </Badge>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={MOCK_LANGUAGES.length + 3}
                  className="h-24 text-center"
                >
                  No translations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((translation) => (
                <TableRow key={translation.id}>
                  <TableCell className="font-mono text-sm">
                    {translation.key}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{translation.module}</Badge>
                  </TableCell>
                  {MOCK_LANGUAGES.map((language) => {
                    const isEditing =
                      editingCell?.id === translation.id &&
                      editingCell?.lang === language.code;

                    const value =
                      translation.translations[
                        language.code as keyof typeof translation.translations
                      ] || "";
                    const isEmpty = value === "";

                    return (
                      <TableCell key={language.code} className="relative">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleEditSave(translation.id, language.code)
                                }
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={handleEditCancel}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            {isEmpty ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-red-500 flex items-center">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Missing
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This translation is missing</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span>{value}</span>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleEditStart(
                                  translation.id,
                                  language.code,
                                  value
                                )
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteClick(translation.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Translation Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this translation key? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
