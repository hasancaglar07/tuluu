"use client";

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

// Exercise types
const exerciseTypes = [
  { value: "translate", label: "Translate" },
  { value: "select", label: "Select" },
  { value: "arrange", label: "Arrange" },
  { value: "speak", label: "Speak" },
  { value: "listen", label: "Listen" },
];

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
    // Basic validation
    if (
      !newExercise.lessonId ||
      !newExercise.instruction ||
      !newExercise.sourceText ||
      !newExercise.correctAnswer[0]
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
                defaultMessage="Edit Exercise"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewExercise"
                defaultMessage="Add New Exercise"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage
              id="admin.lessons.exerciseDialogDescription"
              defaultMessage="Create a new exercise for a lesson."
            />
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Lesson Selection */}
          <div className="grid gap-2">
            <Label htmlFor="exercise-lesson">
              <FormattedMessage
                id="admin.lessons.lesson"
                defaultMessage="Lesson"
              />
            </Label>
            <Select
              value={newExercise.lessonId}
              onValueChange={(value) =>
                setNewExercise({ ...newExercise, lessonId: value })
              }
            >
              <SelectTrigger id="exercise-lesson">
                <SelectValue placeholder="Select lesson" />
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
                  defaultMessage="Exercise Type"
                />
              </Label>
              <Select
                value={newExercise.type}
                onValueChange={(value) =>
                  setNewExercise({ ...newExercise, type: value })
                }
              >
                <SelectTrigger id="exercise-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                  defaultMessage="Instruction"
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
                placeholder="e.g. Translate this sentence"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Source Language */}
            <div className="grid gap-2">
              <Label htmlFor="exercise-source-language">
                <FormattedMessage
                  id="admin.lessons.sourceLanguage"
                  defaultMessage="Source Language"
                />
              </Label>
              <Select
                value={newExercise.sourceLanguage}
                onValueChange={(value) =>
                  setNewExercise({ ...newExercise, sourceLanguage: value })
                }
              >
                <SelectTrigger id="exercise-source-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Language */}
            <div className="grid gap-2">
              <Label htmlFor="exercise-target-language">
                <FormattedMessage
                  id="admin.lessons.targetLanguage"
                  defaultMessage="Target Language"
                />
              </Label>
              <Select
                value={newExercise.targetLanguage}
                onValueChange={(value) =>
                  setNewExercise({ ...newExercise, targetLanguage: value })
                }
              >
                <SelectTrigger id="exercise-target-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source Text */}
          <div className="grid gap-2">
            <Label htmlFor="exercise-source-text">
              <FormattedMessage
                id="admin.lessons.sourceText"
                defaultMessage="Source Text"
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
              placeholder="e.g. Hello"
            />
          </div>

          {/* Correct Answers */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>
                <FormattedMessage
                  id="admin.lessons.correctAnswers"
                  defaultMessage="Correct Answers"
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
                  placeholder={`Answer ${index + 1}`}
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
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>
                <FormattedMessage
                  id="admin.lessons.optionsForSelect"
                  defaultMessage="Options (for select and translate)"
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
                  placeholder={`Option ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Audio URL */}
          <div className="grid gap-2">
            <Label htmlFor="exercise-audio">
              <FormattedMessage
                id="admin.lessons.audioUrl"
                defaultMessage="Audio URL (optional)"
              />
            </Label>
            <Input
              id="exercise-audio"
              value={newExercise.audioUrl}
              onChange={(e) =>
                setNewExercise({ ...newExercise, audioUrl: e.target.value })
              }
              placeholder="e.g. http://example.com/audio.mp3"
            />
          </div>

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
                defaultMessage="Mark as New Word"
              />
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !newExercise.lessonId ||
              !newExercise.instruction ||
              !newExercise.sourceText ||
              !newExercise.correctAnswer[0] ||
              isLoading
            }
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Save Changes"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addExercise"
                defaultMessage="Add Exercise"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
