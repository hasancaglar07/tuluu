"use client";

import { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentRefund } from "@/types/payments";
import { apiClient } from "@/lib/api-client";

/**
 * RefundsTable Component
 *
 * Displays a table of payment refunds with the following features:
 * - Real-time data fetching from Stripe API
 * - Status badges for different refund states
 * - Action menu for viewing details and downloading receipts
 * - Loading states and error handling
 * - Full internationalization support
 *
 * @returns JSX.Element - The refunds table component
 */
export function RefundsTable() {
  const [refunds, setRefunds] = useState<PaymentRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches refunds data from the API
   * Makes a request to /api/admin/payments/refunds to get Stripe refund data
   */
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/admin/payments/refunds");

      const data = await response.data;
      setRefunds(data.refunds || []);
    } catch (err) {
      console.error("Error fetching refunds:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRefunds();
  }, []);

  /**
   * Returns the appropriate badge variant based on refund status
   * @param status - The refund status from Stripe
   * @returns The badge variant string
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default"; // Green
      case "pending":
        return "secondary"; // Yellow
      case "failed":
        return "destructive"; // Red
      case "canceled":
        return "outline"; // Gray
      default:
        return "secondary";
    }
  };

  /**
   * Handles viewing refund details
   * @param refundId - The ID of the refund to view
   */
  const handleViewDetails = (refundId: string) => {
    // TODO: Navigate to refund details page or open modal
    console.log("View refund details:", refundId);
  };

  /**
   * Handles downloading refund receipt
   * @param refundId - The ID of the refund receipt to download
   */
  const handleDownloadReceipt = async (refundId: string) => {
    try {
      // TODO: Implement receipt download from Stripe
      console.log("Download receipt for refund:", refundId);
    } catch (err) {
      console.error("Error downloading receipt:", err);
    }
  };

  /**
   * Formats currency amount for display
   * @param amount - Amount in cents
   * @param currency - Currency code
   * @returns Formatted currency string
   */
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  /**
   * Formats date for display
   * @param timestamp - Unix timestamp
   * @returns Formatted date string
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <FormattedMessage
              id="admin.payments.refunds.title"
              defaultMessage="Refunds"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <FormattedMessage
              id="admin.payments.refunds.title"
              defaultMessage="Refunds"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              <FormattedMessage
                id="admin.payments.refunds.error"
                defaultMessage="Failed to load refunds: {error}"
                values={{ error }}
              />
            </p>
            <Button onClick={fetchRefunds} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              <FormattedMessage
                id="admin.payments.refunds.retry"
                defaultMessage="Retry"
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <FormattedMessage
            id="admin.payments.refunds.title"
            defaultMessage="Refunds"
          />
        </CardTitle>
        <Button onClick={fetchRefunds} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          <FormattedMessage
            id="admin.payments.refunds.refresh"
            defaultMessage="Refresh"
          />
        </Button>
      </CardHeader>
      <CardContent>
        {refunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              <FormattedMessage
                id="admin.payments.refunds.empty"
                defaultMessage="No refunds found"
              />
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <FormattedMessage
                    id="admin.payments.refunds.table.id"
                    defaultMessage="Refund ID"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.payments.refunds.table.originalPayment"
                    defaultMessage="Original Payment"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.payments.refunds.table.amount"
                    defaultMessage="Amount"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.payments.refunds.table.status"
                    defaultMessage="Status"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.payments.refunds.table.reason"
                    defaultMessage="Reason"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.payments.refunds.table.date"
                    defaultMessage="Date"
                  />
                </TableHead>
                <TableHead className="w-[50px]">
                  <FormattedMessage
                    id="admin.payments.refunds.table.actions"
                    defaultMessage="Actions"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell className="font-mono text-sm">
                    {refund.id}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {refund.payment_intent}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(refund.amount, refund.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(refund.status)}>
                      {refund.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{refund.reason || "N/A"}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(refund.created)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(refund.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <FormattedMessage
                            id="admin.payments.refunds.actions.viewDetails"
                            defaultMessage="View Details"
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadReceipt(refund.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <FormattedMessage
                            id="admin.payments.refunds.actions.downloadReceipt"
                            defaultMessage="Download Receipt"
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
