"use client"

import { CheckCircle2, AlertTriangle, Clock, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InventoryItem } from "@/types/shop"
import { EmptyState } from "../empty-state"
import { FormattedMessage } from "react-intl"

interface InventoryTableProps {
  items: InventoryItem[]
  loading: boolean
  formatNumber: (num: number) => string
  onUpdateStock: (itemId: string, newStock: string) => void
}

/**
 * InventoryTable - Table component for displaying inventory items
 *
 * @component
 * @param {Object} props - Component props
 * @param {InventoryItem[]} props.items - The inventory items to display
 * @param {boolean} props.loading - Whether the items are loading
 * @param {Function} props.formatNumber - Function to format numbers
 * @param {Function} props.onUpdateStock - Callback when stock is updated
 */
export function InventoryTable({ items, loading, formatNumber, onUpdateStock }: InventoryTableProps) {
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "secondary" // Using secondary for warning-like appearance
      case "Out of Stock":
        return "destructive"
      case "Expiring Soon":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Get status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "In Stock":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Low Stock":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "Out of Stock":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "Expiring Soon":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <FormattedMessage id="inventory.table.item-name" defaultMessage="Item Name" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="inventory.table.category" defaultMessage="Category" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="inventory.table.stock" defaultMessage="Stock" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="inventory.table.status" defaultMessage="Status" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="inventory.table.purchases" defaultMessage="Purchases" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="inventory.table.last-updated" defaultMessage="Last Updated" />
                </TableHead>
                <TableHead className="text-right">
                  <FormattedMessage id="inventory.table.actions" defaultMessage="Actions" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-muted rounded animate-pulse w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-muted rounded animate-pulse w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={Package}
            title="No items found"
            description="Try adjusting your search or filter criteria"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <FormattedMessage id="inventory.table.item-name" defaultMessage="Item Name" />
              </TableHead>
              <TableHead>
                <FormattedMessage id="inventory.table.category" defaultMessage="Category" />
              </TableHead>
              <TableHead>
                <FormattedMessage id="inventory.table.stock" defaultMessage="Stock" />
              </TableHead>
              <TableHead>
                <FormattedMessage id="inventory.table.status" defaultMessage="Status" />
              </TableHead>
              <TableHead>
                <FormattedMessage id="inventory.table.purchases" defaultMessage="Purchases" />
              </TableHead>
              <TableHead>
                <FormattedMessage id="inventory.table.last-updated" defaultMessage="Last Updated" />
              </TableHead>
              <TableHead className="text-right">
                <FormattedMessage id="inventory.table.actions" defaultMessage="Actions" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={item.status} />
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      <FormattedMessage
                        id={`inventory.status.${item.status.toLowerCase().replace(/\s+/g, "-")}`}
                        defaultMessage={item.status}
                      />
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{formatNumber(item.purchases)}</TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onUpdateStock(item.id, item.stock)}>
                    <FormattedMessage id="inventory.button.update" defaultMessage="Update" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
