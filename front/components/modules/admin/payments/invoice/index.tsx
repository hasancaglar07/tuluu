"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { FormattedMessage } from "react-intl";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { Invoice } from "@/types/payments";
import Loading from "@/components/custom/loading";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceDetails } from "./invoice-details";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceSummary } from "./invoice-summary";
import { InvoicePaymentInfo } from "./invoice-payment-info";

interface InvoiceManagementPageProps {
  invoiceId: string;
}

/**
 * Invoice Management Page Component
 *
 * This component manages the display of a single invoice including:
 * - Invoice header with actions (print, download)
 * - Company and customer information
 * - Invoice items and calculations
 * - Payment information and status
 *
 * @param props - Component props containing the invoice ID
 * @returns JSX.Element - The complete invoice display
 */
export function InvoiceManagementPage({
  invoiceId,
}: InvoiceManagementPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  /**
   * Fetch invoice data from the API
   */
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const response = await apiClient.get(
          `/api/admin/payments/invoice/${invoiceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setInvoice(response.data.data);
      } catch (err) {
        const error = err as AxiosError<{
          message?: string;
          errors?: Record<string, string[]>;
        }>;

        const message = error.response?.data?.message;
        toast.error(message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, getToken]);

  /**
   * Handle printing the invoice
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Handle downloading the invoice as PDF
   */
  const handleDownloadPDF = async () => {
    try {
      const token = await getToken();
      const response = await apiClient.get(
        `/api/admin/payments/invoice/${invoiceId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice?.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice downloaded successfully");
    } catch (err) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">
            <FormattedMessage
              id="admin.payments.invoice.notFound.title"
              defaultMessage="Invoice Not Found"
            />
          </h1>
          <p className="text-muted-foreground">
            <FormattedMessage
              id="admin.payments.invoice.notFound.description"
              defaultMessage="The requested invoice could not be found."
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <InvoiceHeader
        invoice={invoice}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
      />

      <div className="space-y-6">
        <InvoiceDetails invoice={invoice} />
        <InvoiceItemsTable items={invoice.items} />
        <InvoiceSummary
          subtotal={invoice.subtotal}
          tax={invoice.tax}
          total={invoice.total}
        />
        <InvoicePaymentInfo
          paymentMethod={invoice.paymentMethod}
          transactionId={invoice.transactionId}
          status={invoice.status}
        />
      </div>
    </div>
  );
}
