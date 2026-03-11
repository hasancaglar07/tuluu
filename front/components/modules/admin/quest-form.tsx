"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import types
import type { Quest, CreateQuestPayload } from "@/types";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

// Define the form schema with Zod - matching the API validation
const questFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Başlık en az 3 karakter olmalı" })
    .max(100),
  description: z
    .string()
    .min(10, { message: "Açıklama en az 10 karakter olmalı" })
    .max(500),
  type: z.enum([
    "daily",
    "weekly",
    "event",
    "monthly",
    "achievement",
    "custom",
  ]),
  goal: z.string().min(3, { message: "Hedef en az 3 karakter olmalı" }),
  rewardType: z.enum(["xp", "gems", "badge"]),
  rewardValue: z.string().min(1, { message: "Ödül değeri zorunludur" }),
  targetSegment: z.enum(["all", "free", "premium"]),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  isVisible: z.boolean().default(true).optional(),
  sendNotifications: z.boolean().default(true).optional(),
});

type QuestFormValues = z.infer<typeof questFormSchema>;

interface QuestFormProps {
  quest?: Quest;
  onSubmit: () => void;
  onSuccess?: (quest: Quest) => void;
  isEditing?: boolean;
}

export function QuestForm({
  quest,
  onSubmit,
  onSuccess,
  isEditing = false,
}: QuestFormProps) {
  const [previewTab, setPreviewTab] = useState<string>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<QuestFormValues> = {
    title: quest?.title || "",
    description: quest?.description || "",
    type: quest?.type || "daily",
    goal: quest?.goal || "",
    rewardType: (quest?.reward?.type as "xp" | "gems" | "badge") || "xp",
    rewardValue: quest?.reward?.value?.toString() || "",
    targetSegment: quest?.targetSegment || "all",
    dateRange: {
      from: quest?.startDate || new Date(),
      to: quest?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    },
    isVisible: quest?.isVisible !== false,
    sendNotifications: quest?.sendNotifications !== false,
  };

  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues,
  });

  const watchedValues = form.watch();
  const { getToken } = useAuth();

  const getQuestTypeLabel = (type?: string) => {
    switch (type) {
      case "daily":
        return "Günlük";
      case "weekly":
        return "Haftalık";
      case "event":
        return "Etkinlik";
      case "custom":
        return "Özel";
      default:
        return type || "Özel";
    }
  };

  const getTargetSegmentLabel = (segment?: string) => {
    switch (segment) {
      case "all":
        return "Tüm kullanıcılar";
      case "free":
        return "Ücretsiz";
      case "premium":
        return "Premium";
      default:
        return segment || "Tüm kullanıcılar";
    }
  };

  // Handle form submission
  async function handleSubmit(data: QuestFormValues) {
    try {
      setIsSubmitting(true);

      // Transform form data to match API payload
      const payload: CreateQuestPayload = {
        title: data.title,
        description: data.description,
        type: data.type,
        goal: data.goal,
        // Create conditions based on the goal (simplified for now)
        conditions: [
          {
            type: "earn_xp", // Default condition type
            target: 50, // Default target
            timeframe: "daily",
          },
        ],
        // Create rewards array from form data
        rewards: [
          {
            type: data.rewardType,
            value:
              data.rewardType === "badge"
                ? data.rewardValue
                : Number.parseInt(data.rewardValue),
          },
        ],
        startDate: data.dateRange.from.toISOString(),
        endDate: data.dateRange.to.toISOString(),
        targetSegment: data.targetSegment,
        isVisible: data.isVisible,
        // Map sendNotifications to other fields as needed
        notes: data.sendNotifications
          ? "Bildirimler açık"
          : "Bildirimler kapalı",
      };

      const token = await getToken();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      let response;

      if (isEditing && quest) {
        // Update existing quest
        response = await axios.put(
          process.env.NEXT_PUBLIC_API_URL + `/api/admin/quests/${quest.id}`,
          payload,
          config
        );
      } else {
        // Create new quest
        response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/api/admin/quests",
          payload,
          config
        );
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Görev kaydedilemedi");
      }

      // Transform the response data to match Quest type
      const savedQuest: Quest = {
        ...result.data,
        startDate: new Date(result.data.startDate),
        endDate: new Date(result.data.endDate),
        createdAt: new Date(result.data.createdAt),
        updatedAt: new Date(result.data.updatedAt),
      };

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(savedQuest);
      }

      // Show success message
      toast.success(
        isEditing
          ? "Görev başarıyla güncellendi"
          : "Görev başarıyla oluşturuldu"
      );

      // Call onSubmit to close dialog
      onSubmit();
    } catch (error) {
      console.error("Görev kaydetme hatası:", error);
      toast.error(
        error instanceof Error ? error.message : "Görev kaydedilemedi"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="form">Form Alanları</TabsTrigger>
        <TabsTrigger value="preview">Önizleme</TabsTrigger>
      </TabsList>
      <TabsContent value="form" className="mt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Görev Başlığı</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="örn. Günlük XP Görevi"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Görevin için kısa ve dikkat çekici bir başlık.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kullanıcıların görevi tamamlamak için ne yapması gerektiğini açıklayın"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Görevin hedeflerini ve faydalarını net şekilde açıklayın.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Type Field */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Görev Türü</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tür seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Günlük</SelectItem>
                            <SelectItem value="weekly">Haftalık</SelectItem>
                            <SelectItem value="event">Etkinlik</SelectItem>
                            <SelectItem value="custom">Özel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Tür, sıklığı ve görünürlüğü belirler.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Segment Field */}
                  <FormField
                    control={form.control}
                    name="targetSegment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hedef Kullanıcılar</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hedef kitle seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                            <SelectItem value="free">Ücretsiz</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Bu görevi hangi kullanıcıların göreceği.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Goal Field */}
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Görev Hedefi</FormLabel>
                      <FormControl>
                        <Input placeholder="örn. 50 XP kazan" {...field} />
                      </FormControl>
                      <FormDescription>
                        Kullanıcıların görevi tamamlamak için ulaşması gereken hedef.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {/* Date Range Field */}
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Görev Süresi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Tarih aralığı seçin</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Görevin başlangıç ve bitiş tarihleri.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Reward Type Field */}
                  <FormField
                    control={form.control}
                    name="rewardType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödül Türü</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ödül türü seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="xp">XP Puanı</SelectItem>
                            <SelectItem value="gems">Elmas</SelectItem>
                            <SelectItem value="badge">Rozet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Kullanıcıların alacağı ödül türü.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reward Value Field */}
                  <FormField
                    control={form.control}
                    name="rewardValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödül Değeri</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("rewardType") === "badge"
                                ? "örn. Usta Dilci"
                                : "örn. 50"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("rewardType") === "badge"
                            ? "Rozet adı"
                            : "Ödül miktarı"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  {/* Visibility Switch */}
                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Görünürlük</FormLabel>
                          <FormDescription>
                            Bu görevi kullanıcılara görünür yap
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

                  {/* Notifications Switch */}
                  <FormField
                    control={form.control}
                    name="sendNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Bildirimler</FormLabel>
                          <FormDescription>
                            Bu görev hakkında kullanıcılara bildirim gönder
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
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-[#58cc02] hover:bg-[#58cc02]/90"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Görevi Güncelle" : "Görev Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {watchedValues.title || "Görev Başlığı"}
                </h3>
                <Badge className="bg-green-500">Önizleme</Badge>
                {watchedValues.type && (
                  <Badge
                    variant="outline"
                    className={
                      watchedValues.type === "daily"
                        ? "border-green-500 text-green-700"
                        : watchedValues.type === "weekly"
                        ? "border-blue-500 text-blue-700"
                        : watchedValues.type === "event"
                        ? "border-purple-500 text-purple-700"
                        : "border-orange-500 text-orange-700"
                    }
                  >
                    {getQuestTypeLabel(watchedValues.type)}
                  </Badge>
                )}
                {!watchedValues.isVisible && (
                  <Badge
                    variant="outline"
                    className="border-gray-500 text-gray-700"
                  >
                    Gizli
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {watchedValues.description ||
                  "Görev açıklaması burada görünecek"}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Bu, görevin kullanıcılara nasıl görüneceğinin önizlemesidir.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Hedef</p>
              <p className="text-sm font-medium">
                {watchedValues.goal || "Görev hedefi"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ödül</p>
              <p className="text-sm font-medium">
                {watchedValues.rewardType === "xp" &&
                  `${watchedValues.rewardValue || "0"} XP`}
                {watchedValues.rewardType === "gems" &&
                  `${watchedValues.rewardValue || "0"} Elmas`}
                {watchedValues.rewardType === "badge" &&
                  `Rozet: ${watchedValues.rewardValue || "İsim"}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hedef Kitle</p>
              <p className="text-sm font-medium">
                {getTargetSegmentLabel(watchedValues.targetSegment)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Süre</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {watchedValues.dateRange?.from &&
                watchedValues.dateRange?.to ? (
                  <>
                    {format(watchedValues.dateRange.from, "MMM d")} -{" "}
                    {format(watchedValues.dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  "Tarih aralığı"
                )}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">
              Kullanıcılara nasıl görünecek:
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-[#58cc02] flex items-center justify-center text-white font-bold">
                        {watchedValues.type === "daily"
                          ? "D"
                          : watchedValues.type === "weekly"
                          ? "W"
                          : watchedValues.type === "event"
                          ? "E"
                          : "C"}
                      </div>
                      <div>
                        <h5 className="font-medium">
                          {watchedValues.title || "Görev Başlığı"}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {watchedValues.dateRange?.from &&
                          watchedValues.dateRange?.to ? (
                            <>
                              Bitiş {format(watchedValues.dateRange.to, "MMM d")}
                            </>
                          ) : (
                            "Süre"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Ödül</p>
                      <p className="text-sm font-medium">
                        {watchedValues.rewardType === "xp" &&
                          `${watchedValues.rewardValue || "0"} XP`}
                        {watchedValues.rewardType === "gems" &&
                          `${watchedValues.rewardValue || "0"} Elmas`}
                        {watchedValues.rewardType === "badge" && `Rozet`}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      {watchedValues.description || "Görev açıklaması"}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#58cc02] h-2.5 rounded-full w-0"></div>
                    </div>
                    <p className="text-xs text-right">%0 tamamlandı</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-2">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                      {watchedValues.sendNotifications ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#58cc02]"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                          <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                          <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                          <path d="m2 2 20 20"></path>
                        </svg>
                      )}
                    </div>
                    <h5 className="font-medium">Bildirim Önizlemesi</h5>
                    <p className="text-sm text-muted-foreground">
                      {watchedValues.sendNotifications
                        ? `Kullanıcılar "${
                            watchedValues.title || "bu görev"
                          }"`
                        : "Bu görev için bildirimler kapalı"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
