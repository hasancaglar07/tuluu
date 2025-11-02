import { FormattedMessage } from "react-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";
import { CurrencySettings } from "@/types/payments";

interface CurrenciesSettingsTabProps {
  currenciesForm: CurrencySettings;
  setCurrenciesForm: (form: CurrencySettings) => void;
  loading: boolean;
  onSave: () => void;
}

/**
 * Currency Settings Tab Component
 *
 * Manages currency and exchange rate settings including:
 * - Default currency selection
 * - Exchange rate management
 * - In-app currency configuration (Gems, Hearts)
 *
 * @param props - Component props
 * @returns JSX.Element - The currencies settings form
 */
export function CurrenciesSettingsTab({
  currenciesForm,
  setCurrenciesForm,
  loading,
  onSave,
}: CurrenciesSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.payments.settings.currencies.title"
            defaultMessage="Currency Settings"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="admin.payments.settings.currencies.description"
            defaultMessage="Configure currencies and exchange rates for your application"
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.currencies.defaultCurrency"
                  defaultMessage="Default Currency"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.currencies.defaultCurrency.description"
                  defaultMessage="The primary currency used for transactions"
                />
              </p>
            </div>
            <select
              className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={currenciesForm.defaultCurrency}
              onChange={(e) =>
                setCurrenciesForm({
                  ...currenciesForm,
                  defaultCurrency: e.target.value,
                })
              }
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.currencies.autoUpdateRates"
                  defaultMessage="Auto-update Exchange Rates"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.currencies.autoUpdateRates.description"
                  defaultMessage="Automatically update exchange rates daily"
                />
              </p>
            </div>
            <Switch
              checked={currenciesForm.autoUpdateExchangeRates}
              onCheckedChange={(checked) =>
                setCurrenciesForm({
                  ...currenciesForm,
                  autoUpdateExchangeRates: checked,
                })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h6 className="font-medium">
            <FormattedMessage
              id="admin.payments.settings.currencies.inAppCurrencies"
              defaultMessage="In-App Currencies"
            />
          </h6>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.payments.settings.currencies.inAppCurrencies.description"
              defaultMessage="Configure virtual currencies used within your application"
            />
          </p>

          {/* Gems Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  G
                </div>
                <div>
                  <h6 className="font-medium">
                    <FormattedMessage
                      id="admin.payments.settings.currencies.gems.title"
                      defaultMessage="Gems"
                    />
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.payments.settings.currencies.gems.description"
                      defaultMessage="Primary in-app currency"
                    />
                  </p>
                </div>
              </div>
              <Switch
                checked={currenciesForm.gemsEnabled}
                onCheckedChange={(checked) =>
                  setCurrenciesForm({
                    ...currenciesForm,
                    gemsEnabled: checked,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gems-exchange-rate">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.gems.exchangeRate"
                    defaultMessage="Exchange Rate (USD to Gems)"
                  />
                </Label>
                <Input
                  id="gems-exchange-rate"
                  type="number"
                  value={String(currenciesForm.gemsExchangeRate)}
                  onChange={(e) =>
                    setCurrenciesForm({
                      ...currenciesForm,
                      gemsExchangeRate: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.gems.exchangeRate.example"
                    defaultMessage="$1.00 = 100 Gems"
                  />
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gems-daily-bonus">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.gems.dailyBonus"
                    defaultMessage="Daily Bonus"
                  />
                </Label>
                <Input
                  id="gems-daily-bonus"
                  type="number"
                  value={String(currenciesForm.gemsDailyBonus)}
                  onChange={(e) =>
                    setCurrenciesForm({
                      ...currenciesForm,
                      gemsDailyBonus: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.gems.dailyBonus.description"
                    defaultMessage="Gems awarded for daily streak"
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Hearts Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  H
                </div>
                <div>
                  <h6 className="font-medium">
                    <FormattedMessage
                      id="admin.payments.settings.currencies.hearts.title"
                      defaultMessage="Hearts"
                    />
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.payments.settings.currencies.hearts.description"
                      defaultMessage="Secondary in-app currency"
                    />
                  </p>
                </div>
              </div>
              <Switch
                checked={currenciesForm.heartsEnabled}
                onCheckedChange={(checked) =>
                  setCurrenciesForm({
                    ...currenciesForm,
                    heartsEnabled: checked,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hearts-gems-cost">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.hearts.gemsCost"
                    defaultMessage="Cost in Gems"
                  />
                </Label>
                <Input
                  id="hearts-gems-cost"
                  type="number"
                  value={String(currenciesForm.heartsGemsCost)}
                  onChange={(e) =>
                    setCurrenciesForm({
                      ...currenciesForm,
                      heartsGemsCost: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.hearts.gemsCost.example"
                    defaultMessage="10 Gems = 1 Heart"
                  />
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hearts-refill-time">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.hearts.refillTime"
                    defaultMessage="Refill Time (hours)"
                  />
                </Label>
                <Input
                  id="hearts-refill-time"
                  type="number"
                  value={String(currenciesForm.heartsRefillTime)}
                  onChange={(e) =>
                    setCurrenciesForm({
                      ...currenciesForm,
                      heartsRefillTime: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id="admin.payments.settings.currencies.hearts.refillTime.description"
                    defaultMessage="Time to regenerate 1 heart"
                  />
                </p>
              </div>
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
  );
}
