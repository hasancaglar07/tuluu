"use client"

import { FormattedMessage } from "react-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, LogOut, Trash2 } from "lucide-react"

/**
 * DangerZone Component
 *
 * Component for account management actions like logout and account deletion.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Function to handle logout action
 * @param {Function} props.onDelete - Function to handle account deletion action
 */
export function DangerZone({
  onLogout,
  onDelete,
}: {
  onLogout: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="dangerZone.title" defaultMessage="Danger zone" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between w-full">
          <Button size="sm" variant="outline" className="justify-between" onClick={onLogout}>
            <div role="button" className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-gray-500" />
              <span>
                <FormattedMessage id="dangerZone.logout" defaultMessage="Log out" />
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>
                <FormattedMessage id="dangerZone.deleteAccount" defaultMessage="Delete my account" />
              </span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
