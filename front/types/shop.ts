// types/shop.ts
import { z } from "zod";

// Base types for shop items
export type ShopItemType = 
  | "power-up" 
  | "cosmetic" 
  | "consumable" 
  | "currency" 
  | "bundle" 
  | "content";

export type ShopItemStatus = "active" | "inactive" | "draft";
export type ShopItemCurrency = "gems" | "coins" | "USD";
export type ShopItemStockType = "unlimited" | "limited";

// Shop item interface
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  category: string;
  price: number;
  currency: ShopItemCurrency;
  image?: string;
  stockType: ShopItemStockType;
  stockQuantity?: number;
  status: ShopItemStatus;
  eligibility: string;
  isLimitedTime: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
  purchases: number;
  revenue: number;
  views: number;
  tags: string[];
  featured: boolean;
  sortOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  isActive: boolean;
  sortOrder: number;
}

// Analytics data
export interface ShopAnalytics {
  totalRevenue: number;
  totalPurchases: number;
  averageOrderValue: number;
  topSellingItem: string;
  topSellingCategory: string;
  conversionRate: string;
}

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: string;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Expiring Soon";
  purchases: number;
  lastUpdated: string;
}

export interface InventoryAnalytics {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expiringItems: number;
}

// Promotion types
export type PromotionType = "discount" | "bundle" | "seasonal" | "boost";
export type PromotionStatus = "active" | "upcoming" | "expired";

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  discount: string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  eligibility: string;
  redemptions: number;
  target: number | null;
  progress: number | null;
  shopItemIds?: string[]; // References to shop items this promotion applies to
}

export interface PromotionAnalytics {
  activePromotions: number;
  upcomingPromotions: number;
  expiredPromotions: number;
  totalRedemptions: number;
  conversionRate: string;
}

// API response types
export interface ShopItemsResponse {
  items: ShopItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ShopAnalyticsResponse {
  analytics: ShopAnalytics;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface InventoryResponse {
  items: InventoryItem[];
  analytics: InventoryAnalytics;
}

export interface PromotionsResponse {
  promotions: Promotion[];
  analytics: PromotionAnalytics;
}

// Validation schemas
export const shopItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  type: z.enum(["power-up", "cosmetic", "consumable", "currency", "bundle", "content"]),
  category: z.string(),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.enum(["gems", "coins", "USD"]),
  image: z.string().optional(),
  stockType: z.enum(["unlimited", "limited"]),
  stockQuantity: z.number().optional(),
  status: z.enum(["active", "inactive", "draft"]),
  eligibility: z.string(),
  isLimitedTime: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean(),
});

export const promotionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  type: z.enum(["discount", "bundle", "seasonal", "boost"]),
  discount: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["active", "upcoming", "expired"]),
  eligibility: z.string(),
  target: z.number().nullable(),
  shopItemIds: z.array(z.string()).optional(),
});
