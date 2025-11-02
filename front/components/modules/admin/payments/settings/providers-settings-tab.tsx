import { FormattedMessage } from 'react-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { ProviderSettings } from '@/types/payments'

interface ProvidersSettingsTabProps {
  providersForm: ProviderSettings
  setProvidersForm: (form: ProviderSettings) => void
  loading: boolean
  onSave: () => void
}

/**
 * Payment Providers Settings Tab Component
 * 
 * Manages payment provider configurations including:
 * - Stripe integration settings
 * - PayPal configuration
 * - Google Pay setup
 * 
 * @param props - Component props
 * @returns JSX.Element - The providers settings form
 */
export function ProvidersSettingsTab({
  providersForm,
  setProvidersForm,
  loading,
  onSave,
}: ProvidersSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.payments.settings.providers.title"
            defaultMessage="Payment Providers"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="admin.payments.settings.providers.description"
            defaultMessage="Connect and configure payment providers for your application"
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Stripe Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#6772E5] rounded-md flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <h6 className="font-medium">
                    <FormattedMessage
                      id="admin.payments.settings.providers.stripe.title"
                      defaultMessage="Stripe"
                    />
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.payments.settings.providers.stripe.description"
                      defaultMessage="Process credit card payments"
                    />
                  </p>
                </div>
              </div>
              <Switch
                checked={providersForm.stripeEnabled}
                onCheckedChange={(checked) =>
                  setProvidersForm({
                    ...providersForm,
                    stripeEnabled: checked,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public-key">
                  <FormattedMessage
                    id="admin.payments.settings.providers.stripe.publicKey"
                    defaultMessage="Public Key"
                  />
                </Label>
                <Input
                  id="stripe-public-key"
                  value={providersForm.stripePublicKey}
                  type="password"
                  onChange={(e) =>
                    setProvidersForm({
                      ...providersForm,
                      stripePublicKey: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-secret-key">
                  <FormattedMessage
                    id="admin.payments.settings.providers.stripe.secretKey"
                    defaultMessage="Secret Key"
                  />
                </Label>
                <Input
                  id="stripe-secret-key"
                  value={providersForm.stripeSecretKey}
                  type="password"
                  onChange={(e) =>
                    setProvidersForm({
                      ...providersForm,
                      stripeSecretKey: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-webhook-secret">
                  <FormattedMessage
                    id="admin.payments.settings.providers.stripe.webhookSecret"
                    defaultMessage="Webhook Secret"
                  />
                </Label>
                <Input
                  id="stripe-webhook-secret"
                  value={providersForm.stripeWebhookSecret}
                  type="password"
                  onChange={(e) =>
                    setProvidersForm({
                      ...providersForm,
                      stripeWebhookSecret: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* PayPal Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#003087] rounded-md flex items-center justify-center text-white font-bold">
                  P
                </div>
                <div>
                  <h6 className="font-medium">
                    <FormattedMessage
                      id="admin.payments.settings.providers.paypal.title"
                      defaultMessage="PayPal"
                    />
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.payments.settings.providers.paypal.description"
                      defaultMessage="Process PayPal payments"
                    />
                  </p>
                </div>
              </div>
              <Switch
                checked={providersForm.paypalEnabled}
                onCheckedChange={(checked) =>
                  setProvidersForm({
                    ...providersForm,
                    paypalEnabled: checked,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-client-id">
                  <FormattedMessage
                    id="admin.payments.settings.providers.paypal.clientId"
                    defaultMessage="Client ID"
                  />
                </Label>
                <Input
                  id="paypal-client-id"
                  placeholder="Enter PayPal client ID"
                  value={providersForm.paypalClientId}
                  onChange={(e) =>
                    setProvidersForm({
                      ...providersForm,
                      paypalClientId: e.target.value,
                    })
                  }
                  disabled={!providersForm.paypalEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypal-secret">
                  <FormattedMessage
                    id="admin.payments.settings.providers.paypal.clientSecret"
                    defaultMessage="Client Secret"
                  />
                </Label>
                <Input
                  id="paypal-secret"
                  placeholder="Enter PayPal client secret"
                  value={providersForm.paypalSecret}
                  onChange={(e) =>
                    setProvidersForm({
                      ...providersForm,
                      paypalSecret: e.target.value,
                    })
                  }
                  disabled={!providersForm.paypalEnabled}
                />
              </div>
            </div>
          </div>

          {/* Google Pay Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#5F6368] rounded-md flex items-center justify-center text-white font-bold">
                  G
                </div>
                <div>
                  <h6 className="font-medium">
                    <FormattedMessage
                      id="admin.payments.settings.providers.googlepay.title"
                      defaultMessage="Google Pay"
                    />
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.payments.settings.providers.googlepay.description"
                      defaultMessage="Process Google Pay payments"
                    />
                  </p>
                </div>
              </div>
              <Switch
                checked={providersForm.googlePayEnabled}
                onCheckedChange={(checked) =>
                  setProvidersForm({
                    ...providersForm,
                    googlePayEnabled: checked,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="google-merchant-id">
                  <FormattedMessage
                    id="admin.payments.settings.providers.googlepay.merchantId"
                    defaultMessage="Merchant ID"
                  />
                </Label>
                <Input
                  id="google-merchant-id"
                  placeholder="Enter Google merchant ID"
                  value={providersForm.googleMerchantId}
                  onChange={(e) =>
                    setProvidersForm({
                      ...providersForm,
                      googleMerchantId: e.target.value,
                    })
                  }
                  disabled={!providersForm.googlePayEnabled}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={loading}>
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
