import mongoose, {
  InferSchemaType,
  Model,
  models,
  Schema,
  type Document,
} from "mongoose";
import { model } from "mongoose";
import { HydratedDocument } from "mongoose";

// Interface for UserPurchase document
export interface IUserPurchase extends Document {
  userId: string;
  itemId: mongoose.Types.ObjectId;
  itemName: string;
  itemType: string;

  // Purchase details
  price: number;
  currency: string;
  quantity: number;
  totalAmount: number;

  // Payment information
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";

  // Purchase metadata
  purchaseDate: Date;
  deviceType?: string;
  platform?: string;
  userLevel?: number;
  userStreak?: number;

  // Refund information
  refundDate?: Date;
  refundReason?: string;
  refundAmount?: number;

  // Usage tracking (for consumables)
  used: boolean;
  usedDate?: Date;
  expiryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// UserPurchase Schema
const UserPurchaseSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ShopItem",
    },
    itemName: {
      type: String,
      required: true,
    },
    itemType: {
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

    // Purchase details
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["gems", "coins", "USD"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment information
    paymentMethod: {
      type: String,
      enum: [
        "gems",
        "coins",
        "credit_card",
        "paypal",
        "apple_pay",
        "google_pay",
      ],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    // Purchase metadata
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
    },
    platform: {
      type: String,
      enum: ["ios", "android", "web"],
    },
    userLevel: {
      type: Number,
      min: 1,
    },
    userStreak: {
      type: Number,
      min: 0,
    },

    // Refund information
    refundDate: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    // Usage tracking (for consumables)
    used: {
      type: Boolean,
      default: false,
    },
    usedDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
UserPurchaseSchema.index({ userId: 1, purchaseDate: -1 });
UserPurchaseSchema.index({ itemId: 1, paymentStatus: 1 });
UserPurchaseSchema.index({ paymentStatus: 1, purchaseDate: -1 });
UserPurchaseSchema.index({ itemType: 1, used: 1 });

// Virtual for purchase age in days
UserPurchaseSchema.virtual("purchaseAgeInDays").get(function (this: {
  purchaseDate: Date;
}) {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.purchaseDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark item as used (for consumables)
UserPurchaseSchema.methods.markAsUsed = function () {
  if (this.itemType === "consumable" && !this.used) {
    this.used = true;
    this.usedDate = new Date();
    return this.save();
  }
  throw new Error("Item cannot be marked as used");
};

// Method to process refund
UserPurchaseSchema.methods.processRefund = function (
  reason: string,
  amount?: number
) {
  if (this.paymentStatus !== "completed") {
    throw new Error("Can only refund completed purchases");
  }

  this.paymentStatus = "refunded";
  this.refundDate = new Date();
  this.refundReason = reason;
  this.refundAmount = amount || this.totalAmount;

  return this.save();
};

// Static method to get user's purchase history
UserPurchaseSchema.statics.getUserPurchases = function (
  userId: string,
  filters = {}
) {
  return this.find({
    userId,
    ...filters,
  })
    .sort({ purchaseDate: -1 })
    .populate("itemId");
};

// Static method to get purchase analytics for an item
UserPurchaseSchema.statics.getItemPurchaseAnalytics = function (
  itemId: string
) {
  return this.aggregate([
    { $match: { itemId: new mongoose.Types.ObjectId(itemId) } },
    {
      $group: {
        _id: "$paymentStatus",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
};

// Static method to get daily purchase trends
UserPurchaseSchema.statics.getDailyPurchaseTrends = function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        purchaseDate: { $gte: startDate },
        paymentStatus: "completed",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$purchaseDate",
          },
        },
        purchases: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Static method to get top selling items
UserPurchaseSchema.statics.getTopSellingItems = function (limit = 10) {
  return this.aggregate([
    { $match: { paymentStatus: "completed" } },
    {
      $group: {
        _id: "$itemId",
        itemName: { $first: "$itemName" },
        itemType: { $first: "$itemType" },
        totalPurchases: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { totalPurchases: -1 } },
    { $limit: limit },
  ]);
};

// Pre-save middleware to calculate total amount
UserPurchaseSchema.pre("save", function (next) {
  if (this.isModified("price") || this.isModified("quantity")) {
    this.totalAmount = Number(this.price) * Number(this.quantity);
  }
  next();
});

// 3. Types
export type UserType = InferSchemaType<typeof UserPurchaseSchema>;
export type UserDocument = HydratedDocument<UserType>;

export interface UserPurchaseModel extends Model<UserType> {
  getUserPurchases(
    userId: string,
    filters?: Record<string, unknown>
  ): Promise<UserType[]>;

  getItemPurchaseAnalytics(itemId: string): Promise<
    {
      _id: string;
      count: number;
      totalRevenue: number;
    }[]
  >;

  getDailyPurchaseTrends(days?: number): Promise<
    {
      _id: string;
      purchases: number;
      revenue: number;
    }[]
  >;

  getTopSellingItems(limit?: number): Promise<
    {
      _id: mongoose.Types.ObjectId;
      itemName: string;
      itemType: string;
      totalPurchases: number;
      totalRevenue: number;
    }[]
  >;
}
// 4. Safe Export
const UserPurchase =
  (models.UserPurchase as UserPurchaseModel) ||
  model<UserType, UserPurchaseModel>("UserPurchase", UserPurchaseSchema);

export default UserPurchase;
