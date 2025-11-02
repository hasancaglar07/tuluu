"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Calendar, Tag, Percent, Gift, BarChart4, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Promotion } from "@/types/shop"
import { apiClient } from "@/lib/api-client"
import { FormattedMessage } from "react-intl"

interface PromotionCardProps {
  promotion: Promotion
  onSelect: () => void
  formatNumber: (num: number) => string
  onPromotionUpdated: (promotion: Promotion) => void
  onPromotionDeleted: (promotionId: string) => void
}

/**
 * PromotionCard - A card component to display promotion details
 *
 * @component
 * @param {Object} props - Component props
 * @param {Promotion} props.promotion - The promotion to display
 * @param {Function} props.onSelect - Callback when the card is selected
 * @param {Function} props.formatNumber - Function to format numbers
 * @param {Function} props.onPromotionUpdated - Callback when promotion is updated
 * @param {Function} props.onPromotionDeleted - Callback when promotion is deleted
 */
export function PromotionCard({
  promotion,
  onSelect,
  formatNumber,
  onPromotionUpdated,
  onPromotionDeleted,
}: PromotionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { getToken } = useAuth()

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "upcoming":
        return "secondary"
      case "expired":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Get promotion type icon
  const getPromoTypeIcon = (type: string) => {
    switch (type) {
      case "discount":
        return <Percent className="h-5 w-5" />
      case "bundle":
        return <Gift className="h-5 w-5" />
      case "seasonal":
        return <Calendar className="h-5 w-5" />
      case "boost":
        return <BarChart4 className="h-5 w-5" />
      default:
        return <Tag className="h-5 w-5" />
    }
  }

  // Handle promotion deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const token = await getToken()

      await apiClient.delete(`/api/admin/shop/promotions/${promotion.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      onPromotionDeleted(promotion.id)
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast.error(
        <FormattedMessage id="promotions.error.delete-promotion" defaultMessage="Failed to delete promotion" />,
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              {getPromoTypeIcon(promotion.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{promotion.name}</CardTitle>
              <CardDescription className="line-clamp-1">{promotion.description}</CardDescription>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(promotion.status)}>
            <FormattedMessage id={`promotions.status.${promotion.status}`} defaultMessage={promotion.status} />
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">
              <FormattedMessage id="promotions.card.type" defaultMessage="Type:" />
            </span>
            <span className="ml-1 font-medium capitalize">
              <FormattedMessage id={`promotions.type.${promotion.type}`} defaultMessage={promotion.type} />
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">
              <FormattedMessage id="promotions.card.discount" defaultMessage="Discount:" />
            </span>
            <span className="ml-1 font-medium">{promotion.discount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">
              <FormattedMessage id="promotions.card.start" defaultMessage="Start:" />
            </span>
            <span className="ml-1 font-medium">{promotion.startDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">
              <FormattedMessage id="promotions.card.end" defaultMessage="End:" />
            </span>
            <span className="ml-1 font-medium">{promotion.endDate}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">
              <FormattedMessage id="promotions.card.eligibility" defaultMessage="Eligibility:" />
            </span>
            <span className="ml-1 font-medium">{promotion.eligibility}</span>
          </div>
        </div>

        {promotion.target && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                <FormattedMessage id="promotions.card.redemptions" defaultMessage="Redemptions:" />
              </span>
              <span className="font-medium">
                {formatNumber(promotion.redemptions)} / {formatNumber(promotion.target)}
              </span>
            </div>
            <Progress value={promotion.progress || 0} className="h-2" />
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="pt-4">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onSelect}>
            <FormattedMessage id="promotions.button.view-details" defaultMessage="View Details" />
          </Button>
          <div className="flex gap-1">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <FormattedMessage id="promotions.dialog.delete.title" defaultMessage="Delete Promotion" />
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <FormattedMessage
                      id="promotions.dialog.delete.description"
                      defaultMessage="Are you sure you want to delete this promotion? This action cannot be undone."
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <FormattedMessage id="promotions.button.cancel" defaultMessage="Cancel" />
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <FormattedMessage id="promotions.button.deleting" defaultMessage="Deleting..." />
                    ) : (
                      <FormattedMessage id="promotions.button.delete" defaultMessage="Delete" />
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
