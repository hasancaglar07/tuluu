"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import axios, { type AxiosError } from "axios";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Category, ShopItem } from "@/types";

// Type definitions

interface ShopItemFormProps {
  onClose: () => void;
  editItem?: ShopItem | null;
  categories?: Category[];
  onItemCreated?: (item: ShopItem) => void;
  onItemUpdated?: (item: ShopItem) => void;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ShopItemResponse {
  item: ShopItem;
}

// Form schema with validation
const shopItemSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500),
  type: z.enum([
    "power-up",
    "cosmetic",
    "consumable",
    "currency",
    "bundle",
    "content",
  ]),
  category: z.string().min(1, { message: "Please select a category" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  currency: z.enum(["gems", "coins", "USD"]),
  stockType: z.enum(["unlimited", "limited"]),
  stockQuantity: z.coerce.number().optional(),
  eligibility: z.string().optional(),
  isLimitedTime: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
  sendNotification: z.boolean().default(false),
  notificationMessage: z.string().optional(),
});

// Form values type derived from schema
type ShopItemFormValues = z.infer<typeof shopItemSchema>;

export function ShopItemForm({
  onClose,
  editItem = null,
  categories = [],
  onItemCreated,
  onItemUpdated,
}: ShopItemFormProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [loading, setLoading] = useState<boolean>(false);
  const { getToken, userId } = useAuth();

  // Initialize form with proper typing
  const form = useForm<ShopItemFormValues>({
    resolver: zodResolver(shopItemSchema),
    defaultValues: editItem
      ? {
          name: editItem.name,
          description: editItem.description,
          type: editItem.type,
          category: editItem.category,
          price: editItem.price,
          currency: editItem.currency,
          stockType:
            editItem.stockType ||
            (editItem.stock === "Unlimited" ? "unlimited" : "limited"),
          stockQuantity:
            editItem.stockQuantity ??
            (editItem.stock && editItem.stock !== "Unlimited"
              ? Number.parseInt(editItem.stock.replace(/\D/g, ""))
              : undefined),
          eligibility: editItem.eligibility || "All users",
          isLimitedTime: editItem.isLimitedTime || false,
          startDate: editItem.startDate
            ? new Date(editItem.startDate)
            : undefined,
          endDate: editItem.endDate ? new Date(editItem.endDate) : undefined,
          isActive: editItem.status === "active",
          sendNotification: editItem.sendNotification || false,
          notificationMessage: editItem.notificationMessage || "",
        }
      : {
          name: "",
          description: "",
          type: "power-up",
          category: "",
          price: 100,
          currency: "gems",
          stockType: "unlimited",
          stockQuantity: undefined,
          eligibility: "All users",
          isLimitedTime: false,
          startDate: undefined,
          endDate: undefined,
          isActive: true,
          sendNotification: false,
          notificationMessage: "",
        },
  });

  // Watch form values for preview
  const watchedValues = form.watch();

  // Submit handler with proper error typing
  async function onSubmit(data: ShopItemFormValues): Promise<void> {
    setLoading(true);
    try {
      const token = await getToken();

      // Prepare the data for API
      const apiData = {
        ...data,
        startDate: data.startDate ? data.startDate.toISOString() : undefined,
        endDate: data.endDate ? data.endDate.toISOString() : undefined,
        lastModifiedBy: userId,
      };

      if (editItem) {
        // Update existing item
        const response = await axios.put<ApiResponse<ShopItemResponse>>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shop/items/${editItem.id}`,
          apiData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && response.data.data) {
          onItemUpdated?.(response.data.data.item);
          toast.success("Shop item updated successfully");
        }
      } else {
        // Create new item
        const response = await axios.post<ApiResponse<ShopItemResponse>>(
          process.env.NEXT_PUBLIC_API_URL + "/api/admin/shop/items",
          apiData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && response.data.data) {
          onItemCreated?.(response.data.data.item);
          toast.success("Shop item created successfully");
        }
      }

      onClose();
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
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 py-4 max-h-[80vh] overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Item Details</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Streak Freeze" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="power-up">Power-up</SelectItem>
                          <SelectItem value="cosmetic">Cosmetic</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="currency">Currency</SelectItem>
                          <SelectItem value="bundle">Bundle</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this item does..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly explain what this item does or provides to the
                      user.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eligibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility</FormLabel>
                      <FormControl>
                        <Input placeholder="All users" {...field} />
                      </FormControl>
                      <FormDescription>
                        Who can purchase this item (e.g., Level 5+)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gems">Gems</SelectItem>
                          <SelectItem value="coins">Coins</SelectItem>
                          <SelectItem value="USD">Real Money (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Item is available in shop
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stockType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stock type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                          <SelectItem value="limited">
                            Limited Quantity
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("stockType") === "limited" && (
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="isLimitedTime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Limited Time Offer</FormLabel>
                      <FormDescription>
                        Item is only available for a specific time period
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("isLimitedTime") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Separator />

              <FormField
                control={form.control}
                name="sendNotification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send Notification</FormLabel>
                      <FormDescription>
                        Notify users when this item becomes available
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("sendNotification") && (
                <FormField
                  control={form.control}
                  name="notificationMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="New item available in the shop!"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="flex justify-center">
                <Card className="w-full max-w-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {watchedValues.name || "Item Name"}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {watchedValues.description ||
                            "Item description will appear here"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            watchedValues.isActive ? "default" : "secondary"
                          }
                        >
                          {watchedValues.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {watchedValues.isLimitedTime && (
                          <Badge variant="outline" className="text-xs">
                            Limited Time
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <div className="flex justify-center items-center h-32 bg-background rounded-md mb-3">
                        <div className="text-muted-foreground text-sm">
                          Item Image Preview
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Type:
                          </span>
                          <span className="ml-1 font-medium capitalize">
                            {watchedValues.type}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Category:
                          </span>
                          <span className="ml-1 font-medium">
                            {watchedValues.category || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="ml-1 font-medium">
                          {watchedValues.stockType === "unlimited"
                            ? "Unlimited"
                            : `Limited (${watchedValues.stockQuantity || 0})`}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Eligibility:
                        </span>
                        <span className="ml-1 font-medium">
                          {watchedValues.eligibility || "All users"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Price:
                        </span>
                        <span className="ml-1 text-lg font-bold">
                          {watchedValues.price || 0}
                          {watchedValues.currency === "gems"
                            ? " gems"
                            : watchedValues.currency === "coins"
                            ? " coins"
                            : watchedValues.currency === "USD"
                            ? " USD"
                            : ""}
                        </span>
                      </div>
                      <Button size="sm">Buy Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        This is a preview of how the item will appear in the
                        shop
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        The actual appearance may vary slightly based on the
                        app&apos;s theme and layout
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editItem ? "Update Item" : "Create Item"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
