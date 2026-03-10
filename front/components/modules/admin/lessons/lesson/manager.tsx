"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { ArrowLeft, Edit, Plus, Trash2, Music, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseDialog } from "@/components/modules/admin/lessons/dialogs/exercise-dialog";
import { exerciseTypes } from "@/types";
import type { LessonResponseType, ExerciseResponse } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { detectMediaKind } from "@/lib/media";

const EXERCISE_TYPE_MAP = new Map(
  exerciseTypes.map((item) => [item.value, item])
);

export default function LessonManager({ lessonData }: { lessonData: LessonResponseType }) {
  const router = useLocalizedRouter();
  const { getToken } = useAuth();

  const tripleId = useMemo(() => `${lessonData.chapterId}-${lessonData.unitId}-${lessonData.lessonId}`, [lessonData]);

  const [exercises, setExercises] = useState<ExerciseResponse[]>(lessonData.exercises || []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [previewEx, setPreviewEx] = useState<ExerciseResponse | null>(null);
  const [isDndReady, setIsDndReady] = useState(false);
  const [form, setForm] = useState<any>({
    _id: "",
    lessonId: tripleId,
    type: "translate",
    instruction: "",
    sourceText: "",
    sourceLanguage: "",
    targetLanguage: "",
    correctAnswer: [""],
    options: ["", "", "", "", ""],
    isNewWord: false,
    audioUrl: "",
    neutralAnswerImage: "",
    badAnswerImage: "",
    correctAnswerImage: "",
    isActive: true,
    educationContent: null,
    mediaPack: {
      idleAnimationUrl: "",
      successAnimationUrl: "",
      failAnimationUrl: "",
      characterName: "",
    },
    hoverHint: {
      text: "",
      audioUrl: "",
    },
    answerAudioUrl: "",
    ttsVoiceId: "",
    autoRevealMilliseconds: null,
  });

  useEffect(() => {
    setIsDndReady(true);
  }, []);

  const prepareMediaPack = (pack?: any) => {
    if (!pack) return undefined;
    const cleaned = Object.entries(pack).reduce((acc: Record<string, any>, [key, val]) => {
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (!trimmed) return acc;
        acc[key] = trimmed;
        return acc;
      }
      if (val) acc[key] = val;
      return acc;
    }, {});
    return Object.keys(cleaned).length ? cleaned : undefined;
  };

  const prepareHoverHint = (hint?: any) => {
    if (!hint) return undefined;
    const cleaned = Object.entries(hint).reduce((acc: Record<string, any>, [key, val]) => {
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (!trimmed) return acc;
        acc[key] = trimmed;
        return acc;
      }
      if (val) acc[key] = val;
      return acc;
    }, {});
    return Object.keys(cleaned).length ? cleaned : undefined;
  };

  const shorten = (t?: string, n = 140) => (t ? (t.length > n ? t.slice(0, n) + "…" : t) : "");

  const renderMediaChip = (value: string, key?: string | number) => {
    const kind = detectMediaKind(value);
    if (kind === "image") {
      return (
        <div
          key={key ?? value}
          className="w-16 h-16 rounded-lg border overflow-hidden bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="media-option"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    if (kind === "audio") {
      return (
        <audio
          key={key ?? value}
          controls
          className="h-8 min-w-[140px] rounded border bg-white"
        >
          <source src={value} />
        </audio>
      );
    }
    if (kind === "video") {
      return (
        <video
          key={key ?? value}
          className="w-24 h-16 rounded-md border bg-black/80"
          controls
        >
          <source src={value} />
        </video>
      );
    }
    return (
      <span
        key={key ?? value}
        className="px-2 py-1 rounded-full bg-gray-100 text-sm"
      >
        {value}
      </span>
    );
  };

  const extractApiMessage = (error: any, fallback: string) => {
    const fieldErrors = error?.response?.data?.errors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const firstKey = Object.keys(fieldErrors)[0];
      const candidate = (fieldErrors as Record<string, unknown>)[firstKey];
      if (Array.isArray(candidate) && candidate.length > 0) {
        return candidate[0] as string;
      }
      if (typeof candidate === "string" && candidate) {
        return candidate;
      }
    }
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      fallback
    );
  };

  const renderPreview = (ex: ExerciseResponse) => {
    const t = ex.type || "";
    if (t.startsWith("education_")) {
      const c: any = (ex as any).educationContent || {};
      if (t === "education_visual") {
        const gallery: string[] = Array.isArray(c.gallery) ? c.gallery : [];
        return (
          <div className="space-y-3">
            <div className="rounded-[28px] border bg-gradient-to-br from-white to-slate-50 p-4 shadow-inner flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 space-y-2">
                {c.title && <h3 className="text-lg font-semibold">{c.title}</h3>}
                {c.description && (
                  <p className="text-sm text-muted-foreground">{shorten(c.description, 220)}</p>
                )}
                {c.narrationAudioUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4" />
                    <audio controls className="w-full">
                      <source src={c.narrationAudioUrl} />
                    </audio>
                  </div>
                )}
              </div>
              {c.imageUrl && (
                <div className="relative w-full md:w-56 aspect-square overflow-hidden rounded-3xl border bg-white">
                  <Image src={c.imageUrl} alt={c.title || "visual"} fill style={{ objectFit: "cover" }} />
                </div>
              )}
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {gallery.map((img, idx) => (
                  <div key={img + idx} className="relative w-full aspect-square rounded-2xl overflow-hidden border">
                    <Image src={img} alt={`gallery-${idx + 1}`} fill style={{ objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      if (t === "education_image_intro") {
        const cards = c.cards || [];
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {cards.slice(0, 3).map((card: any, i: number) => (
                <div key={i} className="border rounded-md p-2 space-y-1">
                  {card.imageUrl ? (
                    <div className="relative w-full aspect-square overflow-hidden rounded">
                      <Image src={card.imageUrl} alt={card.text || `card-${i+1}`} fill style={{ objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div className="aspect-square border rounded flex items-center justify-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
                  )}
                  {card.text && <div className="text-sm font-medium text-center">{card.text}</div>}
                  {card.audioUrl && <audio controls className="w-full"><source src={card.audioUrl} /></audio>}
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (t === "education_audio") {
        return (
          <div className="space-y-2">
            {c.instructionText && <div className="text-sm text-muted-foreground">{c.instructionText}</div>}
            {c.audioUrl && <audio controls className="w-full"><source src={c.audioUrl} /></audio>}
            {c.contentText && <p className="text-sm">{shorten(c.contentText, 260)}</p>}
          </div>
        );
      }
      if (t === "education_video") {
        return (
          <div className="space-y-2">
            {c.videoUrl && (
              <video controls poster={c.coverImageUrl} className="w-full rounded-md border">
                <source src={c.videoUrl} />
              </video>
            )}
            {c.captions && <p className="text-sm text-muted-foreground">{shorten(c.captions, 220)}</p>}
          </div>
        );
      }
      if (t === "education_tip") {
        return (
          <div className="rounded-md p-3 border" style={{ background: c.backgroundColor || undefined }}>
            {c.content && <p className="text-sm">{shorten(c.content, 240)}</p>}
            {c.sampleAudioUrl && <audio controls className="mt-2 w-full"><source src={c.sampleAudioUrl} /></audio>}
          </div>
        );
      }
    }
    // Classic types preview
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Instruction</div>
          <div className="text-sm">{ex.instruction}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Languages</div>
          <div className="text-sm">{ex.sourceLanguage} → {ex.targetLanguage}</div>
        </div>
        {ex.sourceText && (
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Source</div>
            {detectMediaKind(ex.sourceText) === "image" ? (
              <div className="w-full max-w-sm rounded-2xl border overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ex.sourceText}
                  alt="source-visual"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-2 rounded bg-muted/40 text-sm">{ex.sourceText}</div>
            )}
          </div>
        )}
        {Array.isArray(ex.correctAnswer) && ex.correctAnswer.length > 0 && (
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Doğru Cevaplar</div>
            <div className="flex flex-wrap gap-2">
              {ex.correctAnswer.map((ans, idx) => renderMediaChip(ans, `answer-${idx}`))}
            </div>
          </div>
        )}
        {ex.options && ex.options.length > 0 && (
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Options</div>
            <div className="flex flex-wrap gap-2">
              {ex.options.map((o, i) => renderMediaChip(o, `option-${i}`))}
            </div>
          </div>
        )}
        {ex.audioUrl && (
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Music className="h-4 w-4" /> Audio</div>
            <audio controls className="w-full"><source src={ex.audioUrl} /></audio>
          </div>
        )}
        {(ex.mediaPack || ex.hoverHint || ex.answerAudioUrl) && (
          <div className="sm:col-span-2 rounded-md border p-3 space-y-2 bg-muted/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Animasyon & İpuçları</div>
            {ex.mediaPack && (
              <div className="text-sm flex flex-wrap gap-3">
                {ex.mediaPack.characterName && <span>Karakter: {ex.mediaPack.characterName}</span>}
                {ex.mediaPack.idleAnimationUrl && <span>Idle animasyon eklendi</span>}
                {ex.mediaPack.successAnimationUrl && <span>Başarı animasyonu eklendi</span>}
                {ex.mediaPack.failAnimationUrl && <span>Hata animasyonu eklendi</span>}
              </div>
            )}
            {ex.hoverHint && (
              <div className="text-sm">
                Hover ipucu: {shorten(ex.hoverHint.text, 80)}
              </div>
            )}
            {ex.answerAudioUrl && (
              <audio controls className="w-full" src={ex.answerAudioUrl} />
            )}
          </div>
        )}
      </div>
    );
  };

  const ExerciseCard = ({ ex, idx }: { ex: ExerciseResponse; idx: number }) => {
    const exerciseTypeMeta = EXERCISE_TYPE_MAP.get(ex.type);

    return (
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <CardTitle className="min-w-0 text-lg leading-tight">
              <FormattedMessage
                id="admin.lessons.manager.exerciseNumber"
                defaultMessage="Egzersiz {number}:"
                values={{ number: idx + 1 }}
              />{" "}
              <span className="break-words text-muted-foreground">
                {exerciseTypeMeta ? (
                  <FormattedMessage
                    id={exerciseTypeMeta.labelKey}
                    defaultMessage={exerciseTypeMeta.defaultMessage}
                  />
                ) : (
                  ex.type
                )}
              </span>
            </CardTitle>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setForm({ ...ex, lessonId: tripleId });
                setIsEditOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />{" "}
              <FormattedMessage
                id="admin.lessons.manager.editButton"
                defaultMessage="Düzenle"
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setPreviewEx(ex)}
            >
              <FormattedMessage
                id="admin.lessons.manager.previewButton"
                defaultMessage="Önizleme"
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => onDuplicate(ex)}
            >
              <FormattedMessage
                id="admin.lessons.manager.duplicateButton"
                defaultMessage="Çoğalt"
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 sm:w-auto"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  window.confirm(
                    "Bu egzersizi kalıcı olarak silmek istediğinize emin misiniz?"
                  )
                ) {
                  onDelete(ex._id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />{" "}
              <FormattedMessage
                id="admin.lessons.manager.deleteButton"
                defaultMessage="Sil"
              />
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <CardDescription className="font-medium">
            {(ex.type || "").startsWith("education_")
              ? (ex as any).educationContent?.title || "Education Content"
              : ex.instruction}
          </CardDescription>
          {renderPreview(ex)}
        </CardContent>
      </Card>
    );
  };

  const onAddSubmit = async () => {
    try {
      setPending(true);
      const token = await getToken();
      const isEducation = form.type.startsWith("education_");
      const trimmedAnswerAudio = (form.answerAudioUrl || "").trim();
      const sanitizedMediaPack = prepareMediaPack(form.mediaPack);
      const sanitizedHoverHint = prepareHoverHint(form.hoverHint);
      const payload = {
        lessonId: lessonData.lessonId,
        unitId: lessonData.unitId,
        chapterId: lessonData.chapterId,
        languageId: lessonData.languageId,
        type: form.type,
        instruction: isEducation ? "" : (form.instruction || "").trim(),
        sourceText: isEducation ? "" : (form.sourceText || "").trim(),
        sourceLanguage: (form.sourceLanguage || "").toLowerCase(),
        targetLanguage: (form.targetLanguage || "").toLowerCase(),
        correctAnswer: isEducation ? [] : (form.correctAnswer || []).map((a: string) => a.trim()),
        options: isEducation ? [] : (form.options || []).map((o: string) => o.trim()).filter(Boolean),
        isNewWord: isEducation ? false : !!form.isNewWord,
        audioUrl: isEducation ? "" : (form.audioUrl || "").trim(),
        neutralAnswerImage: form.neutralAnswerImage || "",
        badAnswerImage: form.badAnswerImage || "",
        correctAnswerImage: form.correctAnswerImage || "",
        educationContent: isEducation ? form.educationContent : undefined,
        mediaPack: isEducation ? undefined : sanitizedMediaPack,
        hoverHint: isEducation ? undefined : sanitizedHoverHint,
        answerAudioUrl: isEducation ? undefined : trimmedAnswerAudio || undefined,
        ttsVoiceId: isEducation ? undefined : (form.ttsVoiceId || undefined),
        autoRevealMilliseconds: isEducation
          ? undefined
          : form.autoRevealMilliseconds ?? undefined,
      };
      const res = await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 201) {
        setExercises((prev) => [...prev, res.data.data]);
        setIsAddOpen(false);
        toast.success("Egzersiz oluşturuldu");
      }
    } catch (e: any) {
      toast.error(extractApiMessage(e, "Egzersiz oluşturulamadı"));
    } finally {
      setPending(false);
    }
  };

  const onEditSubmit = async () => {
    try {
      setPending(true);
      const token = await getToken();
      const isEducation = form.type.startsWith("education_");
      const trimmedAnswerAudio = (form.answerAudioUrl || "").trim();
      const sanitizedMediaPack = prepareMediaPack(form.mediaPack);
      const sanitizedHoverHint = prepareHoverHint(form.hoverHint);
      const payload = {
        lessonId: lessonData.lessonId,
        unitId: lessonData.unitId,
        chapterId: lessonData.chapterId,
        languageId: lessonData.languageId,
        type: form.type,
        instruction: isEducation ? "" : (form.instruction || "").trim(),
        sourceText: isEducation ? "" : (form.sourceText || "").trim(),
        sourceLanguage: form.sourceLanguage,
        targetLanguage: form.targetLanguage,
        correctAnswer: isEducation ? [] : (form.correctAnswer || []).map((a: string) => a.trim()),
        options: isEducation ? [] : (form.options || []).map((o: string) => o.trim()).filter(Boolean),
        isNewWord: isEducation ? false : !!form.isNewWord,
        audioUrl: isEducation ? "" : (form.audioUrl || "").trim(),
        neutralAnswerImage: form.neutralAnswerImage || "",
        badAnswerImage: form.badAnswerImage || "",
        correctAnswerImage: form.correctAnswerImage || "",
        isActive: form.isActive,
        educationContent: isEducation ? form.educationContent : undefined,
        mediaPack: isEducation ? undefined : sanitizedMediaPack,
        hoverHint: isEducation ? undefined : sanitizedHoverHint,
        answerAudioUrl: isEducation ? undefined : trimmedAnswerAudio || undefined,
        ttsVoiceId: isEducation ? undefined : (form.ttsVoiceId || undefined),
        autoRevealMilliseconds: isEducation
          ? undefined
          : form.autoRevealMilliseconds ?? undefined,
      };
      const res = await apiClient.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises/${form._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setExercises((prev) => prev.map((ex) => (ex._id === form._id ? res.data.data : ex)));
        setIsEditOpen(false);
        toast.success("Egzersiz güncellendi");
      }
    } catch (e: any) {
      toast.error(extractApiMessage(e, "Egzersiz güncellenemedi"));
    } finally {
      setPending(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await apiClient.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setExercises((prev) => prev.filter((x) => x._id !== id));
        toast.success("Egzersiz silindi");
      }
    } catch (e: any) {
      toast.error(extractApiMessage(e, "Egzersiz silinemedi"));
    }
  };

  const onDuplicate = async (ex: ExerciseResponse) => {
    try {
      const token = await getToken();
      const isEducation = (ex.type || '').startsWith('education_');
      const payload: any = {
        lessonId: lessonData.lessonId,
        unitId: lessonData.unitId,
        chapterId: lessonData.chapterId,
        languageId: lessonData.languageId,
        type: ex.type,
        instruction: isEducation ? '' : ex.instruction || '',
        sourceText: isEducation ? '' : ex.sourceText || '',
        sourceLanguage: (ex as any).sourceLanguage,
        targetLanguage: (ex as any).targetLanguage,
        correctAnswer: isEducation ? [] : (ex.correctAnswer || []),
        options: isEducation ? [] : (ex.options || []),
        isNewWord: isEducation ? false : !!ex.isNewWord,
        audioUrl: isEducation ? '' : (ex.audioUrl || ''),
        neutralAnswerImage: (ex as any).neutralAnswerImage || '',
        badAnswerImage: (ex as any).badAnswerImage || '',
        correctAnswerImage: (ex as any).correctAnswerImage || '',
        educationContent: isEducation ? (ex as any).educationContent : undefined,
        mediaPack: isEducation ? undefined : ex.mediaPack,
        hoverHint: isEducation ? undefined : ex.hoverHint,
        answerAudioUrl: isEducation ? undefined : ex.answerAudioUrl,
        ttsVoiceId: isEducation ? undefined : ex.ttsVoiceId,
        autoRevealMilliseconds: isEducation ? undefined : ex.autoRevealMilliseconds,
      };
      const res = await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 201) {
        setExercises((prev) => [...prev, res.data.data]);
        toast.success("Egzersiz kopyalandı");
      }
    } catch(e:any){
      toast.error(extractApiMessage(e, "Egzersiz kopyalanamadı"));
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;
    setExercises((prev) => {
      const arr = Array.from(prev);
      const [moved] = arr.splice(src, 1);
      arr.splice(dst, 0, moved);
      return arr;
    });
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    try {
      setPending(true);
      const token = await getToken();
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i] as any;
        const payload = {
          lessonId: lessonData.lessonId,
          unitId: lessonData.unitId,
          chapterId: lessonData.chapterId,
          languageId: lessonData.languageId,
          type: ex.type,
          instruction: ex.instruction || "",
          sourceText: ex.sourceText || "",
          sourceLanguage: ex.sourceLanguage,
          targetLanguage: ex.targetLanguage,
          correctAnswer: ex.correctAnswer || [],
          options: ex.options || [],
          isNewWord: !!ex.isNewWord,
          audioUrl: ex.audioUrl || "",
          neutralAnswerImage: ex.neutralAnswerImage || "",
          badAnswerImage: ex.badAnswerImage || "",
          correctAnswerImage: ex.correctAnswerImage || "",
          isActive: ex.isActive !== false,
          educationContent: ex.educationContent,
          mediaPack: ex.mediaPack,
          hoverHint: ex.hoverHint,
          answerAudioUrl: ex.answerAudioUrl,
          ttsVoiceId: ex.ttsVoiceId,
          autoRevealMilliseconds: ex.autoRevealMilliseconds,
          order: i + 1,
        };
        await apiClient.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/exercises/${ex._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success("Sıralama kaydedildi");
      setOrderDirty(false);
    } catch (e:any) {
      toast.error(extractApiMessage(e, "Sıralama kaydedilemedi"));
    } finally { setPending(false); }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/lessons")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <FormattedMessage
                  id="admin.lessons.manager.lesson"
                  defaultMessage="Ders:"
                />{" "}
                {lessonData.title}
              </h1>
              <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
                {lessonData.description}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Badge variant="secondary">
              {exercises.length} <FormattedMessage id="admin.lessons.exercises" defaultMessage="Exercises:" />
            </Badge>
            {orderDirty && (
              <Badge variant="outline">
                <FormattedMessage
                  id="admin.lessons.manager.reorderPending"
                  defaultMessage="Sıralama kaydedilmedi"
                />
              </Badge>
            )}
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setForm((f: any) => ({
                  ...f,
                  _id: "",
                  lessonId: tripleId,
                  type: "translate",
                  instruction: "",
                  sourceText: "",
                  sourceLanguage: "",
                  targetLanguage: "",
                  correctAnswer: [""],
                  options: ["", "", "", "", ""],
                  isNewWord: false,
                  audioUrl: "",
                  neutralAnswerImage: "",
                  badAnswerImage: "",
                  correctAnswerImage: "",
                  isActive: true,
                  educationContent: null,
                  mediaPack: {
                    idleAnimationUrl: "",
                    successAnimationUrl: "",
                    failAnimationUrl: "",
                    characterName: "",
                  },
                  hoverHint: {
                    text: "",
                    audioUrl: "",
                  },
                  answerAudioUrl: "",
                  ttsVoiceId: "",
                  autoRevealMilliseconds: null,
                }));
                setIsAddOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />{" "}
              <FormattedMessage
                id="admin.lessons.manager.addExerciseButton"
                defaultMessage="Egzersiz Ekle"
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orderDirty && (
          <div className="flex justify-end">
            <Button className="w-full sm:w-auto" disabled={pending} onClick={saveOrder}>
              <FormattedMessage
                id="admin.lessons.manager.saveOrder"
                defaultMessage="Sıralamayı Kaydet"
              />
            </Button>
          </div>
        )}
        {isDndReady ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="exercise-list"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {exercises.map((ex, idx) => (
                    <Draggable
                      draggableId={String(ex._id || idx)}
                      index={idx}
                      key={ex._id || idx}
                    >
                      {(pp) => (
                        <div
                          ref={pp.innerRef}
                          {...pp.draggableProps}
                          {...pp.dragHandleProps}
                        >
                          <ExerciseCard ex={ex} idx={idx} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="space-y-4">
            {exercises.map((ex, idx) => (
              <div key={ex._id || idx} className="animate-pulse">
                <ExerciseCard ex={ex} idx={idx} />
              </div>
            ))}
          </div>
        )}
        {exercises.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle><FormattedMessage id="admin.lessons.manager.noExercisesTitle" defaultMessage="Henüz egzersiz yok" /></CardTitle>
              <CardDescription><FormattedMessage id="admin.lessons.manager.noExercisesDescription" defaultMessage="Bu derse ilk egzersizini ekle." /></CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Add Dialog */}
      <ExerciseDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        newExercise={form}
        setNewExercise={setForm}
        onSubmit={onAddSubmit}
        isLoading={pending}
        isEdit={false}
      />

      {/* Edit Dialog */}
      <ExerciseDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        newExercise={form}
        setNewExercise={setForm}
        onSubmit={onEditSubmit}
        isLoading={pending}
        isEdit={true}
      />

      {/* Preview Modal */}
      <Dialog open={!!previewEx} onOpenChange={(o)=> !o && setPreviewEx(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle><FormattedMessage id="admin.lessons.manager.preview" defaultMessage="Önizleme" /></DialogTitle>
          </DialogHeader>
          {previewEx && (
            <div className="space-y-2">
              <CardDescription className="font-medium">
                {(previewEx.type || '').startsWith('education_') ? (previewEx as any).educationContent?.title || 'Education Content' : previewEx.instruction}
              </CardDescription>
              {renderPreview(previewEx)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
