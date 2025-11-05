"use client";

import { useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Edit,
  Plus,
  Save,
  Trash2,
  X,
  Music,
  Type,
  MousePointerClick,
  AlignJustify,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Add Select component to imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedMessage } from "react-intl";
import { ExerciseResponse, LessonResponseType, exerciseTypes } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// Languages for exercises
const exerciseLanguages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
];

const moralValueOptions = [
  { value: "patience", label: "Patience" },
  { value: "gratitude", label: "Gratitude" },
  { value: "kindness", label: "Kindness" },
  { value: "honesty", label: "Honesty" },
  { value: "sharing", label: "Sharing" },
  { value: "mercy", label: "Mercy" },
  { value: "justice", label: "Justice" },
  { value: "respect", label: "Respect" },
];

const moralDisplayTimings = [
  { value: "pre_lesson", label: "Before lesson" },
  { value: "mid_lesson", label: "During lesson" },
  { value: "post_lesson", label: "After lesson" },
];

const miniGameTypes = [
  { value: "match", label: "Matching Game" },
  { value: "quiz", label: "Quiz" },
  { value: "puzzle", label: "Puzzle" },
  { value: "story", label: "Story Time" },
  { value: "breathing", label: "Breathing Exercise" },
];

const optionSupportedTypes = exerciseTypes
  .filter(({ supportsOptions }) => supportsOptions)
  .map(({ value }) => value);
const audioSupportedTypes = exerciseTypes
  .filter(({ supportsAudio }) => supportsAudio)
  .map(({ value }) => value);

export default function LessonDetail({
  lessonData,
}: {
  lessonData: LessonResponseType;
}) {
  const formatLabel = (value: string | undefined) =>
    (value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const router = useLocalizedRouter();

  const [lesson, setLesson] = useState(lessonData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLesson, setEditedLesson] = useState(lessonData);
  const [miniGameConfigText, setMiniGameConfigText] = useState(
    JSON.stringify(lessonData.miniGame?.config ?? {}, null, 2)
  );
  const [miniGameConfigError, setMiniGameConfigError] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Add these new states and functions to the component
  // Add after the existing state declarations:
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseResponse>({
    _id: "",
    type: "translate",
    instruction: "",
    sourceText: "",
    sourceLanguage: "en",
    targetLanguage: "fr",
    correctAnswer: [""],
    options: ["", "", "", "", ""],
    isNewWord: false,
    audioUrl: "",
    neutralAnswerImage: "",
    badAnswerImage: "",
    correctAnswerImage: "",
    isActive: true,
  });
  const [newExercise, setNewExercise] = useState({
    _id: "",
    type: "translate",
    instruction: "",
    sourceText: "",
    sourceLanguage: "en",
    targetLanguage: "fr",
    correctAnswer: [""],
    options: ["", "", "", "", ""],
    isNewWord: false,
    audioUrl: "",
    neutralAnswerImage: "",
    badAnswerImage: "",
    correctAnswerImage: "",
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  // Handle save changes
  const handleSaveChanges = () => {
    setLesson(editedLesson);
    setIsEditing(false);
    // In a real app, you would save changes to the database here
  };

  // Handle delete lesson
  const handleDeleteLesson = () => {
    // In a real app, you would delete the lesson from the database here
    // router.push("/admin/lessons");
  };

  // Add these functions after the handleDeleteLesson function:
  const handleAddExercise = async () => {
    const requiresOptions = optionSupportedTypes.includes(newExercise.type);
    const trimmedOptions = newExercise.options
      .map((opt) => (opt ?? "").trim())
      .filter(Boolean);
    if (requiresOptions && trimmedOptions.length === 0) {
      toast.error("Please add at least one option for this exercise type.");
      return;
    }

    const requiresAudio = audioSupportedTypes.includes(newExercise.type);
    const trimmedAudio = newExercise.audioUrl.trim();
    if (requiresAudio && !trimmedAudio) {
      toast.error("Audio URL is required for this exercise type.");
      return;
    }

    setIsLoading(true);
    const token = await getToken(); // or however you're managing auth
    try {
      const response = await apiClient.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises`,
        {
          lessonId: lesson.lessonId,
          unitId: lesson.unitId,
          chapterId: lesson.chapterId,
          languageId: lesson.languageId,
          type: newExercise.type,
          instruction: newExercise.instruction.trim(),
          sourceText: newExercise.sourceText.trim(),
          sourceLanguage: newExercise.sourceLanguage.toLowerCase(),
          targetLanguage: newExercise.targetLanguage.toLowerCase(),
          correctAnswer: newExercise.correctAnswer.map((a) => a.trim()),
          options: requiresOptions ? trimmedOptions : [],
          isNewWord: newExercise.isNewWord,
          audioUrl: trimmedAudio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setLesson({
          ...lesson,
          exercises: [...lesson.exercises, response.data.data],
        });
        setNewExercise({
          _id: "",
          type: "translate",
          instruction: "",
          sourceText: "",
          sourceLanguage: "en",
          targetLanguage: "fr",
          correctAnswer: [""],
          options: ["", "", "", "", ""],
          isNewWord: false,
          audioUrl: "",
          neutralAnswerImage: "",
          badAnswerImage: "",
          correctAnswerImage: "",
          isActive: true,
        });
        setIsExerciseDialogOpen(false);
        toast.success("New exercise created");
      }
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else {
        toast.error(message || "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExercise = async () => {
    const type = editingExercise?.type ?? "translate";
    const requiresOptions = optionSupportedTypes.includes(type);
    const trimmedOptions = (editingExercise?.options ?? [])
      .map((opt) => (opt ?? "").trim())
      .filter(Boolean);
    if (requiresOptions && trimmedOptions.length === 0) {
      toast.error("Please add at least one option for this exercise type.");
      return;
    }

    const requiresAudio = audioSupportedTypes.includes(type);
    const trimmedAudio = (editingExercise?.audioUrl ?? "").trim();
    if (requiresAudio && !trimmedAudio) {
      toast.error("Audio URL is required for this exercise type.");
      return;
    }

    setIsLoading(true);
    const token = await getToken(); // or however you're managing auth
    try {
      const response = await apiClient.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises/${editingExercise?._id}`,
        {
          lessonId: lesson.lessonId,
          unitId: lesson.unitId,
          chapterId: lesson.chapterId,
          languageId: lesson.languageId,
          type: editingExercise?.type,
          instruction: editingExercise?.instruction.trim(),
          sourceText: editingExercise?.sourceText.trim(),
          sourceLanguage: editingExercise?.sourceLanguage,
          targetLanguage: editingExercise?.targetLanguage,
          correctAnswer: editingExercise?.correctAnswer.map((a) => a.trim()),
          options: requiresOptions ? trimmedOptions : [],
          isNewWord: editingExercise?.isNewWord,
          audioUrl: trimmedAudio,
          neutralAnswerImage: editingExercise?.neutralAnswerImage.trim(),
          badAnswerImage: editingExercise?.badAnswerImage.trim(),
          correctAnswerImage: editingExercise?.correctAnswerImage.trim(),
          isActive: editingExercise?.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setLesson({
          ...lesson,
          exercises: lesson.exercises.map((ex) =>
            ex._id === editingExercise?._id ? response.data.data : ex
          ),
        });
        setEditingExercise({
          _id: "",
          type: "translate",
          instruction: "",
          sourceText: "",
          sourceLanguage: "en",
          targetLanguage: "fr",
          correctAnswer: [""],
          options: ["", "", "", "", ""],
          isNewWord: false,
          audioUrl: "",
          neutralAnswerImage: "",
          badAnswerImage: "",
          correctAnswerImage: "",
          isActive: true,
        });

        setIsEditDialogOpen(false);
        toast.success("Exercise updated");
      }
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else {
        toast.error(message || "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    setIsLoading(true);

    const token = await getToken();

    try {
      const response = await apiClient.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises/${exerciseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove deleted language from state

        setLesson({
          ...lesson,
          exercises: lesson.exercises.filter((ex) => ex._id !== exerciseId),
        });
        toast.success("Exercise deleted successfully");
      }
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else {
        toast.error(message || "Failed to delete language.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateCorrectAnswer = (
    index: number,
    value: string,
    exerciseObj: ExerciseResponse
  ) => {
    const updatedAnswers = [...(exerciseObj.correctAnswer || [""])];
    updatedAnswers[Number(index)] = value;
    return updatedAnswers;
  };

  const addCorrectAnswer = (exerciseObj: ExerciseResponse) => {
    return {
      ...exerciseObj,
      correctAnswer: [...(exerciseObj.correctAnswer || [""]), ""],
    };
  };

  const addOption = (exerciseObj: ExerciseResponse) => {
    return {
      ...exerciseObj,
      options: [...(exerciseObj.options || [""]), ""],
    };
  };

  const removeCorrectAnswer = (
    index: number,
    exerciseObj: ExerciseResponse
  ) => {
    const updatedAnswers = [...(exerciseObj.correctAnswer || [""])];
    updatedAnswers.splice(Number(index), 1);
    return {
      ...exerciseObj,
      correctAnswer: updatedAnswers.length ? updatedAnswers : [""],
    };
  };

  const updateOption = (
    index: number,
    value: string,
    exerciseObj: ExerciseResponse
  ) => {
    const updatedOptions = [...(exerciseObj.options || ["", "", "", "", ""])];
    updatedOptions[Number(index)] = value;
    return updatedOptions;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/lessons")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Lesson" : `Lesson: ${lesson.title}`}
          </h1>
          <p className="text-muted-foreground">
            {/* Chapter {lesson.chapterId}, Unit {lesson.unitId}, Lesson{" "}
            {lesson.lessonId} */}
            {lesson.description}
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Lesson
              </Button>
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this lesson? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteLesson}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
                <CardDescription>
                  Edit the basic information for this lesson.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedLesson.title}
                    onChange={(e) =>
                      setEditedLesson({
                        ...editedLesson,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedLesson.description}
                    onChange={(e) =>
                      setEditedLesson({
                        ...editedLesson,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="xp">XP Reward</Label>
                  <Input
                    id="xp"
                    type="number"
                    value={editedLesson.totalXp}
                    onChange={(e) =>
                      setEditedLesson({
                        ...editedLesson,
                        totalXp: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="premium"
                    checked={editedLesson.isPremium}
                    onCheckedChange={(checked) =>
                      setEditedLesson({ ...editedLesson, isPremium: checked })
                    }
                  />
                  <Label htmlFor="premium">Premium Content</Label>
                </div>

                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <h4 className="text-sm font-semibold text-muted-foreground">Moral Lesson</h4>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Select
                    value={editedLesson.moralLesson?.value ?? "kindness"}
                    onValueChange={(value) =>
                      setEditedLesson({
                        ...editedLesson,
                        moralLesson: {
                          value: value as typeof moralValueOptions[number]["value"],
                          title: editedLesson.moralLesson?.title ?? "",
                          storyText: editedLesson.moralLesson?.storyText ?? "",
                          mediaUrl: editedLesson.moralLesson?.mediaUrl ?? "",
                          displayTiming:
                            editedLesson.moralLesson?.displayTiming ?? "post_lesson",
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select moral value" />
                    </SelectTrigger>
                    <SelectContent>
                      {moralValueOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-2">
                    <Label htmlFor="moral-title">Title</Label>
                    <Input
                      id="moral-title"
                      value={editedLesson.moralLesson?.title ?? ""}
                      onChange={(event) =>
                        setEditedLesson({
                          ...editedLesson,
                          moralLesson: {
                            value:
                              editedLesson.moralLesson?.value ?? "kindness",
                            title: event.target.value,
                            storyText:
                              editedLesson.moralLesson?.storyText ?? "",
                            mediaUrl:
                              editedLesson.moralLesson?.mediaUrl ?? "",
                            displayTiming:
                              editedLesson.moralLesson?.displayTiming ?? "post_lesson",
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="moral-story">Story Text</Label>
                    <Textarea
                      id="moral-story"
                      rows={3}
                      value={editedLesson.moralLesson?.storyText ?? ""}
                      onChange={(event) =>
                        setEditedLesson({
                          ...editedLesson,
                          moralLesson: {
                            value:
                              editedLesson.moralLesson?.value ?? "kindness",
                            title: editedLesson.moralLesson?.title ?? "",
                            storyText: event.target.value,
                            mediaUrl:
                              editedLesson.moralLesson?.mediaUrl ?? "",
                            displayTiming:
                              editedLesson.moralLesson?.displayTiming ?? "post_lesson",
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="moral-media">Media URL</Label>
                    <Input
                      id="moral-media"
                      value={editedLesson.moralLesson?.mediaUrl ?? ""}
                      onChange={(event) =>
                        setEditedLesson({
                          ...editedLesson,
                          moralLesson: {
                            value:
                              editedLesson.moralLesson?.value ?? "kindness",
                            title: editedLesson.moralLesson?.title ?? "",
                            storyText:
                              editedLesson.moralLesson?.storyText ?? "",
                            mediaUrl: event.target.value,
                            displayTiming:
                              editedLesson.moralLesson?.displayTiming ?? "post_lesson",
                          },
                        })
                      }
                    />
                  </div>
                  <Label className="text-xs text-muted-foreground">Display Timing</Label>
                  <Select
                    value={editedLesson.moralLesson?.displayTiming ?? "post_lesson"}
                    onValueChange={(value) =>
                      setEditedLesson({
                        ...editedLesson,
                        moralLesson: {
                          value:
                            editedLesson.moralLesson?.value ?? "kindness",
                          title: editedLesson.moralLesson?.title ?? "",
                          storyText:
                            editedLesson.moralLesson?.storyText ?? "",
                          mediaUrl:
                            editedLesson.moralLesson?.mediaUrl ?? "",
                          displayTiming: value as
                            typeof moralDisplayTimings[number]["value"],
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      {moralDisplayTimings.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <h4 className="text-sm font-semibold text-muted-foreground">Mini Game</h4>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={editedLesson.miniGame?.type ?? "quiz"}
                    onValueChange={(value) =>
                      setEditedLesson({
                        ...editedLesson,
                        miniGame: {
                          type: value as typeof miniGameTypes[number]["value"],
                          config: editedLesson.miniGame?.config ?? {},
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mini game" />
                    </SelectTrigger>
                    <SelectContent>
                      {miniGameTypes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-2">
                    <Label htmlFor="mini-config">Configuration (JSON)</Label>
                    <Textarea
                      id="mini-config"
                      rows={4}
                      value={miniGameConfigText}
                      onChange={(event) => {
                        setMiniGameConfigText(event.target.value);
                        try {
                          const parsed = JSON.parse(event.target.value || "{}");
                          setMiniGameConfigError(null);
                          setEditedLesson({
                            ...editedLesson,
                            miniGame: {
                              type:
                                editedLesson.miniGame?.type ?? "quiz",
                              config: parsed,
                            },
                          });
                        } catch (err) {
                          setMiniGameConfigError("Invalid JSON configuration");
                        }
                      }}
                    />
                    {miniGameConfigError && (
                      <p className="text-xs text-destructive">
                        {miniGameConfigError}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Title
                    </h3>
                    <p className="text-lg">{lesson.title}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      XP Reward
                    </h3>
                    <p className="text-lg">{lesson.totalXp} XP</p>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-lg">{lesson.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Premium Content
                    </h3>
                    <div className="flex items-center mt-1">
                      {lesson.isPremium ? (
                        <div className="flex items-center text-yellow-600">
                          <Check className="mr-1 h-4 w-4" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <span>No</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Exercises
                    </h3>
                    <p className="text-lg">{lesson.exercises.length}</p>
                  </div>

                  <div className="col-span-2 border rounded-lg bg-muted/20 p-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Character Focus
                    </h3>
                    {lesson.moralLesson ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          Value: {formatLabel(lesson.moralLesson.value)}
                        </p>
                        {lesson.moralLesson.title && (
                          <p className="text-sm">{lesson.moralLesson.title}</p>
                        )}
                        {lesson.moralLesson.storyText && (
                          <p className="text-xs text-muted-foreground">
                            {lesson.moralLesson.storyText}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Display: {formatLabel(lesson.moralLesson.displayTiming)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not set</p>
                    )}
                  </div>

                  <div className="col-span-2 border rounded-lg bg-muted/20 p-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Mini Game
                    </h3>
                    {lesson.miniGame ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          Type: {formatLabel(lesson.miniGame.type)}
                        </p>
                        <p className="text-xs text-muted-foreground break-words">
                          Config: {JSON.stringify(lesson.miniGame.config)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not configured</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Exercises</h2>
            <Button onClick={() => setIsExerciseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </div>

          {lesson.exercises.map((exercise, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    {exercise.type === "translate" && (
                      <Type className="h-4 w-4" />
                    )}
                    {exercise.type === "select" && (
                      <MousePointerClick className="h-4 w-4" />
                    )}
                    {exercise.type === "arrange" && (
                      <AlignJustify className="h-4 w-4" />
                    )}
                    Exercise {index + 1}: {exercise.type}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingExercise(exercise);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeleteExercise(exercise._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
                <CardDescription>{exercise.instruction}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Source Text
                      </h3>
                      <p>{exercise.sourceText}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Languages
                      </h3>
                      <p>
                        {exercise.sourceLanguage} → {exercise.targetLanguage}
                      </p>
                    </div>

                    {exercise.audioUrl && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Music className="h-4 w-4" /> Audio
                        </h3>
                        <audio controls className="mt-1 w-full">
                          <source src={exercise.audioUrl} type="audio/ogg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Correct Answers
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {exercise.correctAnswer?.map((answer, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                        >
                          {answer}
                        </div>
                      ))}
                    </div>
                  </div>

                  {exercise.options && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Options
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {exercise.options.map((option, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {exercise.isNewWord && (
                    <div className="flex items-center">
                      <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                        New Word
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {lesson.exercises.length === 0 && (
            <div className="text-center p-12 border rounded-md">
              <div className="inline-flex h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium">No exercises yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Get started by creating your first exercise.
              </p>
              <Button onClick={() => setIsExerciseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Settings</CardTitle>
              <CardDescription>
                Configure additional settings for this lesson.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">Active</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  When disabled, this lesson won&apos;t be visible to users.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="featured" />
                <Label htmlFor="featured">Featured</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  Featured lessons are highlighted on the dashboard.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="beta" />
                <Label htmlFor="beta">Beta</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  Mark this lesson as beta to gather feedback before full
                  release.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Destructive actions for this lesson.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-4 border border-red-200 rounded-md bg-red-50">
                <div>
                  <h3 className="font-medium text-red-800">Delete Lesson</h3>
                  <p className="text-sm text-red-600">
                    Once deleted, this lesson cannot be recovered.
                  </p>
                </div>
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Lesson</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this lesson? This action
                        cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteLesson}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Exercise Dialog */}
      <Dialog
        open={isExerciseDialogOpen}
        onOpenChange={setIsExerciseDialogOpen}
      >
        <DialogContent className="max-w-3xl overflow-auto h-[900px]">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
            <DialogDescription>
              Create a new exercise for this lesson.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exercise-type">Exercise Type</Label>
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

              <div className="grid gap-2">
                <Label htmlFor="exercise-instruction">Instruction</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="exercise-source-language">
                  Source Language
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

              <div className="grid gap-2">
                <Label htmlFor="exercise-target-language">
                  Target Language
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

            <div className="grid gap-2">
              <Label htmlFor="exercise-source-text">Source Text</Label>
              <Input
                id="exercise-source-text"
                value={newExercise.sourceText}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, sourceText: e.target.value })
                }
                placeholder="e.g. Hello"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Correct Answers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewExercise(addCorrectAnswer(newExercise))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newExercise.correctAnswer.map((answer, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    className="lowercase"
                    value={answer}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        correctAnswer: updateCorrectAnswer(
                          index,
                          e.target.value,
                          newExercise
                        ),
                      })
                    }
                    placeholder={`Answer ${index + 1}`}
                  />
                  {newExercise.correctAnswer.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setNewExercise(removeCorrectAnswer(index, newExercise))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {optionSupportedTypes.includes(newExercise.type) && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Options (for select and translate)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewExercise(addOption(newExercise))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newExercise.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      className="lowercase"
                      value={option}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          options: updateOption(
                            index,
                            e.target.value,
                            newExercise
                          ),
                        })
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {audioSupportedTypes.includes(newExercise.type) && (
              <div className="grid gap-2">
                <Label htmlFor="exercise-audio">Audio URL (optional)</Label>
                <Input
                  id="exercise-audio"
                  value={newExercise.audioUrl}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, audioUrl: e.target.value })
                  }
                  placeholder="e.g. http://example.com/audio.mp3"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="exercise-new-word"
                checked={newExercise.isNewWord}
                onCheckedChange={(checked) =>
                  setNewExercise({ ...newExercise, isNewWord: checked })
                }
              />
              <Label htmlFor="exercise-new-word">Mark as New Word</Label>
            </div>
          </div>

          <DialogFooter className="gap-0">
            <Button
              variant="outline"
              onClick={() => setIsExerciseDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExercise}
              disabled={
                !newExercise.instruction ||
                !newExercise.sourceText ||
                !newExercise.correctAnswer[0] ||
                (optionSupportedTypes.includes(newExercise.type) &&
                  newExercise.options.every((opt) => !(opt ?? "").trim())) ||
                (audioSupportedTypes.includes(newExercise.type) &&
                  !newExercise.audioUrl.trim()) ||
                isLoading
              }
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Add Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[900px] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>
              Update the details of this exercise.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-exercise-type">Exercise Type</Label>
                <Select
                  value={editingExercise?.type || "translate"}
                  onValueChange={(value) =>
                    setEditingExercise((prev) => ({
                      ...(prev as ExerciseResponse),
                      type: value,
                    }))
                  }
                >
                  <SelectTrigger id="edit-exercise-type">
                    <SelectValue placeholder="Select type" />
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

              <div className="grid gap-2">
                <Label htmlFor="edit-exercise-instruction">Instruction</Label>
                <Input
                  id="edit-exercise-instruction"
                  value={editingExercise?.instruction || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      instruction: e.target.value,
                    })
                  }
                  placeholder="e.g. Translate this sentence"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-exercise-source-language">
                  Source Language
                </Label>
                <Select
                  value={editingExercise?.sourceLanguage || "en"}
                  onValueChange={(value) =>
                    setEditingExercise({
                      ...editingExercise,
                      sourceLanguage: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-exercise-source-language">
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

              <div className="grid gap-2">
                <Label htmlFor="edit-exercise-target-language">
                  Target Language
                </Label>
                <Select
                  value={editingExercise?.targetLanguage || ""}
                  onValueChange={(value) =>
                    setEditingExercise({
                      ...editingExercise,
                      targetLanguage: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-exercise-target-language">
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

            <div className="grid gap-2">
              <Label htmlFor="edit-exercise-source-text">Source Text</Label>
              <Input
                id="edit-exercise-source-text"
                value={editingExercise?.sourceText || ""}
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    sourceText: e.target.value,
                  })
                }
                placeholder="e.g. Hello"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Correct Answers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingExercise(addCorrectAnswer(editingExercise))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editingExercise?.correctAnswer?.map(
                (answer: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={answer}
                      onChange={(e) =>
                        setEditingExercise({
                          ...editingExercise,
                          correctAnswer: updateCorrectAnswer(
                            index,
                            e.target.value,
                            editingExercise
                          ),
                        })
                      }
                      placeholder={`Answer ${index + 1}`}
                    />
                    {editingExercise.correctAnswer.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setEditingExercise(
                            removeCorrectAnswer(index, editingExercise)
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>

            {optionSupportedTypes.includes(editingExercise?.type ?? "") && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Options (for select and translate)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditingExercise(addOption(editingExercise))
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {editingExercise?.options?.map(
                  (option: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          setEditingExercise({
                            ...editingExercise,
                            options: updateOption(
                              index,
                              e.target.value,
                              editingExercise
                            ),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {audioSupportedTypes.includes(editingExercise?.type ?? "") && (
              <div className="grid gap-2">
                <Label htmlFor="edit-exercise-audio">
                  Audio URL (optional)
                </Label>
                <Input
                  id="edit-exercise-audio"
                  value={editingExercise?.audioUrl || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      audioUrl: e.target.value,
                    })
                  }
                  placeholder="e.g. http://example.com/audio.mp3"
                />
                {editingExercise?.audioUrl && (
                  <audio controls className="mt-1 w-full">
                    <source src={editingExercise.audioUrl} type="audio/ogg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="exercise-neutralAnswerImage">
                Neutral image URL (optional)
              </Label>
              <Input
                id="exercise-neutralAnswerImage"
                value={
                  editingExercise.neutralAnswerImage ??
                  "https://cdn-icons-png.flaticon.com/128/14853/14853363.png"
                }
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    neutralAnswerImage: e.target.value,
                  })
                }
                placeholder="e.g. http://example.com/audio.mp3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-exercise-correctAnswerImage">
                Correct image URL (optional)
              </Label>
              <Input
                id="edit-exercise-correctAnswerImage"
                value={
                  editingExercise.correctAnswerImage ??
                  "https://cdn-icons-png.flaticon.com/128/2136/2136634.png"
                }
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    correctAnswerImage: e.target.value,
                  })
                }
                placeholder="e.g. http://example.com/audio.mp3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-exercise-badAnswerImage">
                Bad image URL (optional)
              </Label>
              <Input
                id="edit-exercise-badAnswerImage"
                value={
                  editingExercise.badAnswerImage ??
                  "https://cdn-icons-png.flaticon.com/128/2461/2461946.png"
                }
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    badAnswerImage: e.target.value,
                  })
                }
                placeholder="e.g. http://example.com/audio.mp3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-exercise-active"
                checked={editingExercise?.isActive}
                onCheckedChange={(checked) =>
                  setEditingExercise({
                    ...editingExercise,
                    isActive: checked,
                  })
                }
              />
              <Label htmlFor="language-active">Active</Label>
              <p className="text-xs text-muted-foreground ml-2">
                Inactive exercise won&apos;t be visible to users.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-exercise-new-word"
                checked={editingExercise?.isNewWord || false}
                onCheckedChange={(checked) =>
                  setEditingExercise({ ...editingExercise, isNewWord: checked })
                }
              />
              <Label htmlFor="edit-exercise-new-word">Mark as New Word</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={isLoading}
              size="default"
              variant="outline"
              onClick={() =>
                setEditingExercise({
                  _id: "",
                  type: "translate",
                  instruction: "",
                  sourceText: "",
                  sourceLanguage: "en",
                  targetLanguage: "fr",
                  correctAnswer: [""],
                  options: ["", "", "", "", ""],
                  isNewWord: false,
                  audioUrl: "",
                  neutralAnswerImage: "",
                  badAnswerImage: "",
                  correctAnswerImage: "",
                  isActive: true,
                })
              }
            >
              Cancel
            </Button>
            <Button
              size="default"
              onClick={handleEditExercise}
              disabled={
                !editingExercise?.instruction ||
                !editingExercise?.sourceText ||
                !editingExercise?.correctAnswer?.[0] ||
                (optionSupportedTypes.includes(editingExercise?.type ?? "") &&
                  (editingExercise?.options ?? []).every(
                    (opt) => !(opt ?? "").trim()
                  )) ||
                (audioSupportedTypes.includes(editingExercise?.type ?? "") &&
                  !(editingExercise?.audioUrl ?? "").trim()) ||
                isLoading
              }
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
