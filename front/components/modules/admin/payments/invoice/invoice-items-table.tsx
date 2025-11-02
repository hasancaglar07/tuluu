import { FormattedMessage } from "react-intl";
import { InvoiceItem } from "@/types/payments";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

/**
 * Invoice Items Table Component
 *
 * Displays a table of invoice line items with descriptions, quantities, and amounts
 *
 * @param props - Component props
 * @returns JSX.Element - The invoice items table
 */
export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="text-left p-3 text-sm font-semibold">
              <FormattedMessage
                id="admin.payments.invoice.items.description"
                defaultMessage="Description"
              />
            </th>
            <th className="text-center p-3 text-sm font-semibold">
              <FormattedMessage
                id="admin.payments.invoice.items.quantity"
                defaultMessage="Quantity"
              />
            </th>
            <th className="text-right p-3 text-sm font-semibold">
              <FormattedMessage
                id="admin.payments.invoice.items.unitPrice"
                defaultMessage="Unit Price"
              />
            </th>
            <th className="text-right p-3 text-sm font-semibold">
              <FormattedMessage
                id="admin.payments.invoice.items.amount"
                defaultMessage="Amount"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-muted">
              <td className="p-3 text-sm">{item.description}</td>
              <td className="p-3 text-sm text-center">{item.quantity}</td>
              <td className="p-3 text-sm text-right">
                ${item.unitPrice.toFixed(2)}
              </td>
              <td className="p-3 text-sm text-right">
                ${item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
