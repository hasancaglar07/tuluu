import { Model, models, Schema } from "mongoose";
import { model } from "mongoose";
import { HydratedDocument } from "mongoose";
import { InferSchemaType } from "mongoose";

// ShopPromotion Schema
const ShopPromotionSchema = new Schema(
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
      enum: ["discount", "bundle", "seasonal", "boost"],
    },
    discount: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "upcoming", "expired"],
      default: "upcoming",
    },
    eligibility: {
      type: String,
      required: true,
      default: "All users",
    },
    redemptions: {
      type: Number,
      default: 0,
      min: 0,
    },
    target: {
      type: Number,
      default: null,
    },
    // References to shop items this promotion applies to
    shopItemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "ShopItem",
      },
    ],
    // Promotion code (if applicable)
    code: {
      type: String,
      trim: true,
    },
    // Discount details
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free", "bogo"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      min: 0,
    },
    // Minimum purchase requirements
    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Usage limits
    usageLimit: {
      type: Number,
      default: null,
    },
    perUserLimit: {
      type: Number,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ShopPromotionSchema.index({ status: 1 });
ShopPromotionSchema.index({ startDate: 1, endDate: 1 });
ShopPromotionSchema.index({ code: 1 }, { sparse: true });

// Virtual for progress calculation
ShopPromotionSchema.virtual("progress").get(function () {
  if (!this.target) return null;
  return Math.round((this.redemptions / this.target) * 100);
});

// Method to check if promotion is active
ShopPromotionSchema.methods.isActive = function (): boolean {
  const now = new Date();
  return (
    this.status === "active" &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.usageLimit || this.redemptions < this.usageLimit)
  );
};

// Method to record redemption
ShopPromotionSchema.methods.redeem = function () {
  this.redemptions += 1;

  // Check if we've hit the usage limit
  if (this.usageLimit && this.redemptions >= this.usageLimit) {
    this.status = "expired";
  }

  return this.save();
};

// Static method to get active promotions
ShopPromotionSchema.statics.getActivePromotions = function () {
  const now = new Date();
  return this.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ endDate: 1 });
};

// Static method to get upcoming promotions
ShopPromotionSchema.statics.getUpcomingPromotions = function () {
  const now = new Date();
  return this.find({
    status: "upcoming",
    startDate: { $gt: now },
  }).sort({ startDate: 1 });
};

// Static method to get expired promotions
ShopPromotionSchema.statics.getExpiredPromotions = function () {
  const now = new Date();
  return this.find({
    $or: [{ status: "expired" }, { status: "active", endDate: { $lt: now } }],
  }).sort({ endDate: -1 });
};

// Static method to get promotions by item
ShopPromotionSchema.statics.getPromotionsByItem = function (itemId) {
  const now = new Date();
  return this.find({
    shopItemIds: itemId,
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};

// Static method to get promotion analytics
ShopPromotionSchema.statics.getPromotionAnalytics = function () {
  const now = new Date();

  return this.aggregate([
    {
      $facet: {
        active: [
          {
            $match: {
              status: "active",
              startDate: { $lte: now },
              endDate: { $gte: now },
            },
          },
          { $count: "count" },
        ],
        upcoming: [
          {
            $match: {
              status: "upcoming",
              startDate: { $gt: now },
            },
          },
          { $count: "count" },
        ],
        expired: [
          {
            $match: {
              $or: [
                { status: "expired" },
                { status: "active", endDate: { $lt: now } },
              ],
            },
          },
          { $count: "count" },
        ],
        redemptions: [
          { $group: { _id: null, total: { $sum: "$redemptions" } } },
        ],
      },
    },
    {
      $project: {
        activePromotions: { $arrayElemAt: ["$active.count", 0] },
        upcomingPromotions: { $arrayElemAt: ["$upcoming.count", 0] },
        expiredPromotions: { $arrayElemAt: ["$expired.count", 0] },
        totalRedemptions: { $arrayElemAt: ["$redemptions.total", 0] },
      },
    },
  ]);
};

// Pre-save middleware to update status based on dates
ShopPromotionSchema.pre("save", function (next) {
  const now = new Date();

  if (this.startDate > now) {
    this.status = "upcoming";
  } else if (this.endDate < now) {
    this.status = "expired";
  } else {
    this.status = "active";
  }

  next();
});

// 3. Types
export type ShopPromotionType = InferSchemaType<typeof ShopPromotionSchema>;
export type ShopPromotionDocument = HydratedDocument<ShopPromotionType>;

export interface ShopPromotionModel extends Model<ShopPromotionType> {
  getActivePromotions(): Promise<ShopPromotionDocument[]>;
  getUpcomingPromotions(): Promise<ShopPromotionDocument[]>;
  getExpiredPromotions(): Promise<ShopPromotionDocument[]>;
  getPromotionsByItem(itemId: string): Promise<ShopPromotionDocument[]>;
  getPromotionAnalytics(): Promise<ShopPromotionDocument>;
}

// 4. Safe Export
const ShopPromotion =
  (models.ShopPromotion as ShopPromotionModel) ||
  model<ShopPromotionType, ShopPromotionModel>(
    "ShopPromotion",
    ShopPromotionSchema
  );

export default ShopPromotion;
