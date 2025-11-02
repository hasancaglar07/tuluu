import { FormattedMessage } from 'react-intl'

/**
 * Payment Settings Header Component
 * 
 * Displays the main title and description for the payment settings page
 * 
 * @returns JSX.Element - The header section with title and description
 */
export function PaymentSettingsHeader() {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <h1 className="text-3xl font-bold tracking-tight">
        <FormattedMessage
          id="admin.payments.settings.title"
          defaultMessage="Payment Settings"
        />
      </h1>
      <p className="text-muted-foreground">
        <FormattedMessage
          id="admin.payments.settings.description"
          defaultMessage="Configure payment providers, currencies, and other payment-related settings"
        />
      </p>
    </div>
  )
}
