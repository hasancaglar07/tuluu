import { FormattedMessage } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/payments";

interface InvoiceDetailsProps {
  invoice: Invoice;
}

/**
 * Invoice Details Component
 *
 * Displays company information, customer details, and invoice metadata
 *
 * @param props - Component props
 * @returns JSX.Element - The invoice details section
 */
export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between flex-col md:flex-row gap-6">
          <div>
            <h2 className="font-bold text-xl mb-1">{invoice.company.name}</h2>
            <p className="text-sm text-muted-foreground">
              {invoice.company.address}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.company.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.company.phone}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-primary/10 p-4 rounded-lg inline-block">
              <h3 className="font-bold text-lg text-primary">
                <FormattedMessage
                  id="admin.payments.invoice.details.invoiceLabel"
                  defaultMessage="INVOICE"
                />
              </h3>
              <p className="text-sm text-muted-foreground">#{invoice.number}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">
              <FormattedMessage
                id="admin.payments.invoice.details.billTo"
                defaultMessage="Bill To:"
              />
            </h3>
            <p className="font-medium">{invoice.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {invoice.customer.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.customer.address}
            </p>
          </div>
          <div className="md:text-right">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.invoice.details.invoiceDate"
                  defaultMessage="Invoice Date:"
                />
              </p>
              <p className="text-sm font-medium">{invoice.date}</p>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.invoice.details.dueDate"
                  defaultMessage="Due Date:"
                />
              </p>
              <p className="text-sm font-medium">{invoice.dueDate}</p>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.invoice.details.status"
                  defaultMessage="Status:"
                />
              </p>
              <div>
                <Badge
                  variant="outline"
                  className={getStatusColor(invoice.status)}
                >
                  <FormattedMessage
                    id={`admin.payments.invoice.status.${invoice.status}`}
                    defaultMessage={invoice.status}
                  />
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
