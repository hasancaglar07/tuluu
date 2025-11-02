"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Category, type ShopItem, shopItemSchema } from "@/types/shop"
import { apiClient } from "@/lib/api-client"
import { FormattedMessage } from "react-intl"
import type { z } from "zod"

interface ShopItemFormProps {
  item?: ShopItem
  categories: Category[]
  onClose: () => void
  onItemCreated?: (item: ShopItem) => void
  onItemUpdated?: (item: ShopItem) => void
}

/**
 * ShopItemForm - Form component for creating or editing shop items
 *
 * @component
 * @param {Object} props - Component props
 * @param {ShopItem} [props.item] - Existing item for editing (optional)
 * @param {Category[]} props.categories - Available categories
 * @param {Function} props.onClose - Callback when form is closed
 * @param {Function} [props.onItemCreated] - Callback when item is created
 * @param {Function} [props.onItemUpdated] - Callback when item is updated
 */
export function ShopItemForm({ item, categories, onClose, onItemCreated, onItemUpdated }: ShopItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getToken } = useAuth()
  const isEditing = !!item

  // Define form with zod validation
  const form = useForm<z.infer<typeof shopItemSchema>>({
    resolver: zodResolver(shopItemSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      type: item?.type || "cosmetic",
      category: item?.category || (categories[0]?.name || ""),
      price: item?.price || 0,
      currency: item?.currency || "gems",
      image: item?.image || "",
      stockType: item?.stockType || "unlimited",
      stockQuantity: item?.stockQuantity || 0,
      status: item?.status || "draft",
      eligibility: item?.eligibility || "All users",
      isLimitedTime: item?.isLimitedTime || false,
      startDate: item?.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
      endDate: item?.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      tags: item?.tags || [],
      featured: item?.featured || false,
    },
  })

  // Watch form values for conditional fields
  const stockType = form.watch("stockType")
  const isLimitedTime = form.watch("isLimitedTime")

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof shopItemSchema>) => {
    try {
      setIsSubmitting(true)
      const token = await getToken()

      if (isEditing && item) {
        // Update existing item
        const response = await apiClient.put(`/api/admin/shop/items/${item.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (onItemUpdated) {
          onItemUpdated(response.data.item)
        }
      } else {
        // Create new item
        const response = await apiClient.post("/api/admin/shop/items", data, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (onItemCreated) {
          onItemCreated(response.data.item)
        }
      }

      onClose()
    } catch (error) {
      console.error("Error saving shop item:", error)
      toast.error(<FormattedMessage id="shop.error.save-item" defaultMessage="Failed to save shop item" />)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="shop.form.name" defaultMessage="Name" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="shop.form.description" defaultMessage="Description" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="shop.form.type" defaultMessage="Type" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="power-up">
                          <FormattedMessage id="shop.form.type.power-up" defaultMessage="Power-up" />
                        </SelectItem>
                        <SelectItem value="cosmetic">
                          <FormattedMessage id="shop.form.type.cosmetic" defaultMessage="Cosmetic" />
                        </SelectItem>
                        <SelectItem value="consumable">
                          <FormattedMessage id="shop.form.type.consumable" defaultMessage="Consumable" />
                        </SelectItem>
                        <SelectItem value="currency">
                          <FormattedMessage id="shop.form.type.currency" defaultMessage="Currency" />
                        </SelectItem>
                        <SelectItem value="bundle">
                          <FormattedMessage id="shop.form.type.bundle" defaultMessage="Bundle" />
                        </SelectItem>
                        <SelectItem value="content">
                          <FormattedMessage id="shop.form.type.content" defaultMessage="Content" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="shop.form.category" defaultMessage="Category" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="shop.form.price" defaultMessage="Price" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                    <FormLabel>
                      <FormattedMessage id="shop.form.currency" defaultMessage="Currency" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gems">
                          <FormattedMessage id="shop.form.currency.gems" defaultMessage="Gems" />
                        </SelectItem>
                        <SelectItem value="coins">
                          <FormattedMessage id="shop.form.currency.coins" defaultMessage="Coins" />
                        </SelectItem>
                        <SelectItem value="USD">
                          <FormattedMessage id="shop.form.currency.usd" defaultMessage="USD" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="shop.form.image" defaultMessage="Image URL" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    <FormattedMessage id="shop.form.image.description" defaultMessage="URL to the item's image" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="shop.form.stock-type" defaultMessage="Stock Type" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stock type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unlimited">
                          <FormattedMessage id="shop.form.stock-type.unlimited" defaultMessage="Unlimited" />
                        </SelectItem>
                        <SelectItem value="limited">
                          <FormattedMessage id="shop.form.stock-type.limited" defaultMessage="Limited" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {stockType === "limited" && (
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage id="shop.form.stock-quantity" defaultMessage="Stock Quantity" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="shop.form.status" defaultMessage="Status" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <FormattedMessage id="shop.form.status.active" defaultMessage="Active" />
                        </SelectItem>
                        <SelectItem value="inactive">
                          <FormattedMessage id="shop.form.status.inactive" defaultMessage="Inactive" />
                        </SelectItem>
                        <SelectItem value="draft">
                          <FormattedMessage id="shop.form.status.draft" defaultMessage="Draft" />
                        </SelectItem>
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
                    <FormLabel>
                      <FormattedMessage id="shop.form.eligibility" defaultMessage="Eligibility" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isLimitedTime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        <FormattedMessage id="shop.form.limited-time" defaultMessage="Limited Time Offer" />
                      </FormLabel>
                      <FormDescription>
                        <FormattedMessage
                          id="shop.form.limited-time.description"
                          defaultMessage="This item is only available for a specific time period"
                        />
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {isLimitedTime && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FormattedMessage id="shop.form.start-date" defaultMessage="Start Date" />
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FormattedMessage id="shop.form.end-date" defaultMessage="End Date" />
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        <FormattedMessage id="shop.form.featured" defaultMessage="Featured Item" />
                      </FormLabel>
                      <FormDescription>
                        <FormattedMessage
                          id="shop.form.featured.description"
                          defaultMessage="This item will be highlighted in the shop"
                        />
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <FormattedMessage id="shop.form.cancel" defaultMessage="Cancel" />
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <FormattedMessage id="shop.form.saving" defaultMessage="Saving..." />
            ) : isEditing ? (
              <FormattedMessage id="shop.form.update" defaultMessage="Update Item" />
            ) : (
              <FormattedMessage id="shop.form.create" defaultMessage="Create Item" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
