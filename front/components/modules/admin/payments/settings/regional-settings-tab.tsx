import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { PaymentSettings, Region } from "@/types/payments";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";

interface RegionalSettingsTabProps {
  settings: PaymentSettings;
  setSettings: (
    settings:
      | PaymentSettings
      | ((prev: PaymentSettings | null) => PaymentSettings | null)
  ) => void;
  loading: boolean;
  onSave: () => void;
}

const regionSchema = z.object({
  name: z.string().min(2, {
    message: "Region Name must be at least 2 characters.",
  }),
  currency: z.string().min(3, {
    message: "Currency must be a valid currency code.",
  }),
  priceMultiplier: z.number(),
  taxRate: z.number(),
  status: z.enum(["active", "pending", "inactive"]),
});

/**
 * Regional Settings Tab Component
 *
 * Manages region-specific payment settings including:
 * - Regional pricing configuration
 * - Tax calculation settings
 * - Region management (add/edit/delete)
 *
 * @param props - Component props
 * @returns JSX.Element - The regional settings form
 */
export function RegionalSettingsTab({
  settings,
  setSettings,
  loading,
  onSave,
}: RegionalSettingsTabProps) {
  const [isAddRegionDialogOpen, setIsAddRegionDialogOpen] = useState(false);
  const { getToken } = useAuth();

  // Form for adding a new region
  const addRegionForm = useForm<z.infer<typeof regionSchema>>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      priceMultiplier: 1.0,
      taxRate: 0,
      status: "active",
    },
  });

  const {
    register: registerRegion,
    handleSubmit: handleRegionSubmit,
    formState: { errors: regionErrors },
    reset: resetRegionForm,
  } = addRegionForm;

  /**
   * Handle adding a new region
   *
   * @param data - The region form data
   */
  const handleAddRegion = async (data: z.infer<typeof regionSchema>) => {
    try {
      const token = await getToken();

      const response = await apiClient.post(
        "/api/admin/payments/settings/regions",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newRegion = response.data.data.region;

      setSettings((prevSettings) => {
        if (!prevSettings) return prevSettings;

        return {
          ...prevSettings,
          regional: {
            ...prevSettings.regional,
            regions: [...prevSettings.regional.regions, newRegion],
          },
        };
      });

      toast.success("Region added successfully.");
      setIsAddRegionDialogOpen(false);
      resetRegionForm();
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else {
        toast.error(message || "An unknown error occurred.");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.payments.settings.regional.title"
            defaultMessage="Regional Payment Settings"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="admin.payments.settings.regional.description"
            defaultMessage="Configure region-specific payment settings and pricing"
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.regional.regionalPricing"
                  defaultMessage="Regional Pricing"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.regional.regionalPricing.description"
                  defaultMessage="Enable region-specific pricing for subscriptions and products"
                />
              </p>
            </div>
            <Switch
              checked={settings.regional.regionalPricingEnabled}
              onCheckedChange={(checked) => {
                setSettings((prevSettings) => {
                  if (!prevSettings) return prevSettings;

                  return {
                    ...prevSettings,
                    regional: {
                      ...prevSettings.regional,
                      regionalPricingEnabled: checked,
                    },
                  };
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium">
                <FormattedMessage
                  id="admin.payments.settings.regional.taxCalculation"
                  defaultMessage="Tax Calculation"
                />
              </h6>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="admin.payments.settings.regional.taxCalculation.description"
                  defaultMessage="Automatically calculate and apply taxes based on user location"
                />
              </p>
            </div>
            <Switch
              checked={settings.regional.taxCalculationEnabled}
              onCheckedChange={(checked) => {
                setSettings((prevSettings) => {
                  if (!prevSettings) return prevSettings;

                  return {
                    ...prevSettings,
                    regional: {
                      ...prevSettings.regional,
                      taxCalculationEnabled: checked,
                    },
                  };
                });
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h6 className="font-medium">
            <FormattedMessage
              id="admin.payments.settings.regional.priceAdjustments"
              defaultMessage="Regional Price Adjustments"
            />
          </h6>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="admin.payments.settings.regional.priceAdjustments.description"
              defaultMessage="Set price multipliers for different regions"
            />
          </p>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 text-sm font-semibold">
                    <FormattedMessage
                      id="admin.payments.settings.regional.table.region"
                      defaultMessage="Region"
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <FormattedMessage
                      id="admin.payments.settings.regional.table.currency"
                      defaultMessage="Currency"
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <FormattedMessage
                      id="admin.payments.settings.regional.table.priceMultiplier"
                      defaultMessage="Price Multiplier"
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <FormattedMessage
                      id="admin.payments.settings.regional.table.taxRate"
                      defaultMessage="Tax Rate"
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <FormattedMessage
                      id="admin.payments.settings.regional.table.status"
                      defaultMessage="Status"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {settings.regional.regions.map((region) => (
                  <tr key={region.name} className="border-b border-muted">
                    <td className="p-3 text-sm">{region.name}</td>
                    <td className="p-3 text-sm">{region.currency}</td>
                    <td className="p-3 text-sm">{region.priceMultiplier}x</td>
                    <td className="p-3 text-sm">{region.taxRate}%</td>
                    <td className="p-3 text-sm">
                      <Badge
                        variant="outline"
                        className={
                          region.status === "active"
                            ? "bg-green-100 text-green-800"
                            : region.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {region.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Dialog
              open={isAddRegionDialogOpen}
              onOpenChange={setIsAddRegionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FormattedMessage
                    id="admin.payments.settings.regional.addRegion"
                    defaultMessage="Add Region"
                  />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    <FormattedMessage
                      id="admin.payments.settings.regional.addRegion.title"
                      defaultMessage="Add New Region"
                    />
                  </DialogTitle>
                  <DialogDescription>
                    <FormattedMessage
                      id="admin.payments.settings.regional.addRegion.description"
                      defaultMessage="Configure pricing and tax settings for a new region."
                    />
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleRegionSubmit(handleAddRegion)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        <FormattedMessage
                          id="admin.payments.settings.regional.form.regionName"
                          defaultMessage="Region Name"
                        />
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Australia"
                        className="col-span-3"
                        {...registerRegion("name")}
                      />
                      {regionErrors.name && (
                        <p className="col-span-4 text-red-500 text-sm">
                          {regionErrors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="region-currency" className="text-right">
                        <FormattedMessage
                          id="admin.payments.settings.regional.form.currency"
                          defaultMessage="Currency"
                        />
                      </Label>
                      <select
                        id="region-currency"
                        className="flex h-10 col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...registerRegion("currency")}
                      >
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="USD">USD - US Dollar</option>
                      </select>
                      {regionErrors.currency && (
                        <p className="col-span-4 text-red-500 text-sm">
                          {regionErrors.currency.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price-multiplier" className="text-right">
                        <FormattedMessage
                          id="admin.payments.settings.regional.form.priceMultiplier"
                          defaultMessage="Price Multiplier"
                        />
                      </Label>
                      <Input
                        id="price-multiplier"
                        type="number"
                        step="0.1"
                        defaultValue="1.0"
                        className="col-span-3"
                        {...registerRegion("priceMultiplier", {
                          valueAsNumber: true,
                        })}
                      />
                      {regionErrors.priceMultiplier && (
                        <p className="col-span-4 text-red-500 text-sm">
                          {regionErrors.priceMultiplier.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tax-rate" className="text-right">
                        <FormattedMessage
                          id="admin.payments.settings.regional.form.taxRate"
                          defaultMessage="Tax Rate (%)"
                        />
                      </Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.1"
                        defaultValue="0"
                        className="col-span-3"
                        {...registerRegion("taxRate", {
                          valueAsNumber: true,
                        })}
                      />
                      {regionErrors.taxRate && (
                        <p className="col-span-4 text-red-500 text-sm">
                          {regionErrors.taxRate.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="region-status" className="text-right">
                        <FormattedMessage
                          id="admin.payments.settings.regional.form.status"
                          defaultMessage="Status"
                        />
                      </Label>
                      <select
                        id="region-status"
                        className="flex h-10 col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...registerRegion("status")}
                      >
                        <option value="active">
                          <FormattedMessage
                            id="admin.payments.settings.regional.status.active"
                            defaultMessage="Active"
                          />
                        </option>
                        <option value="pending">
                          <FormattedMessage
                            id="admin.payments.settings.regional.status.pending"
                            defaultMessage="Pending"
                          />
                        </option>
                        <option value="inactive">
                          <FormattedMessage
                            id="admin.payments.settings.regional.status.inactive"
                            defaultMessage="Inactive"
                          />
                        </option>
                      </select>
                      {regionErrors.status && (
                        <p className="col-span-4 text-red-500 text-sm">
                          {regionErrors.status.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading && (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      )}
                      <FormattedMessage
                        id="admin.payments.settings.regional.addRegion.submit"
                        defaultMessage="Add Region"
                      />
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
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
