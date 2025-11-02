import { z } from "zod";
// Validation schema for shop item updates
export const updateShopItemSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().min(10).max(500).optional(),
  type: z
    .enum([
      "power-up",
      "cosmetic",
      "consumable",
      "currency",
      "bundle",
      "content",
    ])
    .optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  currency: z.enum(["gems", "coins", "USD"]).optional(),
  stockType: z.enum(["unlimited", "limited"]).optional(),
  stockQuantity: z.number().optional(),
  eligibility: z.string().optional(),
  isLimitedTime: z.boolean().optional(),
  startDate: z.string().optional(),
  lastModifiedBy: z.string(),
  endDate: z.string().optional(),
  sendNotification: z.boolean().optional(),
  notificationMessage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
});

// Infer the type
export type UpdateShopItemInput = z.infer<typeof updateShopItemSchema>;
