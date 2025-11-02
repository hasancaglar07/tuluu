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
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500),
  type: z.enum([
    "daily",
    "weekly",
    "event",
    "monthly",
    "achievement",
    "custom",
  ]),
  goal: z.string().min(3, { message: "Goal must be at least 3 characters" }),
  rewardType: z.enum(["xp", "gems", "badge"]),
  rewardValue: z.string().min(1, { message: "Reward value is required" }),
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
          ? "Notifications enabled"
          : "Notifications disabled",
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
        throw new Error(result.error || "Failed to save quest");
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
        isEditing ? "Quest updated successfully" : "Quest created successfully"
      );

      // Call onSubmit to close dialog
      onSubmit();
    } catch (error) {
      console.error("Error saving quest:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save quest"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="form">Form</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
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
                      <FormLabel>Quest Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Daily XP Challenge"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short, catchy title for your quest.
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what users need to do to complete this quest"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Clearly explain the quest objectives and benefits.
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
                        <FormLabel>Quest Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type determines frequency and visibility.
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
                        <FormLabel>Target Users</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Which users should see this quest.
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
                      <FormLabel>Quest Goal</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Earn 50 XP" {...field} />
                      </FormControl>
                      <FormDescription>
                        What users need to achieve to complete the quest.
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
                      <FormLabel>Quest Duration</FormLabel>
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
                                <span>Pick a date range</span>
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
                        The start and end dates for the quest.
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
                        <FormLabel>Reward Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reward type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="xp">XP Points</SelectItem>
                            <SelectItem value="gems">Gems</SelectItem>
                            <SelectItem value="badge">Badge</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Type of reward users will receive.
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
                        <FormLabel>Reward Value</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("rewardType") === "badge"
                                ? "e.g., Master Linguist"
                                : "e.g., 50"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("rewardType") === "badge"
                            ? "Name of the badge"
                            : "Amount of reward"}
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
                          <FormLabel>Visibility</FormLabel>
                          <FormDescription>
                            Make this quest visible to users
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
                          <FormLabel>Notifications</FormLabel>
                          <FormDescription>
                            Send notifications to users about this quest
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#58cc02] hover:bg-[#58cc02]/90"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update Quest" : "Create Quest"}
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
                  {watchedValues.title || "Quest Title"}
                </h3>
                <Badge className="bg-green-500">Preview</Badge>
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
                    {watchedValues.type.charAt(0).toUpperCase() +
                      watchedValues.type.slice(1)}
                  </Badge>
                )}
                {!watchedValues.isVisible && (
                  <Badge
                    variant="outline"
                    className="border-gray-500 text-gray-700"
                  >
                    Hidden
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {watchedValues.description ||
                  "Quest description will appear here"}
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
                    This is a preview of how your quest will appear to users
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-medium">
                {watchedValues.goal || "Quest goal"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reward</p>
              <p className="text-sm font-medium">
                {watchedValues.rewardType === "xp" &&
                  `${watchedValues.rewardValue || "0"} XP`}
                {watchedValues.rewardType === "gems" &&
                  `${watchedValues.rewardValue || "0"} Gems`}
                {watchedValues.rewardType === "badge" &&
                  `Badge: ${watchedValues.rewardValue || "Name"}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-medium capitalize">
                {watchedValues.targetSegment || "All users"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {watchedValues.dateRange?.from &&
                watchedValues.dateRange?.to ? (
                  <>
                    {format(watchedValues.dateRange.from, "MMM d")} -{" "}
                    {format(watchedValues.dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  "Date range"
                )}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">
              How it will appear to users:
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
                          {watchedValues.title || "Quest Title"}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {watchedValues.dateRange?.from &&
                          watchedValues.dateRange?.to ? (
                            <>
                              Ends {format(watchedValues.dateRange.to, "MMM d")}
                            </>
                          ) : (
                            "Duration"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Reward</p>
                      <p className="text-sm font-medium">
                        {watchedValues.rewardType === "xp" &&
                          `${watchedValues.rewardValue || "0"} XP`}
                        {watchedValues.rewardType === "gems" &&
                          `${watchedValues.rewardValue || "0"} Gems`}
                        {watchedValues.rewardType === "badge" && `Badge`}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      {watchedValues.description || "Quest description"}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#58cc02] h-2.5 rounded-full w-0"></div>
                    </div>
                    <p className="text-xs text-right">0% complete</p>
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
                    <h5 className="font-medium">Notification Preview</h5>
                    <p className="text-sm text-muted-foreground">
                      {watchedValues.sendNotifications
                        ? `Users will be notified about "${
                            watchedValues.title || "this quest"
                          }"`
                        : "Notifications are disabled for this quest"}
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
