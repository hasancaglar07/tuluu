export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "canceled";
  customer: {
    id: string;
    name: string;
    email: string;
  };
  paymentMethod: string;
  description: string;
  createdAt: string;
  stripePaymentIntentId?: string;
}

export interface PaymentRefund {
  id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed";
  reason: string;
  transactionId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  stripeRefundId?: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  isActive: boolean;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalRevenue: number;
  activeSubscriptions: number;
  failedPayments: number;
  refundRate: number;
  revenueChange: number;
  subscriptionsChange: number;
  failedPaymentsChange: number;
  refundRateChange: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  subscriptions: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "canceled";
  customer: {
    name: string;
    email: string;
    address: string;
  };
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  stripeInvoiceId?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentSettings {
  general: GeneralSettings;
  providers: ProviderSettings;
  currencies: CurrencySettings;
  regional: RegionalSettings;
}

export interface GeneralSettings {
  enablePayments: boolean;
  testMode: boolean;
  autoRetryFailedPayments: boolean;
  sendPaymentReceipts: boolean;
  companyName: string;
  companyAddress: string;
  billingEmail: string;
  billingPhone: string;
}

export interface ProviderSettings {
  stripeEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecret: string;
  googlePayEnabled: boolean;
  googleMerchantId: string;
}

export interface CurrencySettings {
  defaultCurrency: string;
  autoUpdateExchangeRates: boolean;
  gemsEnabled: boolean;
  gemsExchangeRate: number;
  gemsDailyBonus: number;
  heartsEnabled: boolean;
  heartsGemsCost: number;
  heartsRefillTime: number;
}

export interface RegionalSettings {
  regionalPricingEnabled: boolean;
  taxCalculationEnabled: boolean;
  regions: Region[];
}

export interface Region {
  id: string;
  name: string;
  currency: string;
  priceMultiplier: number;
  taxRate: number;
  status: "active" | "pending" | "inactive";
}
