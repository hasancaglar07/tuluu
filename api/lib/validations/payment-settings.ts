import { z } from "zod";

// **Payment Provider Validation Schema**
const PaymentProviderSchema = z.object({
  enabled: z.boolean().optional().default(false),
  publicKey: z.string().optional(),
  secretKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  merchantId: z.string().optional(),
  environment: z.enum(["sandbox", "production"]).optional().default("sandbox"),
  metadata: z.record(z.any()).optional().default({}),
});

// **In-App Currency Validation Schema**
const InAppCurrencySchema = z.object({
  enabled: z.boolean().optional().default(true),
  exchangeRate: z.number().min(0, "Exchange rate must be positive").default(1),
  dailyBonus: z
    .number()
    .min(0, "Daily bonus must be positive")
    .optional()
    .default(0),
  gemsCost: z.number().min(0, "Gems cost must be positive").optional(),
  refillTimeHours: z.number().min(0, "Refill time must be positive").optional(),
  maxAmount: z.number().min(0, "Max amount must be positive").optional(),
  minPurchase: z
    .number()
    .min(0, "Min purchase must be positive")
    .optional()
    .default(1),
  metadata: z.record(z.any()).optional().default({}),
});

// **Regional Setting Validation Schema**
const RegionalSettingSchema = z.object({
  name: z
    .string()
    .min(1, "Region name is required")
    .max(100, "Region name too long"),
  currency: z.string().length(3, "Currency must be 3 characters").toUpperCase(),
  priceMultiplier: z
    .number()
    .min(0, "Price multiplier must be positive")
    .default(1.0),
  taxRate: z
    .number()
    .min(0, "Tax rate must be positive")
    .max(100, "Tax rate cannot exceed 100%")
    .default(0),
  status: z.enum(["active", "pending", "inactive"]).default("active"),
  countryCode: z
    .string()
    .length(2, "Country code must be 2 characters")
    .toUpperCase()
    .optional(),
  timezone: z.string().optional(),
  paymentMethods: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().default({}),
});

// **General Settings Validation Schema**
const GeneralSettingsSchema = z.object({
  enablePayments: z.boolean().optional().default(true),
  testMode: z.boolean().optional().default(true),
  autoRetryFailedPayments: z.boolean().optional().default(true),
  sendPaymentReceipts: z.boolean().optional().default(true),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name too long"),
  companyAddress: z
    .string()
    .min(1, "Company address is required")
    .max(500, "Company address too long"),
  billingEmail: z.string().email("Invalid email address"),
  billingPhone: z
    .string()
    .min(1, "Billing phone is required")
    .max(50, "Phone number too long"),
  companyLogo: z.string().url("Invalid logo URL").optional(),
  companyWebsite: z.string().url("Invalid website URL").optional(),
  supportEmail: z.string().email("Invalid support email").optional(),
  termsOfServiceUrl: z.string().url("Invalid terms URL").optional(),
  privacyPolicyUrl: z.string().url("Invalid privacy policy URL").optional(),
  refundPolicy: z.string().max(2000, "Refund policy too long").optional(),
  metadata: z.record(z.any()).optional().default({}),
});

// **Currency Settings Validation Schema**
const CurrencySettingsSchema = z.object({
  defaultCurrency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .toUpperCase()
    .default("USD"),
  autoUpdateExchangeRates: z.boolean().optional().default(true),
  exchangeRateProvider: z
    .enum(["fixer", "openexchangerates", "currencylayer", "manual"])
    .optional()
    .default("fixer"),
  exchangeRateApiKey: z.string().optional(),
  supportedCurrencies: z
    .array(z.string().length(3).toUpperCase())
    .optional()
    .default(["USD", "EUR", "GBP"]),
  gems: InAppCurrencySchema,
  hearts: InAppCurrencySchema,
  metadata: z.record(z.any()).optional().default({}),
});

// **Regional Settings Validation Schema**
const RegionalSettingsSchema = z.object({
  regionalPricing: z.boolean().optional().default(true),
  taxCalculation: z.boolean().optional().default(true),
  autoDetectRegion: z.boolean().optional().default(true),
  defaultRegion: z
    .string()
    .min(1, "Default region is required")
    .default("United States"),
  regions: z
    .array(RegionalSettingSchema)
    .min(1, "At least one region is required"),
  metadata: z.record(z.any()).optional().default({}),
});

// **Security Settings Validation Schema**
const SecuritySettingsSchema = z.object({
  requireTwoFactorForChanges: z.boolean().optional().default(false),
  allowedIpAddresses: z.array(z.string().ip()).optional(),
  sessionTimeout: z
    .number()
    .min(300, "Session timeout must be at least 5 minutes")
    .default(3600),
  encryptSensitiveData: z.boolean().optional().default(true),
});

// **Notification Settings Validation Schema**
const NotificationSettingsSchema = z.object({
  emailOnFailedPayments: z.boolean().optional().default(true),
  emailOnRefunds: z.boolean().optional().default(true),
  emailOnChargebacks: z.boolean().optional().default(true),
  slackWebhookUrl: z.string().url("Invalid Slack webhook URL").optional(),
  discordWebhookUrl: z.string().url("Invalid Discord webhook URL").optional(),
});

// **Main Payment Settings Validation Schema**
export const PaymentSettingsCreateSchema = z.object({
  general: GeneralSettingsSchema,
  providers: z.object({
    stripe: PaymentProviderSchema,
    paypal: PaymentProviderSchema,
    googlePay: PaymentProviderSchema,
    applePay: PaymentProviderSchema.optional(),
    bankTransfer: PaymentProviderSchema.optional(),
    crypto: PaymentProviderSchema.optional(),
  }),
  currencies: CurrencySettingsSchema,
  regional: RegionalSettingsSchema,
  webhookEndpoints: z
    .object({
      stripe: z.string().url("Invalid Stripe webhook URL").optional(),
      paypal: z.string().url("Invalid PayPal webhook URL").optional(),
      general: z.string().url("Invalid general webhook URL").optional(),
    })
    .optional()
    .default({}),
  securitySettings: SecuritySettingsSchema.optional(),
  notificationSettings: NotificationSettingsSchema.optional(),
  isActive: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional().default({}),
});

// **Update Schema (all fields optional)**
export const PaymentSettingsUpdateSchema = z.object({
  general: GeneralSettingsSchema.partial().optional(),
  providers: z
    .object({
      stripe: PaymentProviderSchema.partial().optional(),
      paypal: PaymentProviderSchema.partial().optional(),
      googlePay: PaymentProviderSchema.partial().optional(),
      applePay: PaymentProviderSchema.partial().optional(),
      bankTransfer: PaymentProviderSchema.partial().optional(),
      crypto: PaymentProviderSchema.partial().optional(),
    })
    .optional(),
  currencies: CurrencySettingsSchema.partial().optional(),
  regional: RegionalSettingsSchema.partial().optional(),
  webhookEndpoints: z
    .object({
      stripe: z.string().url("Invalid Stripe webhook URL").optional(),
      paypal: z.string().url("Invalid PayPal webhook URL").optional(),
      general: z.string().url("Invalid general webhook URL").optional(),
    })
    .optional(),
  securitySettings: SecuritySettingsSchema.partial().optional(),
  notificationSettings: NotificationSettingsSchema.partial().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// **Query Schema for filtering**
export const PaymentSettingsQuerySchema = z.object({
  includeSecrets: z.string().optional().default("false"),
  version: z.string().optional(),
  isActive: z.string().optional(),
});

// **Regional Settings Management Schemas**
export const AddRegionSchema = z.object({
  name: z.string().min(1, "Region name is required").max(100),
  currency: z.string().length(3, "Currency must be 3 characters").toUpperCase(),
  priceMultiplier: z
    .number()
    .min(0, "Price multiplier must be positive")
    .default(1.0),
  taxRate: z
    .number()
    .min(0, "Tax rate must be positive")
    .max(100, "Tax rate cannot exceed 100%")
    .default(0),
  status: z.enum(["active", "pending", "inactive"]).default("active"),
  countryCode: z
    .string()
    .length(2, "Country code must be 2 characters")
    .toUpperCase()
    .optional(),
  timezone: z.string().optional(),
  paymentMethods: z.array(z.string()).optional().default([]),
});

export const UpdateRegionSchema = AddRegionSchema.partial();

export const DeleteRegionSchema = z.object({
  regionName: z.string().min(1, "Region name is required"),
});

// **Provider Configuration Schemas**
export const StripeConfigSchema = z.object({
  enabled: z.boolean(),
  publicKey: z.string().min(1, "Stripe public key is required").optional(),
  secretKey: z.string().min(1, "Stripe secret key is required").optional(),
  webhookSecret: z
    .string()
    .min(1, "Stripe webhook secret is required")
    .optional(),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
});

export const PayPalConfigSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string().min(1, "PayPal client ID is required").optional(),
  clientSecret: z
    .string()
    .min(1, "PayPal client secret is required")
    .optional(),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
});

export const GooglePayConfigSchema = z.object({
  enabled: z.boolean(),
  merchantId: z
    .string()
    .min(1, "Google Pay merchant ID is required")
    .optional(),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
});

// **Bulk Update Schema**
export const BulkUpdateSettingsSchema = z.object({
  sections: z.array(
    z.enum([
      "general",
      "providers",
      "currencies",
      "regional",
      "security",
      "notifications",
    ])
  ),
  data: PaymentSettingsUpdateSchema,
  validateOnly: z.boolean().optional().default(false),
});

// **Export all schemas**
export {
  PaymentProviderSchema,
  InAppCurrencySchema,
  RegionalSettingSchema,
  GeneralSettingsSchema,
  CurrencySettingsSchema,
  RegionalSettingsSchema,
  SecuritySettingsSchema,
  NotificationSettingsSchema,
};

// **Type exports for frontend**
export type PaymentSettingsCreateInput = z.infer<
  typeof PaymentSettingsCreateSchema
>;
export type PaymentSettingsUpdateInput = z.infer<
  typeof PaymentSettingsUpdateSchema
>;
export type PaymentSettingsQueryInput = z.infer<
  typeof PaymentSettingsQuerySchema
>;
export type AddRegionInput = z.infer<typeof AddRegionSchema>;
export type UpdateRegionInput = z.infer<typeof UpdateRegionSchema>;
export type StripeConfigInput = z.infer<typeof StripeConfigSchema>;
export type PayPalConfigInput = z.infer<typeof PayPalConfigSchema>;
export type GooglePayConfigInput = z.infer<typeof GooglePayConfigSchema>;
