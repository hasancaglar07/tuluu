"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Promotion, promotionSchema } from "@/types/shop"
import { apiClient } from "@/lib/api-client"
import { FormattedMessage } from "react-intl"
import type { z } from "zod"

interface PromotionFormProps {
  promotion?: Promotion
  onClose: () => void
  onPromotionCreated?: (promotion: Promotion) => void
  onPromotionUpdated?: (promotion: Promotion) => void
}

/**
 * PromotionForm - Form component for creating or editing promotions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Promotion} [props.promotion] - Existing promotion for editing (optional)
 * @param {Function} props.onClose - Callback when form is closed
 * @param {Function} [props.onPromotionCreated] - Callback when promotion is created
 * @param {Function} [props.onPromotionUpdated] - Callback when promotion is updated
 */
export function PromotionForm({ promotion, onClose, onPromotionCreated, onPromotionUpdated }: PromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getToken } = useAuth()
  const isEditing = !!promotion

  // Define form with zod validation
  const form = useForm<z.infer<typeof promotionSchema>>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: promotion?.name || "",
      description: promotion?.description || "",
      type: promotion?.type || "discount",
      discount: promotion?.discount || "",
      startDate: promotion?.startDate || "",
      endDate: promotion?.endDate || "",
      status: promotion?.status || "upcoming",
      eligibility: promotion?.eligibility || "All users",
      target: promotion?.target || null,
      shopItemIds: promotion?.shopItemIds || [],
    },
  })

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof promotionSchema>) => {
    try {
      setIsSubmitting(true)
      const token = await getToken()

      if (isEditing && promotion) {
        // Update existing promotion
        const response = await apiClient.put(`/api/admin/shop/promotions/${promotion.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (onPromotionUpdated) {
          onPromotionUpdated(response.data.promotion)
        }
      } else {
        // Create new promotion
        const response = await apiClient.post("/api/admin/shop/promotions", data, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (onPromotionCreated) {
          onPromotionCreated(response.data.promotion)
        }
      }

      onClose()
    } catch (error) {
      console.error("Error saving promotion:", error)
      toast.error(<FormattedMessage id="promotions.error.save-promotion" defaultMessage="Failed to save promotion" />)
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
                    <FormattedMessage id="promotions.form.name" defaultMessage="Name" />
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
                    <FormattedMessage id="promotions.form.description" defaultMessage="Description" />
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
                      <FormattedMessage id="promotions.form.type" defaultMessage="Type" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="discount">
                          <FormattedMessage id="promotions.form.type.discount" defaultMessage="Discount" />
                        </SelectItem>
                        <SelectItem value="bundle">
                          <FormattedMessage id="promotions.form.type.bundle" defaultMessage="Bundle" />
                        </SelectItem>
                        <SelectItem value="seasonal">
                          <FormattedMessage id="promotions.form.type.seasonal" defaultMessage="Seasonal" />
                        </SelectItem>
                        <SelectItem value="boost">
                          <FormattedMessage id="promotions.form.type.boost" defaultMessage="Boost" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="promotions.form.discount" defaultMessage="Discount" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 20%, $10 off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="promotions.form.start-date" defaultMessage="Start Date" />
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
                      <FormattedMessage id="promotions.form.end-date" defaultMessage="End Date" />
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="promotions.form.status" defaultMessage="Status" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <FormattedMessage id="promotions.form.status.active" defaultMessage="Active" />
                        </SelectItem>
                        <SelectItem value="upcoming">
                          <FormattedMessage id="promotions.form.status.upcoming" defaultMessage="Upcoming" />
                        </SelectItem>
                        <SelectItem value="expired">
                          <FormattedMessage id="promotions.form.status.expired" defaultMessage="Expired" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="promotions.form.target" defaultMessage="Target Redemptions" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>
                      <FormattedMessage
                        id="promotions.form.target.description"
                        defaultMessage="Leave empty for unlimited redemptions"
                      />
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="eligibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="promotions.form.eligibility" defaultMessage="Eligibility" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    <FormattedMessage
                      id="promotions.form.eligibility.description"
                      defaultMessage="Who can use this promotion (e.g., All users, New users only)"
                    />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <FormattedMessage id="promotions.form.cancel" defaultMessage="Cancel" />
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <FormattedMessage id="promotions.form.saving" defaultMessage="Saving..." />
            ) : isEditing ? (
              <FormattedMessage id="promotions.form.update" defaultMessage="Update Promotion" />
            ) : (
              <FormattedMessage id="promotions.form.create" defaultMessage="Create Promotion" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
