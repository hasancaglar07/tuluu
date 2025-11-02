import { FormattedMessage } from "react-intl";
import { Separator } from "@/components/ui/separator";

interface InvoiceSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Invoice Summary Component
 *
 * Displays the invoice totals including subtotal, tax, and final total
 *
 * @param props - Component props
 * @returns JSX.Element - The invoice summary section
 */
export function InvoiceSummary({ subtotal, tax, total }: InvoiceSummaryProps) {
  return (
    <div className="mt-6 flex justify-end">
      <div className="w-full md:w-1/3">
        <div className="flex justify-between py-2">
          <span className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.payments.invoice.summary.subtotal"
              defaultMessage="Subtotal:"
            />
          </span>
          <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.payments.invoice.summary.tax"
              defaultMessage="Tax:"
            />
          </span>
          <span className="text-sm font-medium">${tax.toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between py-2">
          <span className="font-semibold">
            <FormattedMessage
              id="admin.payments.invoice.summary.total"
              defaultMessage="Total:"
            />
          </span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
