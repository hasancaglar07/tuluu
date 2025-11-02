'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { FormattedMessage } from 'react-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, CreditCard, DollarSign, Globe } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { mapToProviderSettings, organizeProviders, ProviderApiResponse } from '@/lib/utils'
import Loading from '@/components/custom/loading'
import { PaymentSettings, GeneralSettings, ProviderSettings, CurrencySettings, RegionalSettings } from '@/types/payments'
import { PaymentSettingsHeader } from './payment-settings-header'
import { GeneralSettingsTab } from './general-settings-tab'
import { ProvidersSettingsTab } from './providers-settings-tab'
import { CurrenciesSettingsTab } from './currencies-settings-tab'
import { RegionalSettingsTab } from './regional-settings-tab'

/**
 * Main Payment Settings Management Page Component
 * 
 * This component manages the entire payment settings interface including:
 * - General payment settings
 * - Payment provider configurations
 * - Currency and exchange rate settings
 * - Regional pricing and tax settings
 * 
 * @returns JSX.Element - The complete payment settings management interface
 */
export function PaymentSettingsManagementPage() {
  // State management for settings data
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  // Form states for each tab
  const [generalForm, setGeneralForm] = useState<GeneralSettings>({
    enablePayments: false,
    testMode: false,
    autoRetryFailedPayments: false,
    sendPaymentReceipts: false,
    companyName: '',
    companyAddress: '',
    billingEmail: '',
    billingPhone: '',
  })

  const [providersForm, setProvidersForm] = useState<ProviderSettings>({
    stripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalSecret: '',
    googlePayEnabled: false,
    googleMerchantId: '',
  })

  const [currenciesForm, setCurrenciesForm] = useState<CurrencySettings>({
    defaultCurrency: 'USD',
    autoUpdateExchangeRates: false,
    gemsEnabled: false,
    gemsExchangeRate: 0,
    gemsDailyBonus: 0,
    heartsEnabled: false,
    heartsGemsCost: 0,
    heartsRefillTime: 0,
  })

  /**
   * Fetch payment settings from the API
   * Loads all configuration data when component mounts
   */
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const token = await getToken()
        const res = await apiClient.get('/api/admin/payments/settings', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            includeSecrets: false,
            version: 1,
            isActive: true,
          },
        })

        setSettings(res.data.data)
      } catch (err) {
        const error = err as AxiosError<{
          message?: string
          errors?: Record<string, string[]>
        }>

        const apiErrors = error.response?.data?.errors
        const message = error.response?.data?.message

        if (apiErrors && typeof apiErrors === 'object') {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => toast.error(`${field}: ${msg}`))
            }
          })
        } else {
          toast.error(message || 'An unknown error occurred.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [getToken])

  /**
   * Update form states when settings are loaded from API
   */
  useEffect(() => {
    if (settings) {
      setGeneralForm(settings.general)
      setProvidersForm(mapToProviderSettings(settings.providers as ProviderApiResponse))
      setCurrenciesForm(settings.currencies)
    }
  }, [settings])

  /**
   * Generic save handler for all settings tabs
   * 
   * @param tab - The settings tab being saved
   * @param data - The form data to save
   */
  const saveSettings = useCallback(
    async (
      tab: string,
      data: GeneralSettings | ProviderSettings | CurrencySettings | RegionalSettings
    ) => {
      setLoading(true)

      try {
        const token = await getToken()
        const formattedData = tab === 'providers' ? organizeProviders(data) : data

        await apiClient.patch(
          '/api/admin/payments/settings',
          {
            tab,
            data: { [tab]: formattedData },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        toast.success('Payment settings saved successfully.')
      } catch (err) {
        const error = err as AxiosError<{
          message?: string
          errors?: Record<string, string[]>
        }>

        const apiErrors = error.response?.data?.errors
        const message = error.response?.data?.message

        if (apiErrors && typeof apiErrors === 'object') {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => toast.error(`${field}: ${msg}`))
            }
          })
        } else {
          toast.error(message || 'An unknown error occurred.')
        }
      } finally {
        setLoading(false)
      }
    },
    [getToken]
  )

  // Show loading state while fetching settings
  if (!settings) {
    return <Loading />
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <PaymentSettingsHeader />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.payments.settings.tabs.general"
              defaultMessage="General"
            />
          </TabsTrigger>
          <TabsTrigger value="providers">
            <CreditCard className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.payments.settings.tabs.providers"
              defaultMessage="Payment Providers"
            />
          </TabsTrigger>
          <TabsTrigger value="currencies">
            <DollarSign className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.payments.settings.tabs.currencies"
              defaultMessage="Currencies"
            />
          </TabsTrigger>
          <TabsTrigger value="regional">
            <Globe className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="admin.payments.settings.tabs.regional"
              defaultMessage="Regional Settings"
            />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab
            generalForm={generalForm}
            setGeneralForm={setGeneralForm}
            loading={loading}
            onSave={() => saveSettings('general', generalForm)}
          />
        </TabsContent>

        <TabsContent value="providers">
          <ProvidersSettingsTab
            providersForm={providersForm}
            setProvidersForm={setProvidersForm}
            loading={loading}
            onSave={() => saveSettings('providers', providersForm)}
          />
        </TabsContent>

        <TabsContent value="currencies">
          <CurrenciesSettingsTab
            currenciesForm={currenciesForm}
            setCurrenciesForm={setCurrenciesForm}
            loading={loading}
            onSave={() => saveSettings('currencies', currenciesForm)}
          />
        </TabsContent>

        <TabsContent value="regional">
          <RegionalSettingsTab
            settings={settings}
            setSettings={setSettings}
            loading={loading}
            onSave={() => saveSettings('regional', settings.regional)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
