import { FormattedMessage } from 'react-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save } from 'lucide-react'
import { GeneralSettings } from '@/types/payments'

interface GeneralSettingsTabProps {
  generalForm: GeneralSettings
  setGeneralForm: (form: GeneralSettings) => void
  loading: boolean
  onSave: () => void
}

/**
 * General Settings Tab Component
 * 
 * Manages basic payment settings including:
 * - Payment enablement toggles
 * - Company information for invoices
 * - Basic payment behavior settings
 * 
 * @param props - Component props
 * @returns JSX.Element - The general settings form
 */
export function GeneralSettingsTab({
  generalForm,
  setGeneralForm,
  loading,
  onSave,
}: GeneralSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.payments.settings.general.title"
            defaultMessage="General Payment Settings"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="admin.payments.settings.general.description"
            defaultMessage="Configure basic payment settings for your application"
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.general.enablePayments"
                  defaultMessage="Enable Payments"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.general.enablePayments.description"
                  defaultMessage="Allow users to make payments in your application"
                />
              </p>
            </div>
            <Switch
              checked={generalForm.enablePayments}
              onCheckedChange={(checked) =>
                setGeneralForm({
                  ...generalForm,
                  enablePayments: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.general.testMode"
                  defaultMessage="Test Mode"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.general.testMode.description"
                  defaultMessage="Process payments in test mode (no real charges)"
                />
              </p>
            </div>
            <Switch
              checked={generalForm.testMode}
              onCheckedChange={(checked) =>
                setGeneralForm({ ...generalForm, testMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.general.autoRetry"
                  defaultMessage="Auto-retry Failed Payments"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.general.autoRetry.description"
                  defaultMessage="Automatically retry failed payments after 24 hours"
                />
              </p>
            </div>
            <Switch
              checked={generalForm.autoRetryFailedPayments}
              onCheckedChange={(checked) =>
                setGeneralForm({
                  ...generalForm,
                  autoRetryFailedPayments: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.general.sendReceipts"
                  defaultMessage="Send Payment Receipts"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.general.sendReceipts.description"
                  defaultMessage="Automatically send email receipts for successful payments"
                />
              </p>
            </div>
            <Switch
              checked={generalForm.sendPaymentReceipts}
              onCheckedChange={(checked) =>
                setGeneralForm({
                  ...generalForm,
                  sendPaymentReceipts: checked,
                })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h6 className="font-medium">
            <FormattedMessage
              id="admin.payments.settings.general.invoiceSettings"
              defaultMessage="Invoice Settings"
            />
          </h6>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">
                <FormattedMessage
                  id="admin.payments.settings.general.companyName"
                  defaultMessage="Company Name"
                />
              </Label>
              <Input
                id="company-name"
                value={generalForm.companyName}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    companyName: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-address">
                <FormattedMessage
                  id="admin.payments.settings.general.companyAddress"
                  defaultMessage="Company Address"
                />
              </Label>
              <Input
                id="company-address"
                value={generalForm.companyAddress}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    companyAddress: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-email">
                <FormattedMessage
                  id="admin.payments.settings.general.billingEmail"
                  defaultMessage="Billing Email"
                />
              </Label>
              <Input
                id="company-email"
                value={generalForm.billingEmail}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    billingEmail: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-phone">
                <FormattedMessage
                  id="admin.payments.settings.general.billingPhone"
                  defaultMessage="Billing Phone"
                />
              </Label>
              <Input
                id="company-phone"
                value={generalForm.billingPhone}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    billingPhone: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={loading} onClick={onSave}>
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            <Save className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.payments.settings.saveChanges"
              defaultMessage="Save Changes"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
