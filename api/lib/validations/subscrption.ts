import { z } from "zod";

export const SubscriptionStatusChangeSchema = z.object({
  active: z.boolean({
    required_error: "Active status is required",
    invalid_type_error: "Active must be a boolean",
  }),
});
export const createPaymentTransactionSchema = z.object({
  planId: z.string().length(24, "Invalid plan ID").optional(), // MongoDB ObjectId
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase 3-letter code")
    .default("USD"),
  provider: z
    .enum([
      "stripe",
      "paypal",
      "apple_pay",
      "google_pay",
      "bank_transfer",
      "crypto",
    ])
    .default("stripe"),
  billingCycle: z.string().optional(), // e.g., "monthly", "yearly" — add enum if known
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(5, "Description too short"),
  sessionId: z.string().optional(), // Used for Stripe session tracking
  email: z.string().email(),
  name: z.string(),
});
