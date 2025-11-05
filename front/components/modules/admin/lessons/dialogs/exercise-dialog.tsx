"use client";

import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { exerciseTypes } from "@/types";

const optionSupportedTypes = exerciseTypes
  .filter(({ supportsOptions }) => supportsOptions)
  .map(({ value }) => value);
const audioSupportedTypes = exerciseTypes
  .filter(({ supportsAudio }) => supportsAudio)
  .map(({ value }) => value);
import type { Language } from "@/types/lessons";

// Define the form type for new exercises
export interface NewExerciseForm {
  _id: string;
  lessonId: string;
  type: string;
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
}

interface ExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newExercise: NewExerciseForm;
  setNewExercise: (exercise: NewExerciseForm) => void;
  currentLanguage?: Language;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  isEdit: boolean;
}

// Languages for exercises
const exerciseLanguages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "tr", label: "Turkish" },
  { value: "hi", label: "Hindi" },
];

const formatLanguageLabel = (code: string) => {
  if (!code) return "-";
  const normalized = code.toLowerCase();
  const match = exerciseLanguages.find((lang) => lang.value === normalized);
  return match ? `${match.label} (${normalized.toUpperCase()})` : normalized.toUpperCase();
};

/**
 * Exercise Dialog Component
 *
 * Dialog for creating and editing exercises within lessons.
 * Includes complex form fields for different exercise types.
 *
 * Features:
 * - Lesson selection from hierarchical structure
 * - Exercise type selection
 * - Source and target language configuration
 * - Multiple correct answers support
 * - Options management for multiple choice
 * - Audio and image URL inputs
 * - New word marking
 * - Dynamic form fields based on exercise type
 */
export function ExerciseDialog({
  isOpen,
  onClose,
  newExercise,
  setNewExercise,
  currentLanguage,
  onSubmit,
  isLoading,
  isEdit,
}: ExerciseDialogProps) {
  const resolvedSourceLanguage =
    currentLanguage?.baseLanguage ?? newExercise.sourceLanguage;
  const resolvedTargetLanguage =
    currentLanguage?.locale ?? currentLanguage?.baseLanguage ?? newExercise.targetLanguage;

  useEffect(() => {
    if (!isOpen || isEdit) {
      return;
    }

    const source = currentLanguage?.baseLanguage ?? "";
    const target =
      currentLanguage?.locale ?? currentLanguage?.baseLanguage ?? "";

    if (
      (source && source !== newExercise.sourceLanguage) ||
      (target && target !== newExercise.targetLanguage)
    ) {
      setNewExercise({
        ...newExercise,
        sourceLanguage: source || newExercise.sourceLanguage,
        targetLanguage: target || newExercise.targetLanguage,
      });
    }
  }, [
    isOpen,
    isEdit,
    currentLanguage?.baseLanguage,
    currentLanguage?.locale,
    newExercise,
    setNewExercise,
  ]);

  /**
   * Helper function to update correct answer array
   */
  const updateCorrectAnswer = (index: number, value: string) => {
    const updatedAnswers = [...newExercise.correctAnswer];
    updatedAnswers[index] = value;
    setNewExercise({ ...newExercise, correctAnswer: updatedAnswers });
  };

  /**
   * Helper function to add a new correct answer field
   */
  const addCorrectAnswer = () => {
    setNewExercise({
      ...newExercise,
      correctAnswer: [...newExercise.correctAnswer, ""],
    });
  };

  /**
   * Helper function to remove a correct answer field
   */
  const removeCorrectAnswer = (index: number) => {
    const updatedAnswers = [...newExercise.correctAnswer];
    updatedAnswers.splice(index, 1);
    setNewExercise({
      ...newExercise,
      correctAnswer: updatedAnswers.length ? updatedAnswers : [""],
    });
  };

  /**
   * Helper function to update option array
   */
  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newExercise.options];
    updatedOptions[index] = value;
    setNewExercise({ ...newExercise, options: updatedOptions });
  };

  /**
   * Helper function to add a new option
   */
  const addOption = () => {
    setNewExercise({
      ...newExercise,
      options: [...newExercise.options, ""],
    });
  };

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    const requiresOptions = optionSupportedTypes.includes(newExercise.type);
    const hasOptions = (newExercise.options ?? []).some(
      (option) => (option ?? "").trim().length > 0
    );
    const requiresAudio = audioSupportedTypes.includes(newExercise.type);

    if (
      !newExercise.lessonId ||
      !newExercise.instruction ||
      !newExercise.sourceText ||
      !newExercise.correctAnswer[0] ||
      (requiresOptions && !hasOptions) ||
      (requiresAudio && !newExercise.audioUrl.trim())
    ) {
      return;
    }
    await onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[900px] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editExercise"
                defaultMessage="Egzersizi Düzenle"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewExercise"
                defaultMessage="Yeni Egzersiz Ekle"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="admin.lessons.exerciseDialogDescription"
              defaultMessage="Bir ders için yeni egzersiz oluştur."
            />
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Lesson Selection */}
          <div className="grid gap-2">
            <Label htmlFor="exercise-lesson">
              <FormattedMessage
                id="admin.lessons.lesson"
                defaultMessage="Ders"
              />
            </Label>
            <Select
              value={newExercise.lessonId}
              onValueChange={(value) =>
                setNewExercise({ ...newExercise, lessonId: value })
              }
            >
              <SelectTrigger id="exercise-lesson">
                <SelectValue placeholder="Ders seçin" />
              </SelectTrigger>
              <SelectContent>
                {currentLanguage &&
                  currentLanguage.chapters.flatMap((chapter) =>
                    chapter.units.flatMap((unit) =>
                      unit.lessons.map((lesson) => (
                        <SelectItem
                          key={`${chapter._id}-${unit._id}-${lesson._id}`}
                          value={`${chapter._id}-${unit._id}-${lesson._id}`}
                        >
                          {chapter.title} → {unit.title} → {lesson.title}
                        </SelectItem>
                      ))
                    )
                  )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Exercise Type */}
            <div className="grid gap-2">
              <Label htmlFor="exercise-type">
                <FormattedMessage
                  id="admin.lessons.exerciseType"
                  defaultMessage="Egzersiz Türü"
                />
              </Label>
              <Select
                value={newExercise.type}
                onValueChange={(value) =>
                  setNewExercise({ ...newExercise, type: value })
                }
              >
                <SelectTrigger id="exercise-type">
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseTypes.map(({ value, labelKey, defaultMessage }) => (
                    <SelectItem key={value} value={value}>
                      <FormattedMessage
                        id={labelKey}
                        defaultMessage={defaultMessage}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instruction */}
            <div className="grid gap-2">
              <Label htmlFor="exercise-instruction">
                <FormattedMessage
                  id="admin.lessons.instruction"
                  defaultMessage="Yönerge"
                />
              </Label>
              <Input
                id="exercise-instruction"
                value={newExercise.instruction}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    instruction: e.target.value,
                  })
                }
                placeholder="örn. Bu cümleyi çevirin"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Source Language */}
            <div className="grid gap-2">
              <Label htmlFor="exercise-source-language">
                <FormattedMessage
                  id="admin.lessons.sourceLanguage"
                  defaultMessage="Kaynak Dil"
                />
              </Label>
              <Input
                id="exercise-source-language"
                value={formatLanguageLabel(resolvedSourceLanguage || "")}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="admin.lessons.languageAutoHint"
                  defaultMessage="Program dil ayarından otomatik alınır."
                />
              </p>
            </div>

            {/* Target Language */}
            <div className="grid gap-2">
              <Label htmlFor="exercise-target-language">
                <FormattedMessage
                  id="admin.lessons.targetLanguage"
                  defaultMessage="Hedef Dil"
                />
              </Label>
              <Input
                id="exercise-target-language"
                value={formatLanguageLabel(resolvedTargetLanguage || "")}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="admin.lessons.languageAutoHint"
                  defaultMessage="Program dil ayarından otomatik alınır."
                />
              </p>
            </div>
          </div>

          {/* Source Text */}
          <div className="grid gap-2">
            <Label htmlFor="exercise-source-text">
              <FormattedMessage
                id="admin.lessons.sourceText"
                defaultMessage="Kaynak Metin"
              />
            </Label>
            <Input
              id="exercise-source-text"
              value={newExercise.sourceText}
              onChange={(e) =>
                setNewExercise({
                  ...newExercise,
                  sourceText: e.target.value,
                })
              }
              placeholder="örn. Merhaba"
            />
          </div>

          {/* Correct Answers */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>
                <FormattedMessage
                  id="admin.lessons.correctAnswers"
                  defaultMessage="Doğru Cevaplar"
                />
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCorrectAnswer}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {newExercise.correctAnswer.map((answer, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={answer}
                  onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                  placeholder={`Cevap ${index + 1}`}
                />
                {newExercise.correctAnswer.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCorrectAnswer(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Options for multiple choice */}
          {optionSupportedTypes.includes(newExercise.type) && (
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>
                  <FormattedMessage
                    id="admin.lessons.optionsForSelect"
                    defaultMessage="Seç & çevir için seçenekler"
                  />
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {newExercise.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Seçenek ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Audio URL */}
          {audioSupportedTypes.includes(newExercise.type) && (
            <div className="grid gap-2">
              <Label htmlFor="exercise-audio">
                <FormattedMessage
                  id="admin.lessons.audioUrl"
                  defaultMessage="Ses URL'si (opsiyonel)"
                />
              </Label>
              <Input
                id="exercise-audio"
                value={newExercise.audioUrl}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, audioUrl: e.target.value })
                }
                placeholder="örn. http://ornek.com/ses.mp3"
              />
            </div>
          )}

          {/* New Word Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="exercise-new-word"
              checked={newExercise.isNewWord}
              onCheckedChange={(checked) =>
                setNewExercise({ ...newExercise, isNewWord: checked })
              }
            />
            <Label htmlFor="exercise-new-word">
                <FormattedMessage
                  id="admin.lessons.markAsNewWord"
                  defaultMessage="Yeni Kelime Olarak İşaretle"
                />
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Vazgeç"
            />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !newExercise.lessonId ||
              !newExercise.instruction ||
              !newExercise.sourceText ||
              !newExercise.correctAnswer[0] ||
              (optionSupportedTypes.includes(newExercise.type) &&
                (newExercise.options ?? []).every(
                  (option) => !(option ?? "").trim()
                )) ||
              (audioSupportedTypes.includes(newExercise.type) &&
                !newExercise.audioUrl.trim()) ||
              isLoading
            }
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Değişiklikleri Kaydet"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addExercise"
                defaultMessage="Egzersiz Ekle"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
