import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { Invoice } from "@/types/payments";

interface InvoiceHeaderProps {
  invoice: Invoice;
  onPrint: () => void;
  onDownloadPDF: () => void;
}

/**
 * Invoice Header Component
 *
 * Displays the invoice title and action buttons for printing and downloading
 *
 * @param props - Component props
 * @returns JSX.Element - The invoice header with actions
 */
export function InvoiceHeader({
  invoice,
  onPrint,
  onDownloadPDF,
}: InvoiceHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">
        <FormattedMessage
          id="admin.payments.invoice.title"
          defaultMessage="Invoice #{number}"
          values={{ number: invoice.number }}
        />
      </h1>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.payments.invoice.actions.print"
            defaultMessage="Print"
          />
        </Button>
        <Button size="sm" onClick={onDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.payments.invoice.actions.downloadPDF"
            defaultMessage="Download PDF"
          />
        </Button>
      </div>
    </div>
  );
}
