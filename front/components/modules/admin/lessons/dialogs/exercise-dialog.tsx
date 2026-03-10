"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { upload as uploadBlob } from "@vercel/blob/client";
import { exerciseTypes } from "@/types";
import type { MoralValue } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { detectMediaKind } from "@/lib/media";

const DISABLED_EXERCISE_TYPES = new Set(["listen", "education_audio"]);
const PASSIVE_COMPONENT_TYPES = new Set(["listening_challenge"]);

const optionSupportedTypes = exerciseTypes
  .filter(({ value }) => !DISABLED_EXERCISE_TYPES.has(value))
  .filter(({ supportsOptions }) => supportsOptions)
  .map(({ value }) => value);
const audioSupportedTypes = exerciseTypes
  .filter(({ value }) => !DISABLED_EXERCISE_TYPES.has(value))
  .filter(({ supportsAudio }) => supportsAudio)
  .map(({ value }) => value);
import type { Language } from "@/types/lessons";

type AssetKind = "image" | "audio" | "video";
type RecentAsset = {
  url: string;
  kind: AssetKind;
  at: number;
};

const isAssetKind = (value: unknown): value is AssetKind =>
  value === "image" || value === "audio" || value === "video";

const isRecentAsset = (value: unknown): value is RecentAsset => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    url?: unknown;
    kind?: unknown;
    at?: unknown;
  };

  return (
    typeof candidate.url === "string" &&
    isAssetKind(candidate.kind) &&
    typeof candidate.at === "number"
  );
};

// Define the form type for new exercises
export interface NewExerciseForm {
  _id: string;
  lessonId: string;
  type: string;
  componentType:
    | "learning_card"
    | "moral_story"
    | "multiple_choice"
    | "listening_challenge"
    | "matching_board"
    | "arrange_builder"
    | "puzzle_board"
    | "focus_breathing";
  moralValue: MoralValue;
  valuePoints: number;
  questionPreview: string;
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
  educationContent?: unknown;
  mediaPack?: {
    idleAnimationUrl?: string;
    successAnimationUrl?: string;
    failAnimationUrl?: string;
    characterName?: string;
  };
  hoverHint?: {
    text?: string;
    audioUrl?: string;
  };
  answerAudioUrl?: string;
  ttsVoiceId?: string;
  autoRevealMilliseconds?: number | null;
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

const COMPONENT_OPTIONS: Array<{
  value: NewExerciseForm["componentType"];
  label: string;
}> = [
  { value: "learning_card", label: "Öğretim Kartı" },
  { value: "moral_story", label: "Moral Story" },
  { value: "multiple_choice", label: "Çoktan Seçmeli" },
  { value: "listening_challenge", label: "Dinleme Görevi" },
  { value: "matching_board", label: "Eşleştirme Tahtası" },
  { value: "arrange_builder", label: "Sıralama Kurucu" },
  { value: "puzzle_board", label: "Puzzle Tahtası" },
  { value: "focus_breathing", label: "Nefes/Odak Egzersizi" },
];

const EXERCISE_TYPE_HINTS: Record<
  string,
  { id: string; defaultMessage: string }
> = {
  education_image_intro: {
    id: "admin.lessons.exerciseTypeHint.education_image_intro",
    defaultMessage:
      "Konuya giriş için 3 kartlık görsel bir akış gösterir; soru beklemeden öğretir.",
  },
  education_visual: {
    id: "admin.lessons.exerciseTypeHint.education_visual",
    defaultMessage:
      "Bir kavramı görsel ve kısa metinle açıklar; öğrenme odaklıdır.",
  },
  education_video: {
    id: "admin.lessons.exerciseTypeHint.education_video",
    defaultMessage:
      "Videoyla anlatım yapar; kullanıcı önce izler, sonra alıştırmaya geçer.",
  },
  education_audio: {
    id: "admin.lessons.exerciseTypeHint.education_audio",
    defaultMessage:
      "Ses kaydı üzerinden öğretir; dinleme temelli anlatım sunar.",
  },
  education_tip: {
    id: "admin.lessons.exerciseTypeHint.education_tip",
    defaultMessage:
      "Kısa hatırlatma veya püf noktası kartı gösterir.",
  },
  translate: {
    id: "admin.lessons.exerciseTypeHint.translate",
    defaultMessage:
      "Verilen metni hedef dile çevirtir. Dil üretimi ve anlam kurmayı ölçer.",
  },
  select: {
    id: "admin.lessons.exerciseTypeHint.select",
    defaultMessage:
      "Doğru seçeneği seçtirir. Hızlı kavrama ve ayrım yapmayı ölçer.",
  },
  arrange: {
    id: "admin.lessons.exerciseTypeHint.arrange",
    defaultMessage:
      "Kelimeleri doğru sıraya dizer. Cümle yapısını pekiştirir.",
  },
  match: {
    id: "admin.lessons.exerciseTypeHint.match",
    defaultMessage:
      "İki öğeyi eşleştirir (kelime-anlam gibi). Kavram bağlantısını güçlendirir.",
  },
  listen: {
    id: "admin.lessons.exerciseTypeHint.listen",
    defaultMessage:
      "Ses dinletip doğru yanıtı ister. Dinleme ve anlama becerisini ölçer.",
  },
};

const MORAL_VALUE_OPTIONS: MoralValue[] = [
  "patience",
  "gratitude",
  "kindness",
  "honesty",
  "sharing",
  "mercy",
  "justice",
  "respect",
];

const componentTypeByExerciseType = (
  type: string
): NewExerciseForm["componentType"] => {
  if (DISABLED_EXERCISE_TYPES.has(type)) {
    return "learning_card";
  }
  if (type === "education_visual" || type === "education_video" || type === "education_image_intro") {
    return "learning_card";
  }
  if (type === "education_tip") {
    return "moral_story";
  }
  if (type === "match") {
    return "matching_board";
  }
  if (type === "arrange") {
    return "arrange_builder";
  }
  return "multiple_choice";
};

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
  const intl = useIntl();
  const [uploading, setUploading] = useState<{ fieldId: string | null; fileName: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showBulkOptions, setShowBulkOptions] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [simpleMode, setSimpleMode] = useState(true);

  const resolvedSourceLanguage =
    currentLanguage?.baseLanguage ?? newExercise.sourceLanguage;
  const resolvedTargetLanguage =
    currentLanguage?.locale ?? currentLanguage?.baseLanguage ?? newExercise.targetLanguage;

  const isEducationType = useMemo(() => newExercise.type?.startsWith("education_"), [newExercise.type]);
  const selectedTypeHint = EXERCISE_TYPE_HINTS[newExercise.type];

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

  // Initialize skeleton education content when type switches
  useEffect(() => {
    if (!isOpen) return;
    if (!isEducationType) return;
    if (newExercise.educationContent) return;
    let skeleton: Record<string, unknown> = {};
    switch (newExercise.type) {
      case "education_image_intro":
        skeleton = {
          title: "",
          subtitle: "",
          cards: [
            { imageUrl: "", text: "", audioUrl: "" },
            { imageUrl: "", text: "", audioUrl: "" },
            { imageUrl: "", text: "", audioUrl: "" },
          ],
          showContinueButton: true,
        };
        break;
      case "education_visual":
        skeleton = {
          title: "",
          imageUrl: "",
          description: "",
          narrationAudioUrl: "",
          notes: "",
          gallery: [],
        };
        break;
      case "education_video":
        skeleton = {
          title: "",
          videoUrl: "",
          coverImageUrl: "",
          captions: "",
          autoplay: false,
        };
        break;
      case "education_audio":
        skeleton = {
          title: "",
          instructionText: "",
          audioUrl: "",
          contentText: "",
          repeatCount: 1,
        };
        break;
      case "education_tip":
        skeleton = {
          tipType: "note",
          title: "",
          content: "",
          sampleAudioUrl: "",
          backgroundColor: "",
        };
        break;
    }
    setNewExercise({ ...newExercise, educationContent: skeleton });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEducationType, newExercise.type]);

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

  const updateMediaPack = (field: string, value: string) => {
    setNewExercise({
      ...newExercise,
      mediaPack: {
        ...(newExercise.mediaPack ?? {}),
        [field]: value,
      },
    });
  };

  const updateHoverHint = (field: "text" | "audioUrl", value: string) => {
    setNewExercise({
      ...newExercise,
      hoverHint: {
        ...(newExercise.hoverHint ?? {}),
        [field]: value,
      },
    });
  };

  const visualGallery = Array.isArray(newExercise.educationContent?.gallery)
    ? (newExercise.educationContent?.gallery as string[])
    : [];

  const setVisualGallery = (next: string[]) => {
    setNewExercise({
      ...newExercise,
      educationContent: {
        ...(newExercise.educationContent || {}),
        gallery: next,
      },
    });
  };

  const updateVisualGallery = (index: number, value: string) => {
    const next = [...visualGallery];
    next[index] = value;
    setVisualGallery(next);
  };

  const addVisualGalleryItem = () => {
    if (visualGallery.length >= 4) return;
    setVisualGallery([...visualGallery, ""]);
  };

  const removeVisualGalleryItem = (index: number) => {
    const next = [...visualGallery];
    next.splice(index, 1);
    setVisualGallery(next);
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

  const removeOption = (index: number) => {
    const updatedOptions = [...newExercise.options];
    updatedOptions.splice(index, 1);
    setNewExercise({
      ...newExercise,
      options: updatedOptions.length ? updatedOptions : [""],
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

    if (!newExercise.lessonId) return;

    if (!isEducationType) {
      if (
        !newExercise.instruction ||
        !newExercise.sourceText ||
        !newExercise.correctAnswer[0] ||
        (requiresOptions && !hasOptions) ||
        (requiresAudio && !newExercise.audioUrl.trim())
      ) {
        return;
      }
    } else {
      if (!newExercise.educationContent) return;
    }
    await onSubmit();
  };

  // Recent assets helper
  const saveRecentAsset = (url: string, kind: 'image' | 'audio' | 'video') => {
    try {
      const key = 'tulu_recent_assets';
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      const arr: RecentAsset[] = Array.isArray(parsed)
        ? parsed.filter(isRecentAsset)
        : [];
      arr.unshift({ url, kind, at: Date.now() });
      const unique = Array.from(new Map(arr.map((item) => [item.url, item])).values()).slice(0, 60);
      window.localStorage.setItem(key, JSON.stringify(unique));
    } catch {}
  };

  // Upload helper using Vercel Blob Signed URL
  const uploadFile = async (file: File, fieldId?: string): Promise<string> => {
    setUploading({ fieldId: fieldId ?? null, fileName: file.name });
    setUploadProgress(10);
    const { url } = await uploadBlob(`admin/${Date.now()}-${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload-url",
    });
    setUploadProgress(100);
    setUploading(null);
    const mime = (file.type || '').toLowerCase();
    const kind: AssetKind = mime.startsWith('image/')
      ? 'image'
      : mime.startsWith('audio/')
        ? 'audio'
        : 'video';
    saveRecentAsset(url, kind);
    return url;
  };

  function UploadInput({
    id,
    label,
    accept,
    value,
    onChange,
    placeholder,
    helperText,
    variant = "default",
  }: {
    id: string;
    label?: string;
    accept: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    helperText?: string;
    variant?: "default" | "inline";
  }) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [isPickerOpen, setPickerOpen] = useState(false);
    const acceptType: AssetKind = accept.startsWith("audio")
      ? "audio"
      : accept.startsWith("video")
        ? "video"
        : "image";
    const previewKind = detectMediaKind(value);
    const showLabel = variant !== "inline" && !!label;
    const wrapperClasses =
      variant === "inline"
        ? "flex flex-1 items-center gap-2 border rounded-2xl px-3 py-2 bg-white shadow-sm min-h-[56px]"
        : "flex flex-wrap gap-2 items-center border rounded-xl p-3 bg-muted/30";
    const inputClasses =
      variant === "inline" ? "flex-1 min-w-0" : "flex-1 min-w-[180px]";
    return (
      <div className="grid gap-2 w-full">
        {showLabel && <Label htmlFor={id}>{label}</Label>}
        <div
          className={wrapperClasses}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={async (e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (!f) return;
            const url = await uploadFile(f, id);
            onChange(url);
          }}
        >
          <Input
            id={id}
            className={inputClasses}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={label}
          />
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadFile(f, id);
              onChange(url);
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" /> Yükle
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPickerOpen(true)}
            >
              Kütüphane
            </Button>
          </div>
          {value && previewKind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="w-14 h-14 rounded object-cover border shrink-0"
            />
          )}
          {value && previewKind === "audio" && (
            <audio className="h-10 min-w-[160px]" controls src={value} />
          )}
          {value && previewKind === "video" && (
            <video className="w-32 h-20 rounded" controls src={value} />
          )}
        </div>
        {helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {uploading?.fieldId === id && (
          <div className="flex items-center gap-2">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <span className="text-xs text-muted-foreground">
              {uploadProgress}%
            </span>
          </div>
        )}
        {isPickerOpen && (
          <AssetPicker
            kind={acceptType}
            onClose={() => setPickerOpen(false)}
            onSelect={(url) => { onChange(url); setPickerOpen(false); }}
            onAddRecent={(url) => saveRecentAsset(url, acceptType)}
          />
        )}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
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

        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
          <span>{simpleMode ? "Hızlı Mod" : "Gelişmiş Mod"}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSimpleMode((prev) => !prev)}
          >
            {simpleMode ? "Gelişmiş Alanları Aç" : "Hızlı Moda Dön"}
          </Button>
        </div>

        <div className="grid gap-4 py-4">
          {/* Lesson Selection (only when language context provided) */}
          {currentLanguage && (
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
                  <SelectValue placeholder={intl.formatMessage({
                    id: "admin.lessons.placeholder.selectLesson",
                    defaultMessage: "Ders seçin"
                  })} />
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
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  setNewExercise({
                    ...newExercise,
                    type: value,
                    componentType: componentTypeByExerciseType(value),
                  })
                }
              >
                <SelectTrigger id="exercise-type">
                  <SelectValue placeholder={intl.formatMessage({
                    id: "admin.lessons.placeholder.selectType",
                    defaultMessage: "Tür seçin"
                  })} />
                </SelectTrigger>
                <SelectContent>
                  {exerciseTypes.map(({ value, labelKey, defaultMessage }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      disabled={DISABLED_EXERCISE_TYPES.has(value)}
                    >
                      <FormattedMessage
                        id={labelKey}
                        defaultMessage={defaultMessage}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTypeHint ? (
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id={selectedTypeHint.id}
                    defaultMessage={selectedTypeHint.defaultMessage}
                  />
                </p>
              ) : null}
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
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.instruction",
                  defaultMessage: "örn. Bu cümleyi çevirin"
                })}
              />
            </div>
          </div>

          {!isEducationType && !simpleMode && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="exercise-component-type">Bileşen Tipi</Label>
              <Select
                value={newExercise.componentType}
                onValueChange={(value) =>
                  setNewExercise({
                    ...newExercise,
                    componentType: value as NewExerciseForm["componentType"],
                  })
                }
              >
                <SelectTrigger id="exercise-component-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={PASSIVE_COMPONENT_TYPES.has(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                İçerik yöneticisi sorunun ekranda hangi component ile gösterileceğini burada işaretler.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exercise-moral-value">Temsil Ettiği Değer</Label>
              <Select
                value={newExercise.moralValue}
                onValueChange={(value) =>
                  setNewExercise({
                    ...newExercise,
                    moralValue: value as MoralValue,
                  })
                }
              >
                <SelectTrigger id="exercise-moral-value">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MORAL_VALUE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          {!isEducationType && !simpleMode && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="exercise-value-points">Değer Puanı</Label>
                <Input
                  id="exercise-value-points"
                  type="number"
                  min={0}
                  value={newExercise.valuePoints}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      valuePoints: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exercise-preview">Soru Önizleme Metni</Label>
                <Input
                  id="exercise-preview"
                  value={newExercise.questionPreview}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      questionPreview: e.target.value,
                    })
                  }
                  placeholder="Örn. Bu soruda çocuk dinlediğini bulacak."
                />
              </div>
            </div>
          )}

          {!isEducationType && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          )}

          {!isEducationType && (
            <UploadInput
              id="exercise-source-text"
              label={intl.formatMessage({
                id: "admin.lessons.sourceText",
                defaultMessage: "Kaynak Metin",
              })}
              accept="image/*"
              value={newExercise.sourceText}
              onChange={(value) =>
                setNewExercise({
                  ...newExercise,
                  sourceText: value,
                })
              }
              placeholder={intl.formatMessage({
                id: "admin.lessons.placeholder.sourceText",
                defaultMessage: "örn. Merhaba",
              })}
              helperText={intl.formatMessage({
                id: "admin.lessons.helper.mediaField",
                defaultMessage: "Metin yazabilir veya görsel yükleyebilirsin.",
              })}
            />
          )}

          {!isEducationType && (
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
                <div key={index} className="flex gap-2 items-start">
                  <UploadInput
                    id={`correct-answer-${index}`}
                    label={intl.formatMessage({
                      id: "admin.lessons.placeholder.answer",
                      defaultMessage: "Cevap {number}",
                    }, { number: index + 1 })}
                    accept="image/*"
                    value={answer}
                    variant="inline"
                    onChange={(value) => updateCorrectAnswer(index, value)}
                    placeholder={intl.formatMessage({
                      id: "admin.lessons.placeholder.answer",
                      defaultMessage: "Cevap {number}",
                    }, { number: index + 1 })}
                    helperText={
                      index === 0
                        ? intl.formatMessage({
                            id: "admin.lessons.helper.mediaField",
                            defaultMessage:
                              "Metin yazabilir veya görsel yükleyebilirsin.",
                          })
                        : undefined
                    }
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
          )}

          {/* Options for multiple choice */}
          {!isEducationType && optionSupportedTypes.includes(newExercise.type) && (
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>
                  <FormattedMessage
                    id="admin.lessons.optionsForSelect"
                    defaultMessage="Seç & çevir için seçenekler"
                  />
                </Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={()=> setShowBulkOptions((s)=>!s)}>
                    Toplu Yapıştır
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showBulkOptions && (
                <div className="grid gap-2 border rounded-md p-2 bg-muted/30">
                  <Label>Her satıra bir seçenek (virgül de desteklenir)</Label>
                  <Textarea value={bulkText} onChange={(e)=> setBulkText(e.target.value)} placeholder="Seçenek 1\nSeçenek 2\nSeçenek 3"/>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={()=> setShowBulkOptions(false)}>İptal</Button>
                    <Button size="sm" onClick={()=>{
                      const parts = bulkText.split(/\n|,/).map(t=>t.trim()).filter(Boolean);
                      if (parts.length){ setNewExercise({ ...newExercise, options: parts }); }
                      setShowBulkOptions(false);
                    }}>Uygula</Button>
                  </div>
                </div>
              )}

              {newExercise.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <UploadInput
                    id={`exercise-option-${index}`}
                    label={intl.formatMessage({
                      id: "admin.lessons.placeholder.option",
                      defaultMessage: "Seçenek {number}",
                    }, { number: index + 1 })}
                    accept="image/*"
                    value={option}
                    variant="inline"
                    onChange={(value) => updateOption(index, value)}
                    placeholder={intl.formatMessage({
                      id: "admin.lessons.placeholder.option",
                      defaultMessage: "Seçenek {number}",
                    }, { number: index + 1 })}
                  />
                  {newExercise.options.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Audio URL or Upload */}
          {!isEducationType && audioSupportedTypes.includes(newExercise.type) && (
            <UploadInput
              id="exercise-audio"
              label="Ses URL'si veya Yükle"
              accept="audio/*"
              value={newExercise.audioUrl}
              onChange={(v) => setNewExercise({ ...newExercise, audioUrl: v })}
              placeholder={intl.formatMessage({
                id: "admin.lessons.placeholder.audioUrl",
                defaultMessage: "örn. https://.../audio.mp3"
              })}
            />
          )}

          {/* Media Uploads for feedback images */}
          {!isEducationType && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UploadInput
                id="neutral-image"
                label="Nötr Cevap Görseli"
                accept="image/*"
                value={newExercise.neutralAnswerImage}
                onChange={(v) => setNewExercise({ ...newExercise, neutralAnswerImage: v })}
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.imageUrl",
                  defaultMessage: "https://.../image.png"
                })}
              />
              <UploadInput
                id="bad-image"
                label="Hatalı Cevap Görseli"
                accept="image/*"
                value={newExercise.badAnswerImage}
                onChange={(v) => setNewExercise({ ...newExercise, badAnswerImage: v })}
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.imageUrl",
                  defaultMessage: "https://.../image.png"
                })}
              />
              <UploadInput
                id="correct-image"
                label="Doğru Cevap Görseli"
                accept="image/*"
                value={newExercise.correctAnswerImage}
                onChange={(v) => setNewExercise({ ...newExercise, correctAnswerImage: v })}
                placeholder={intl.formatMessage({
                  id: "admin.lessons.placeholder.imageUrl",
                  defaultMessage: "https://.../image.png"
                })}
              />
            </div>
          )}

                    {/* Animation + hover hint configuration */}
          {!isEducationType && !simpleMode && (
            <section className="space-y-6 rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-semibold">Animasyon & Etkileşim</h4>
                <p className="text-sm text-muted-foreground">
                  Karakter animasyonlarını, hover ipuçlarını ve doğru cevap sesini tek yerden yönet.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <UploadInput
                  id="idle-animation"
                  label="Karakter (Idle) Animasyonu"
                  accept="image/*,video/*"
                  value={newExercise.mediaPack?.idleAnimationUrl || ""}
                  onChange={(value) => updateMediaPack("idleAnimationUrl", value)}
                  placeholder="https://.../idle.gif"
                />
                <UploadInput
                  id="success-animation"
                  label="Doğru Cevap Animasyonu"
                  accept="image/*,video/*"
                  value={newExercise.mediaPack?.successAnimationUrl || ""}
                  onChange={(value) =>
                    updateMediaPack("successAnimationUrl", value)
                  }
                  placeholder="https://.../success.gif"
                />
                <UploadInput
                  id="fail-animation"
                  label="Hatalı Cevap Animasyonu"
                  accept="image/*,video/*"
                  value={newExercise.mediaPack?.failAnimationUrl || ""}
                  onChange={(value) => updateMediaPack("failAnimationUrl", value)}
                  placeholder="https://.../fail.gif"
                />
                <div className="grid gap-2">
                  <Label>Karakter Adı</Label>
                  <Input
                    value={newExercise.mediaPack?.characterName || ""}
                    onChange={(e) =>
                      updateMediaPack("characterName", e.target.value)
                    }
                    placeholder="Örn. Tulu Ayı"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Hover İpucu Metni</Label>
                  <Textarea
                    value={newExercise.hoverHint?.text || ""}
                    onChange={(e) => updateHoverHint("text", e.target.value)}
                    placeholder="Kelimenin çevirisini görmek için üzerine gel."
                  />
                </div>
                <UploadInput
                  id="hover-audio"
                  label="Hover İpucu Sesi"
                  accept="audio/*"
                  value={newExercise.hoverHint?.audioUrl || ""}
                  onChange={(value) => updateHoverHint("audioUrl", value)}
                  placeholder="https://.../hover.mp3"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <UploadInput
                  id="answer-audio"
                  label="Doğru Cevap Sesi"
                  accept="audio/*"
                  value={newExercise.answerAudioUrl || ""}
                  onChange={(value) =>
                    setNewExercise({ ...newExercise, answerAudioUrl: value })
                  }
                  placeholder="https://.../answer.mp3"
                />
                <div className="grid gap-2">
                  <Label>TTS Voice ID</Label>
                  <Input
                    value={newExercise.ttsVoiceId || ""}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, ttsVoiceId: e.target.value })
                    }
                    placeholder="elevenlabs-voice-id"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Otomatik Göster (ms)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newExercise.autoRevealMilliseconds ?? ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        autoRevealMilliseconds:
                          e.target.value === ""
                            ? null
                            : Number(e.target.value),
                      })
                    }
                    placeholder="3000"
                  />
                </div>
              </div>
            </section>
          )}


          {/* Education type dynamic forms */}
  {isEducationType && (
    <div className="space-y-4">
      {newExercise.type === "education_image_intro" && (
        <div className="space-y-3">
          <Input
            placeholder="Başlık"
            value={newExercise.educationContent?.title || ""}
            onChange={(e) =>
              setNewExercise({
                ...newExercise,
                educationContent: {
                  ...(newExercise.educationContent || {}),
                  title: e.target.value,
                },
              })
            }
          />
          <Input
            placeholder="Alt başlık"
            value={newExercise.educationContent?.subtitle || ""}
            onChange={(e) =>
              setNewExercise({
                ...newExercise,
                educationContent: {
                  ...(newExercise.educationContent || {}),
                  subtitle: e.target.value,
                },
              })
            }
          />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => {
              const cards = newExercise.educationContent?.cards || [];
              const card = cards[idx] || { imageUrl: "", text: "", audioUrl: "" };
              return (
                <div key={idx} className="border rounded p-3 space-y-2">
                  <div className="text-sm font-medium">Kart {idx + 1}</div>
                  <UploadInput
                    id={`card-image-${idx}`}
                    label={`Kart ${idx + 1} Görseli`}
                    accept="image/*"
                    value={card.imageUrl}
                    onChange={(v) => {
                      const next = [...cards];
                      next[idx] = { ...card, imageUrl: v };
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          cards: next,
                        },
                      });
                    }}
                  />
                  {card.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.imageUrl} alt={`card-${idx+1}`} className="w-20 h-20 object-cover rounded border" />
                  )}
                  <Input
                    placeholder="Kelime"
                    value={card.text}
                    onChange={(e) => {
                      const next = [...cards];
                      next[idx] = { ...card, text: e.target.value };
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          cards: next,
                        },
                      });
                    }}
                  />
                  <UploadInput
                    id={`card-audio-${idx}`}
                    label={`Kart ${idx + 1} Ses`}
                    accept="audio/*"
                    value={card.audioUrl || ""}
                    onChange={(v) => {
                      const next = [...cards];
                      next[idx] = { ...card, audioUrl: v };
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          cards: next,
                        },
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

              {newExercise.type === "education_visual" && (
                <div className="space-y-4 rounded-2xl border p-4 bg-muted/20">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <Input
                        placeholder="Başlık"
                        value={newExercise.educationContent?.title || ""}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            educationContent: {
                              ...(newExercise.educationContent || {}),
                              title: e.target.value,
                            },
                          })
                        }
                      />
                      <Textarea
                        placeholder="Açıklama"
                        value={newExercise.educationContent?.description || ""}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            educationContent: {
                              ...(newExercise.educationContent || {}),
                              description: e.target.value,
                            },
                          })
                        }
                      />
                      <UploadInput
                        id="visual-image"
                        label="Ana görsel"
                        accept="image/*"
                        value={newExercise.educationContent?.imageUrl || ""}
                        onChange={(v) =>
                          setNewExercise({
                            ...newExercise,
                            educationContent: {
                              ...(newExercise.educationContent || {}),
                              imageUrl: v,
                            },
                          })
                        }
                        helperText="16:9 veya kare oranlarda yüksek çözünürlüklü görsel önerilir."
                      />
                      <UploadInput
                        id="visual-audio"
                        label="Ses narasyonu (opsiyonel)"
                        accept="audio/*"
                        value={newExercise.educationContent?.narrationAudioUrl || ""}
                        onChange={(v) =>
                          setNewExercise({
                            ...newExercise,
                            educationContent: {
                              ...(newExercise.educationContent || {}),
                              narrationAudioUrl: v,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="rounded-[32px] border bg-gradient-to-br from-white to-slate-50 shadow-inner p-6 space-y-4">
                      <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
                        Önizleme
                      </p>
                      <div className="space-y-2 text-left">
                        <h3 className="text-lg font-semibold">
                          {newExercise.educationContent?.title || "Görsel başlık"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {newExercise.educationContent?.description ||
                            "Bu alanda açıklama metni görüntülenir."}
                        </p>
                      </div>
                      {newExercise.educationContent?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={newExercise.educationContent.imageUrl}
                          alt="education-visual-preview"
                          className="w-full h-48 object-cover rounded-3xl border bg-white"
                        />
                      ) : (
                        <div className="w-full h-48 rounded-3xl border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                          Görsel yüklendiğinde burada görünür
                        </div>
                      )}
                      {newExercise.educationContent?.narrationAudioUrl && (
                        <audio controls className="w-full">
                          <source src={newExercise.educationContent.narrationAudioUrl} />
                        </audio>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Ek görseller (maks. 4)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVisualGalleryItem}
                        disabled={visualGallery.length >= 4}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Ekle
                      </Button>
                    </div>
                    {visualGallery.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Galeri öğeleri opsiyoneldir, kartın altında küçük görsel olarak gösterilir.
                      </p>
                    )}
                    <div className="space-y-3">
                      {visualGallery.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <UploadInput
                            id={`visual-gallery-${idx}`}
                            label={`Galeri ${idx + 1}`}
                            accept="image/*"
                            value={url}
                            variant="inline"
                            onChange={(v) => updateVisualGallery(idx, v)}
                            placeholder="https://..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVisualGalleryItem(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {newExercise.type === "education_video" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Başlık"
                    value={newExercise.educationContent?.title || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <UploadInput
                    id="video-url"
                    label="Video (upload veya URL)"
                    accept="video/*"
                    value={newExercise.educationContent?.videoUrl || ""}
                    onChange={(v) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          videoUrl: v,
                        },
                      })
                    }
                  />
                  <UploadInput
                    id="video-cover"
                    label="Video kapak görseli"
                    accept="image/*"
                    value={newExercise.educationContent?.coverImageUrl || ""}
                    onChange={(v) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          coverImageUrl: v,
                        },
                      })
                    }
                  />
                  <Textarea
                    placeholder="Alt yazılar (opsiyonel)"
                    value={newExercise.educationContent?.captions || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          captions: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}

              {newExercise.type === "education_audio" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Başlık"
                    value={newExercise.educationContent?.title || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="Yönerge"
                    value={newExercise.educationContent?.instructionText || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          instructionText: e.target.value,
                        },
                      })
                    }
                  />
                  <UploadInput
                    id="education-audio"
                    label="Ses dosyası"
                    accept="audio/*"
                    value={newExercise.educationContent?.audioUrl || ""}
                    onChange={(v) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          audioUrl: v,
                        },
                      })
                    }
                  />
                  <Textarea
                    placeholder="Metin içeriği"
                    value={newExercise.educationContent?.contentText || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          contentText: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}

              {newExercise.type === "education_tip" && (
                <div className="space-y-3">
                  <Select
                    value={newExercise.educationContent?.tipType || "note"}
                    onValueChange={(v) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          tipType: v,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={intl.formatMessage({
                        id: "admin.lessons.placeholder.tipType",
                        defaultMessage: "Tip tipi"
                      })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="important">Önemli</SelectItem>
                      <SelectItem value="note">Not</SelectItem>
                      <SelectItem value="culture">Kültür</SelectItem>
                      <SelectItem value="pronunciation">Telaffuz</SelectItem>
                      <SelectItem value="reminder">Hatırlatıcı</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Başlık"
                    value={newExercise.educationContent?.title || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <Textarea
                    placeholder="İçerik"
                    value={newExercise.educationContent?.content || ""}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          content: e.target.value,
                        },
                      })
                    }
                  />
                  <UploadInput
                    id="tip-audio"
                    label="Örnek ses (opsiyonel)"
                    accept="audio/*"
                    value={newExercise.educationContent?.sampleAudioUrl || ""}
                    onChange={(v) =>
                      setNewExercise({
                        ...newExercise,
                        educationContent: {
                          ...(newExercise.educationContent || {}),
                          sampleAudioUrl: v,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* New Word Toggle */}
          {!isEducationType && (
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
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button className="w-full sm:w-auto" variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Vazgeç"
            />
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={isLoading}>
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

// Lightweight asset picker using recent uploads from localStorage
function AssetPicker({
  kind,
  onClose,
  onSelect,
  onAddRecent,
}: {
  kind: 'image' | 'audio' | 'video';
  onClose: () => void;
  onSelect: (url: string) => void;
  onAddRecent: (url: string) => void;
}) {
  const [tab, setTab] = useState<'recent'|'url'|'upload'|'static'>('recent');
  const [url, setUrl] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const accept = kind === 'image' ? 'image/*' : kind === 'audio' ? 'audio/*' : 'video/*';
  let items: RecentAsset[] = [];
  try {
    const raw = window.localStorage.getItem('tulu_recent_assets');
    const parsed = raw ? JSON.parse(raw) : [];
    items = Array.isArray(parsed) ? parsed.filter(isRecentAsset) : [];
  } catch {}
  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <Button variant={tab==='recent'?'default':'outline'} size="sm" onClick={() => setTab('recent')}>Son Kullanılan</Button>
        <Button variant={tab==='url'?'default':'outline'} size="sm" onClick={() => setTab('url')}>URL</Button>
        <Button variant={tab==='upload'?'default':'outline'} size="sm" onClick={() => setTab('upload')}>Yükle</Button>
        <Button variant={tab==='static'?'default':'outline'} size="sm" onClick={() => setTab('static')}>Varlıklar</Button>
        <div className="ml-auto"><Button variant="ghost" size="sm" onClick={onClose}>Kapat</Button></div>
      </div>
      {tab==='recent' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-auto">
          {items.filter((item) => item.kind===kind).map((item, idx: number) => (
            <button key={idx} className="border rounded p-1 hover:ring-2 ring-primary" onClick={() => onSelect(item.url)}>
              {kind==='image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="asset" className="w-full aspect-square object-cover rounded"/>
              )}
              {kind==='audio' && <audio className="w-full" controls src={item.url}/>} 
              {kind==='video' && <video className="w-full" controls src={item.url}/>} 
            </button>
          ))}
          {items.filter((i)=>i.kind===kind).length===0 && (
            <div className="text-sm text-muted-foreground">Henüz son kullanılan {kind === 'image' ? 'görsel' : kind === 'audio' ? 'ses' : 'video'} yok. Yükleyin veya URL yapıştırın.</div>
          )}
        </div>
      )}
      {tab==='url' && (
        <div className="flex gap-2">
          <Input value={url} onChange={(e)=> setUrl(e.target.value)} placeholder={`${kind === 'image' ? 'Görsel' : kind === 'audio' ? 'Ses' : 'Video'} URL'si yapıştırın`}/>
          <Button onClick={()=>{ if(url.trim()){ onAddRecent(url.trim()); onSelect(url.trim()); } }}>Kullan</Button>
        </div>
      )}
      {tab==='static' && (
        <StaticAssets kind={kind} onSelect={onSelect} />
      )}
      {tab==='upload' && (
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={async (e)=>{
            const f = e.target.files?.[0];
            if (!f) return;
            const { upload: clientUpload } = await import('@vercel/blob/client');
            const res = await clientUpload(`admin/${Date.now()}-${f.name}`, f, { access: 'public', handleUploadUrl: '/api/blob/upload-url' });
            onAddRecent(res.url);
            onSelect(res.url);
          }}/>
          <Button variant="outline" onClick={()=> fileRef.current?.click()}>Dosya Seç</Button>
        </div>
      )}
    </div>
  );
}

function StaticAssets({ kind, onSelect }: { kind: 'image'|'audio'|'video'; onSelect: (url: string)=>void }){
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true);
    fetch(`/api/assets?kind=${kind}`).then(r=>r.json()).then(d=>{ setItems(d.items||[]);}).finally(()=> setLoading(false));
  },[kind]);
  return (
    <div className="max-h-72 overflow-auto">
      {loading ? <div className="text-sm text-muted-foreground">Yükleniyor…</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((u)=> (
            <button key={u} className="border rounded p-1 hover:ring-2 ring-primary" onClick={()=> onSelect(u)}>
              {kind==='image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u} alt="asset" className="w-full aspect-square object-cover rounded"/>
              )}
              {kind==='audio' && <audio className="w-full" controls src={u}/>} 
              {kind==='video' && <video className="w-full" controls src={u}/>} 
            </button>
          ))}
          {items.length===0 && (
            <div className="text-sm text-muted-foreground">/public klasöründe {kind === 'image' ? 'görsel' : kind === 'audio' ? 'ses' : 'video'} varlığı yok.</div>
          )}
        </div>
      )}
    </div>
  );
}
