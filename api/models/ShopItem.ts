import { Model, models, Schema, type Document } from "mongoose";
import { model } from "mongoose";
import { HydratedDocument } from "mongoose";
import { InferSchemaType } from "mongoose";

// Interface for ShopItem document
export interface IShopItem extends Document {
  name: string;
  description: string;
  type:
    | "power-up"
    | "cosmetic"
    | "consumable"
    | "currency"
    | "bundle"
    | "content";
  category: string;
  price: number;
  currency: "gems" | "coins" | "USD";
  image?: string;
  stockType: "unlimited" | "limited";
  stockQuantity?: number;
  status: "active" | "inactive" | "draft";
  eligibility: string;

  // Limited time offer fields
  isLimitedTime: boolean;
  startDate?: Date;
  endDate?: Date;

  // Analytics fields
  purchases: number;
  revenue: number;
  views: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
  lastModifiedBy: string; // Admin user ID

  // Notification settings
  sendNotification: boolean;
  notificationMessage?: string;
  notificationSent: boolean;

  // Additional properties
  tags: string[];
  featured: boolean;
  sortOrder: number;
}

// ShopItem Schema
const ShopItemSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "power-up",
        "cosmetic",
        "consumable",
        "currency",
        "bundle",
        "content",
      ],
    },
    category: {
      type: String,
      required: true,
      ref: "ShopCategory",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["gems", "coins", "USD"],
      default: "gems",
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/11280/11280638.png",
    },
    stockType: {
      type: String,
      required: true,
      enum: ["unlimited", "limited"],
      default: "unlimited",
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    eligibility: {
      type: String,
      required: true,
      default: "All users",
    },

    // Limited time offer fields
    isLimitedTime: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },

    // Analytics fields
    purchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Metadata
    createdBy: {
      type: String,
      required: true,
    },
    lastModifiedBy: {
      type: String,
      required: true,
    },

    // Notification settings
    sendNotification: {
      type: Boolean,
      default: false,
    },
    notificationMessage: {
      type: String,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },

    // Additional properties
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
ShopItemSchema.index({ status: 1, category: 1 });
ShopItemSchema.index({ type: 1 });
ShopItemSchema.index({ featured: 1, sortOrder: 1 });
ShopItemSchema.index({ isLimitedTime: 1, startDate: 1, endDate: 1 });
ShopItemSchema.index({ createdAt: -1 });

// Virtual for stock display
ShopItemSchema.virtual("stockDisplay").get(function () {
  if (this.stockType === "unlimited") {
    return "Unlimited";
  }
  return `Limited (${this.stockQuantity || 0})`;
});

// Virtual for formatted price
ShopItemSchema.virtual("formattedPrice").get(function (
  this: InferSchemaType<typeof ShopItemSchema>
) {
  if (this.currency === "gems") return `${this.price} gems`;
  if (this.currency === "coins") return `${this.price} coins`;
  if (this.currency === "USD") return `$${this.price}`;
  return `${this.price} ${this.currency}`;
});

// Method to check if item is available
ShopItemSchema.methods.isAvailable = function (): boolean {
  if (this.status !== "active") return false;

  if (this.isLimitedTime) {
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
  }

  if (this.stockType === "limited" && this.stockQuantity <= 0) return false;

  return true;
};

// Method to increment purchase count
ShopItemSchema.methods.recordPurchase = function (amount: number) {
  this.purchases += 1;
  this.revenue += amount;

  if (this.stockType === "limited" && this.stockQuantity > 0) {
    this.stockQuantity -= 1;
  }

  return this.save();
};

// Method to increment view count
ShopItemSchema.methods.recordView = function () {
  this.views += 1;
  return this.save();
};

// Static method to get active items
ShopItemSchema.statics.getActiveItems = function (filters = {}) {
  return this.find({
    status: "active",
    ...filters,
  }).sort({ featured: -1, sortOrder: 1, createdAt: -1 });
};

// Static method to get items by category
ShopItemSchema.statics.getItemsByCategory = function (category: string) {
  return this.find({
    category,
    status: "active",
  }).sort({ featured: -1, sortOrder: 1 });
};

// Static method to get featured items
ShopItemSchema.statics.getFeaturedItems = function (limit = 10) {
  return this.find({
    status: "active",
    featured: true,
  })
    .sort({ sortOrder: 1 })
    .limit(limit);
};

// Static method to get limited time offers
ShopItemSchema.statics.getLimitedTimeOffers = function () {
  const now = new Date();
  return this.find({
    status: "active",
    isLimitedTime: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ endDate: 1 });
};

// Static method to get shop analytics
ShopItemSchema.statics.getShopAnalytics = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$revenue" },
        totalPurchases: { $sum: "$purchases" },
        totalViews: { $sum: "$views" },
        activeItems: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        inactiveItems: {
          $sum: {
            $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalPurchases: 1,
        totalViews: 1,
        activeItems: 1,
        inactiveItems: 1,
        averageOrderValue: {
          $cond: [
            { $gt: ["$totalPurchases", 0] },
            { $divide: ["$totalRevenue", "$totalPurchases"] },
            0,
          ],
        },
        conversionRate: {
          $cond: [
            { $gt: ["$totalViews", 0] },
            {
              $multiply: [{ $divide: ["$totalPurchases", "$totalViews"] }, 100],
            },
            0,
          ],
        },
      },
    },
  ]);
};

// Pre-save middleware to validate limited time offers
ShopItemSchema.pre("save", function (next) {
  if (this.isLimitedTime) {
    if (!this.startDate || !this.endDate) {
      return next(
        new Error(
          "Start date and end date are required for limited time offers"
        )
      );
    }
    if (this.startDate >= this.endDate) {
      return next(new Error("Start date must be before end date"));
    }
  }

  if (this.stockType === "limited" && !this.stockQuantity) {
    return next(
      new Error("Stock quantity is required for limited stock items")
    );
  }

  next();
});

// 3. Types
export type ShopItemType = InferSchemaType<typeof ShopItemSchema>;
export type ShopItemDocument = HydratedDocument<ShopItemType>;

export interface ShopItemModel extends Model<ShopItemType> {
  getShopAnalytics(): Promise<ShopItemDocument | null>;
  getActiveItems(filters?: Partial<ShopItemType>): Promise<ShopItemDocument[]>;
  getItemsByCategory(category: string): Promise<ShopItemDocument[]>;
  getFeaturedItems(limit?: number): Promise<ShopItemDocument[]>;
  getLimitedTimeOffers(): Promise<ShopItemDocument[]>;
}

const ShopItem =
  (models.ShopItem as ShopItemModel) ||
  model<ShopItemType, ShopItemModel>("ShopItem", ShopItemSchema);

export default ShopItem;
