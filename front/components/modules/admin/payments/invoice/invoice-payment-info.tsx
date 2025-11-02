import { FormattedMessage } from "react-intl";
import { Separator } from "@/components/ui/separator";

interface InvoicePaymentInfoProps {
  paymentMethod: string;
  transactionId: string;
  status: string;
}

/**
 * Invoice Payment Information Component
 *
 * Displays payment method, transaction details, and footer information
 *
 * @param props - Component props
 * @returns JSX.Element - The payment information section
 */
export function InvoicePaymentInfo({
  paymentMethod,
  transactionId,
  status,
}: InvoicePaymentInfoProps) {
  return (
    <>
      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">
            <FormattedMessage
              id="admin.payments.invoice.payment.title"
              defaultMessage="Payment Information:"
            />
          </h3>
          <p className="text-sm">
            <span className="text-muted-foreground">
              <FormattedMessage
                id="admin.payments.invoice.payment.method"
                defaultMessage="Method:"
              />
            </span>{" "}
            {paymentMethod}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">
              <FormattedMessage
                id="admin.payments.invoice.payment.transactionId"
                defaultMessage="Transaction ID:"
              />
            </span>{" "}
            {transactionId}
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-muted-foreground mb-2">
            <FormattedMessage
              id="admin.payments.invoice.footer.thankYou"
              defaultMessage="Thank you for your business!"
            />
          </p>
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="admin.payments.invoice.footer.contact"
              defaultMessage="If you have any questions about this invoice, please contact us at billing@duolingoclone.com"
            />
          </p>
        </div>
      </div>
    </>
  );
}
