import { HydratedDocument, Schema, Types, type Model } from "mongoose";
import { InferSchemaType } from "mongoose";
import { model } from "mongoose";
import { models } from "mongoose";

// **Payment Provider Schema**
const PaymentProviderSchema = new Schema({
  enabled: { type: Boolean, default: false },
  publicKey: { type: String, select: false }, // Hidden by default for security
  secretKey: { type: String, select: false }, // Hidden by default for security
  webhookSecret: { type: String, select: false }, // Hidden by default for security
  clientId: { type: String, select: false },
  clientSecret: { type: String, select: false },
  merchantId: { type: String },
  environment: {
    type: String,
    enum: ["sandbox", "production"],
    default: "sandbox",
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// **In-App Currency Schema**
const InAppCurrencySchema = new Schema({
  enabled: { type: Boolean, default: true },
  exchangeRate: { type: Number, required: true, min: 0 },
  dailyBonus: { type: Number, min: 0, default: 0 },
  gemsCost: { type: Number, min: 0 },
  refillTimeHours: { type: Number, min: 0 },
  maxAmount: { type: Number, min: 0 },
  minPurchase: { type: Number, min: 0, default: 1 },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// **Regional Setting Schema**
const RegionalSettingSchema = new Schema({
  name: { type: String, required: true, trim: true },
  currency: { type: String, required: true, length: 3, uppercase: true },
  priceMultiplier: { type: Number, required: true, min: 0, default: 1.0 },
  taxRate: { type: Number, required: true, min: 0, max: 100, default: 0 },
  status: {
    type: String,
    enum: ["active", "pending", "inactive"],
    default: "active",
  },
  countryCode: { type: String, length: 2, uppercase: true },
  timezone: { type: String },
  paymentMethods: [{ type: String }],
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// **General Settings Schema**
const GeneralSettingsSchema = new Schema({
  enablePayments: { type: Boolean, default: true },
  testMode: { type: Boolean, default: true },
  autoRetryFailedPayments: { type: Boolean, default: true },
  sendPaymentReceipts: { type: Boolean, default: true },
  companyName: { type: String, required: true, trim: true },
  companyAddress: { type: String, required: true, trim: true },
  billingEmail: { type: String, required: true, lowercase: true, trim: true },
  billingPhone: { type: String, required: true, trim: true },
  companyLogo: { type: String },
  companyWebsite: { type: String },
  supportEmail: { type: String, lowercase: true, trim: true },
  termsOfServiceUrl: { type: String },
  privacyPolicyUrl: { type: String },
  refundPolicy: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// **Currency Settings Schema**
const CurrencySettingsSchema = new Schema({
  defaultCurrency: {
    type: String,
    required: true,
    length: 3,
    uppercase: true,
    default: "USD",
  },
  autoUpdateExchangeRates: { type: Boolean, default: true },
  exchangeRateProvider: {
    type: String,
    enum: ["fixer", "openexchangerates", "currencylayer", "manual"],
    default: "fixer",
  },
  exchangeRateApiKey: { type: String, select: false },
  supportedCurrencies: [{ type: String, length: 3, uppercase: true }],
  gems: { type: InAppCurrencySchema, required: true },
  hearts: { type: InAppCurrencySchema, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// **Regional Settings Schema**
const RegionalSettingsSchema = new Schema({
  regionalPricing: { type: Boolean, default: true },
  taxCalculation: { type: Boolean, default: true },
  autoDetectRegion: { type: Boolean, default: true },
  defaultRegion: { type: String, default: "United States" },
  regions: [RegionalSettingSchema],
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// **Main Payment Settings Schema**
const PaymentSettingsSchema = new Schema(
  {
    general: { type: GeneralSettingsSchema, required: true },
    providers: {
      stripe: { type: PaymentProviderSchema, required: true },
      paypal: { type: PaymentProviderSchema, required: true },
      googlePay: { type: PaymentProviderSchema },
      applePay: { type: PaymentProviderSchema },
      bankTransfer: { type: PaymentProviderSchema },
      crypto: { type: PaymentProviderSchema },
    },
    currencies: { type: CurrencySettingsSchema, required: true },
    regional: { type: RegionalSettingsSchema, required: true },
    webhookEndpoints: {
      stripe: { type: String },
      paypal: { type: String },
      general: { type: String },
    },
    securitySettings: {
      requireTwoFactorForChanges: { type: Boolean, default: false },
      allowedIpAddresses: [{ type: String }],
      sessionTimeout: { type: Number, default: 3600 }, // 1 hour in seconds
      encryptSensitiveData: { type: Boolean, default: true },
    },
    notificationSettings: {
      emailOnFailedPayments: { type: Boolean, default: true },
      emailOnRefunds: { type: Boolean, default: true },
      emailOnChargebacks: { type: Boolean, default: true },
      slackWebhookUrl: { type: String },
      discordWebhookUrl: { type: String },
    },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "payment_settings",
  }
);

// **Indexes for Performance**
PaymentSettingsSchema.index({ isActive: 1 });
PaymentSettingsSchema.index({ "general.companyName": 1 });
PaymentSettingsSchema.index({ "currencies.defaultCurrency": 1 });
PaymentSettingsSchema.index({ "regional.regions.status": 1 });
PaymentSettingsSchema.index({ createdAt: -1 });
PaymentSettingsSchema.index({ updatedAt: -1 });

// **Virtual Fields**
PaymentSettingsSchema.virtual("activeRegions").get(function () {
  return this.regional.regions.filter(
    (region: { status: string }) => region.status === "active"
  );
});

PaymentSettingsSchema.virtual("enabledProviders").get(function () {
  if (!this.providers) return [];

  const providers = [];

  if (this.providers.stripe?.enabled) providers.push("stripe");
  if (this.providers.paypal?.enabled) providers.push("paypal");
  if (this.providers.googlePay?.enabled) providers.push("googlePay");
  if (this.providers.applePay?.enabled) providers.push("applePay");
  if (this.providers.bankTransfer?.enabled) providers.push("bankTransfer");
  if (this.providers.crypto?.enabled) providers.push("crypto");

  return providers;
});

// **Pre-save Middleware**
PaymentSettingsSchema.pre("save", function (next) {
  // Increment version on updates
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }

  // Validate currency codes
  const currencyRegex = /^[A-Z]{3}$/;
  if (!currencyRegex.test(this.currencies?.defaultCurrency || "")) {
    return next(
      new Error("Default currency must be a valid 3-letter currency code")
    );
  }

  // Validate email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.general?.billingEmail || "")) {
    return next(new Error("Billing email must be a valid email address"));
  }

  // Ensure at least one payment provider is enabled
  // const providers = this.providers || {};
  // const hasEnabledProvider = Object.values(providers)
  //   .filter(
  //     (p): p is { enabled: boolean } => p !== null && typeof p === "object"
  //   )
  //   .some((provider) => provider.enabled);

  // if (this.general?.enablePayments && !hasEnabledProvider) {
  //   return next(
  //     new Error(
  //       "At least one payment provider must be enabled when payments are enabled"
  //     )
  //   );
  // }

  next();
});

// **Static Methods**
PaymentSettingsSchema.statics.getActiveSettings =
  function (): Promise<PaymentSettingsWithVirtuals> {
    return this.findOne({ isActive: true }).populate(
      "lastModifiedBy",
      "username email"
    );
  };

PaymentSettingsSchema.statics.createDefaultSettings = function () {
  const defaultSettings = {
    general: {
      enablePayments: true,
      testMode: true,
      autoRetryFailedPayments: true,
      sendPaymentReceipts: true,
      companyName: "TULU ",
      companyAddress: "456 Business Ave, Suite 100, San Francisco, CA 94107",
      billingEmail: "billing@duolingoclone.com",
      billingPhone: "+1 (555) 123-4567",
    },
    providers: {
      stripe: { enabled: false, environment: "sandbox" },
      paypal: { enabled: false, environment: "sandbox" },
      googlePay: { enabled: false, environment: "sandbox" },
    },
    currencies: {
      defaultCurrency: "USD",
      autoUpdateExchangeRates: true,
      exchangeRateProvider: "fixer",
      supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "CAD"],
      gems: {
        enabled: true,
        exchangeRate: 100,
        dailyBonus: 5,
        minPurchase: 1,
      },
      hearts: {
        enabled: true,
        exchangeRate: 1,
        gemsCost: 10,
        refillTimeHours: 5,
        minPurchase: 1,
      },
    },
    regional: {
      regionalPricing: true,
      taxCalculation: true,
      autoDetectRegion: true,
      defaultRegion: "United States",
      regions: [
        {
          name: "United States",
          currency: "USD",
          priceMultiplier: 1.0,
          taxRate: 0,
          status: "active",
          countryCode: "US",
        },
        {
          name: "European Union",
          currency: "EUR",
          priceMultiplier: 1.1,
          taxRate: 20,
          status: "active",
          countryCode: "EU",
        },
      ],
    },
    webhookEndpoints: {},
    securitySettings: {
      requireTwoFactorForChanges: false,
      sessionTimeout: 3600,
      encryptSensitiveData: true,
    },
    notificationSettings: {
      emailOnFailedPayments: true,
      emailOnRefunds: true,
      emailOnChargebacks: true,
    },
    isActive: true,
    version: 1,
  };

  return this.create(defaultSettings);
};

// **Instance Methods**
PaymentSettingsSchema.methods.toSafeObject = function () {
  const obj = this.toObject();

  // Remove sensitive fields
  if (obj.providers) {
    Object.keys(obj.providers).forEach((provider) => {
      if (obj.providers[provider]) {
        delete obj.providers[provider].secretKey;
        delete obj.providers[provider].webhookSecret;
        delete obj.providers[provider].clientSecret;
      }
    });
  }

  if (obj.currencies?.exchangeRateApiKey) {
    delete obj.currencies.exchangeRateApiKey;
  }

  return obj;
};

// **Model Creation**
// Types
export type PaymentSettingsType = InferSchemaType<typeof PaymentSettingsSchema>;
// export type PaymentSettingsDocument = HydratedDocument<PaymentSettingsType>;
// Manually extend with virtuals
export type PaymentSettingsWithVirtuals = PaymentSettingsType & {
  enabledProviders: string[];
};

// Include populated fields manually
export type PaymentSettingsPopulated = {
  lastModifiedBy?: {
    _id: Types.ObjectId;
    username: string;
    email: string;
  };
};

// Full hydrated document type
export type PaymentSettingsDocument = HydratedDocument<
  PaymentSettingsType & PaymentSettingsWithVirtuals & PaymentSettingsPopulated
>;

export interface PaymentSettingsModel extends Model<PaymentSettingsType> {
  getActiveSettings(): Promise<PaymentSettingsDocument>;
  createDefaultSettings(): Promise<PaymentSettingsDocument>;
}
// Safe Export
const PaymentSettings =
  (models.PaymentSettings as PaymentSettingsModel) ||
  model<PaymentSettingsType, PaymentSettingsModel>(
    "PaymentSettings",
    PaymentSettingsSchema
  );

export default PaymentSettings;
