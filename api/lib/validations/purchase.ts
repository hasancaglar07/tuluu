import { z } from "zod";

export const CreatePurchaseSchema = z.object({
  itemId: z
    .string()
    .min(1, "Item ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Item ID must be a valid MongoDB ObjectId"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100")
    .default(1),
  paymentMethod: z
    .enum(
      ["gems", "coins", "credit_card", "paypal", "apple_pay", "google_pay"],
      {
        errorMap: () => ({ message: "Invalid payment method" }),
      }
    )
    .optional(),
  platform: z
    .enum(["ios", "android", "web"], {
      errorMap: () => ({ message: "Invalid platform" }),
    })
    .optional()
    .default("web"),
  deviceType: z
    .enum(["mobile", "tablet", "desktop"], {
      errorMap: () => ({ message: "Invalid device type" }),
    })
    .optional()
    .default("desktop"),
  userLevel: z
    .number()
    .int("User level must be an integer")
    .min(1, "User level must be at least 1")
    .max(1000, "User level cannot exceed 1000")
    .optional()
    .default(1),
  promoCode: z
    .string()
    .min(1)
    .max(50, "Promo code cannot exceed 50 characters")
    .optional(),
});

// Schema for GET request query parameters
export const GetPurchasesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1))
    .refine((val) => val >= 1, {
      message: "Page must be at least 1",
    }),
  status: z
    .enum(["pending", "completed", "failed", "refunded"], {
      errorMap: () => ({ message: "Invalid status filter" }),
    })
    .optional(),
  itemType: z
    .enum(
      ["power-up", "cosmetic", "consumable", "currency", "bundle", "content"],
      {
        errorMap: () => ({ message: "Invalid item type filter" }),
      }
    )
    .optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid start date format",
    })
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date format",
    })
    .transform((val) => (val ? new Date(val) : undefined)),
});

// Schema for validating user ID parameter
export const UserIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "User ID is required")
    .refine(
      (val) => /^[0-9a-fA-F]{24}$/.test(val) || /^user_[a-zA-Z0-9]+$/.test(val),
      "User ID must be a valid MongoDB ObjectId or Clerk ID"
    ),
});
