import { z } from "zod";

// **Payment Transaction Validation Schemas**
export const PaymentTransactionCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum([
    "subscription",
    "one-time",
    "refund",
    "chargeback",
    "adjustment",
  ]),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  paymentProvider: z.enum([
    "stripe",
    "paypal",
    "apple_pay",
    "google_pay",
    "bank_transfer",
    "crypto",
  ]),
  paymentMethodType: z.enum([
    "card",
    "bank_account",
    "digital_wallet",
    "crypto",
    "other",
  ]),
  itemType: z.enum([
    "subscription",
    "shop_item",
    "course",
    "premium_feature",
    "credits",
  ]),
  itemId: z.string().optional(),
  subscriptionId: z.string().optional(),
  planId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  billingAddress: z
    .object({
      name: z.string(),
      email: z.string().email(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string().optional(),
      postalCode: z.string(),
      country: z.string(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export const PaymentTransactionUpdateSchema =
  PaymentTransactionCreateSchema.partial();

export const PaymentTransactionQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z
    .enum([
      "pending",
      "completed",
      "failed",
      "cancelled",
      "refunded",
      "disputed",
    ])
    .optional(),
  type: z
    .enum(["subscription", "one-time", "refund", "chargeback", "adjustment"])
    .optional(),
  paymentProvider: z
    .enum([
      "stripe",
      "paypal",
      "apple_pay",
      "google_pay",
      "bank_transfer",
      "crypto",
    ])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// **Subscription Plan Validation Schemas**
export const SubscriptionPlanCreateSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  shortDescription: z.string().max(200).optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
  billingCycle: z.enum(["monthly", "quarterly", "yearly", "lifetime"]),
  trialPeriodDays: z.number().min(0).max(365).optional().default(0),
  features: z.array(z.string().min(1, "Feature at least one is required")),
  maxUsers: z.number().min(1).optional(),
  maxProjects: z.number().min(0).optional(),
  maxStorage: z.number().min(0).optional(),
  maxApiCalls: z.number().min(0).optional(),
  isPopular: z.boolean().optional().default(false),
  isVisible: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
  promotionalPrice: z.number().min(0).optional(),
  promotionalPeriod: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  checkoutLink: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const SubscriptionPlanUpdateSchema =
  SubscriptionPlanCreateSchema.partial();

// **Promo Code Validation Schemas**
export const PromoCodeCreateSchema = z.object({
  code: z.string().min(1, "Code is required").max(50).toUpperCase(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  discountType: z.enum([
    "percentage",
    "fixed_amount",
    "free_trial",
    "free_shipping",
  ]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  maxDiscountAmount: z.number().min(0).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional().default(true),
  maxUses: z.number().min(1).optional(),
  maxUsesPerUser: z.number().min(1).optional().default(1),
  applicableItems: z.object({
    type: z.enum(["all", "specific_plans", "specific_items", "categories"]),
    planIds: z.array(z.string()).optional(),
    itemIds: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    minAmount: z.number().min(0).optional(),
  }),
  userRestrictions: z
    .object({
      newUsersOnly: z.boolean().optional().default(false),
      existingUsersOnly: z.boolean().optional().default(false),
      specificUsers: z.array(z.string()).optional(),
      excludedUsers: z.array(z.string()).optional(),
    })
    .optional(),
  campaignId: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const PromoCodeUpdateSchema = PromoCodeCreateSchema.partial();

// **Refund Validation Schemas**
export const RefundCreateSchema = z.object({
  originalTransactionId: z
    .string()
    .min(1, "Original transaction ID is required"),
  amount: z.number().min(0, "Amount must be positive"),
  reason: z.enum([
    "customer_request",
    "fraud",
    "duplicate",
    "product_issue",
    "billing_error",
    "other",
  ]),
  reasonDescription: z.string().max(1000).optional(),
  refundType: z.enum(["full", "partial"]),
  customerNote: z.string().max(1000).optional(),
  adminNotes: z.string().max(1000).optional(),
  metadata: z.record(z.any()).optional(),
});

export const RefundUpdateSchema = z.object({
  status: z
    .enum([
      "pending",
      "approved",
      "rejected",
      "processed",
      "failed",
      "cancelled",
    ])
    .optional(),
  rejectionReason: z.string().max(500).optional(),
  adminNotes: z.string().max(1000).optional(),
  metadata: z.record(z.any()).optional(),
});

// **Payment Settings Validation Schemas**
export const PaymentSettingsUpdateSchema = z.object({
  general: z
    .object({
      enablePayments: z.boolean().optional(),
      testMode: z.boolean().optional(),
      autoRetryFailedPayments: z.boolean().optional(),
      sendPaymentReceipts: z.boolean().optional(),
      companyName: z.string().optional(),
      companyAddress: z.string().optional(),
      billingEmail: z.string().email().optional(),
      billingPhone: z.string().optional(),
    })
    .optional(),
  providers: z
    .object({
      stripe: z
        .object({
          enabled: z.boolean().optional(),
          publicKey: z.string().optional(),
          secretKey: z.string().optional(),
          webhookSecret: z.string().optional(),
        })
        .optional(),
      paypal: z
        .object({
          enabled: z.boolean().optional(),
          clientId: z.string().optional(),
          clientSecret: z.string().optional(),
        })
        .optional(),
      googlePay: z
        .object({
          enabled: z.boolean().optional(),
          merchantId: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  currencies: z
    .object({
      defaultCurrency: z.string().length(3).optional(),
      autoUpdateExchangeRates: z.boolean().optional(),
      gems: z
        .object({
          enabled: z.boolean().optional(),
          exchangeRate: z.number().min(0).optional(),
          dailyBonus: z.number().min(0).optional(),
        })
        .optional(),
      hearts: z
        .object({
          enabled: z.boolean().optional(),
          gemsCost: z.number().min(0).optional(),
          refillTimeHours: z.number().min(0).optional(),
        })
        .optional(),
    })
    .optional(),
  regional: z
    .object({
      regionalPricing: z.boolean().optional(),
      taxCalculation: z.boolean().optional(),
      regions: z
        .array(
          z.object({
            name: z.string(),
            currency: z.string().length(3),
            priceMultiplier: z.number().min(0),
            taxRate: z.number().min(0).max(100),
            status: z.enum(["active", "pending", "inactive"]),
          })
        )
        .optional(),
    })
    .optional(),
});

// **Invoice Validation Schemas**
export const InvoiceQuerySchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),
});

export const InvoiceCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Item description is required"),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
      amount: z.number().min(0),
    })
  ),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// **Analytics Query Schema**
export const AnalyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).optional().default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
});
export const CheckoutSchema = z.object({
  termsAccepted: z.boolean(),
  planId: z.string().min(1, "Plan ID is required"),
  provider: z.enum(["stripe", "paypal", "googlepay"]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});
