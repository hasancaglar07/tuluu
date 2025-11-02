import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function organizeProviders(
  data: Record<string, unknown>
): Record<string, Record<string, unknown>> {
  const providerKeys = ["stripe", "paypal", "googlePay"];
  const result: Record<string, Record<string, unknown>> = {};

  // Initialize provider objects from existing nested ones
  for (const provider of providerKeys) {
    const nested = data[provider];
    result[provider] =
      typeof nested === "object" && nested !== null && !Array.isArray(nested)
        ? { ...nested }
        : {};
  }

  // Flatten and sort remaining top-level keys into provider objects
  for (const [key, value] of Object.entries(data)) {
    for (const provider of providerKeys) {
      if (
        key !== provider &&
        key.toLowerCase().startsWith(provider.toLowerCase())
      ) {
        const subKey =
          key.charAt(provider.length).toLowerCase() +
          key.slice(provider.length + 1);

        result[provider][subKey] = value;
        break;
      }
    }
  }

  return result;
}

export function mapToProviderSettings(
  apiData: ProviderApiResponse
): ProviderSettings {
  return {
    stripeEnabled: apiData.stripe?.enabled ?? false,
    stripePublicKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paypalEnabled: apiData.paypal?.enabled ?? false,
    paypalClientId: "",
    paypalSecret: "",
    googlePayEnabled: apiData.googlePay?.enabled ?? false,
    googleMerchantId: "",
  };
}
export type ProviderApiResponse = {
  stripe?: { enabled?: boolean };
  paypal?: { enabled?: boolean };
  googlePay?: { enabled?: boolean };
};

export type ProviderSettings = {
  stripeEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecret: string;
  googlePayEnabled: boolean;
  googleMerchantId: string;
};
