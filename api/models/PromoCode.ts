import mongoose, { model, models, Schema, type Model } from "mongoose";
import { InferSchemaType } from "mongoose";
import { HydratedDocument } from "mongoose";

// **PromoCode Model**
// Manages promotional codes, discounts, and marketing campaigns
// Supports various discount types, usage limits, and expiration dates

// **Mongoose Schema Definition**
const PromoCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount", "free_trial", "free_shipping"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    maxUsesPerUser: {
      type: Number,
      min: 1,
      default: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableItems: {
      type: {
        type: String,
        enum: ["all", "specific_plans", "specific_items", "categories"],
        required: true,
      },
      planIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "SubscriptionPlan",
        },
      ],
      itemIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "ShopItem",
        },
      ],
      categories: [String],
      minAmount: {
        type: Number,
        min: 0,
      },
    },
    userRestrictions: {
      newUsersOnly: {
        type: Boolean,
        default: false,
      },
      existingUsersOnly: {
        type: Boolean,
        default: false,
      },
      specificUsers: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      excludedUsers: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    campaignId: {
      type: String,
    },
    source: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

PromoCodeSchema.index({ code: 1, isActive: 1 });
PromoCodeSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
PromoCodeSchema.index({ campaignId: 1, isActive: 1 });
PromoCodeSchema.index({ "metadata.createdBy": 1 });
PromoCodeSchema.index({ startDate: 1 });
PromoCodeSchema.index({ endDate: 1 });
PromoCodeSchema.index({ isActive: 1 });
PromoCodeSchema.index({ campaignId: 1 });

// **Virtual Fields**
PromoCodeSchema.virtual("isValid").get(function () {
  const now = new Date();
  if (this.endDate)
    return (
      this.isActive &&
      now >= this.startDate &&
      now <= this.endDate &&
      (!this.maxUses || this.currentUses < this.maxUses)
    );
});

PromoCodeSchema.virtual("usagePercentage").get(function () {
  if (!this.maxUses) return 0;
  return (this.currentUses / this.maxUses) * 100;
});

PromoCodeSchema.virtual("remainingUses").get(function () {
  if (!this.maxUses) return null;
  return Math.max(0, this.maxUses - this.currentUses);
});

// **Instance Methods**
PromoCodeSchema.methods.canBeUsedBy = function (
  userId: mongoose.Types.ObjectId
): boolean {
  // **Check if user is specifically excluded**
  if (this.userRestrictions.excludedUsers?.includes(userId)) {
    return false;
  }

  // **Check if code is for specific users only**
  if (this.userRestrictions.specificUsers?.length > 0) {
    return this.userRestrictions.specificUsers.includes(userId);
  }

  return true;
};

PromoCodeSchema.methods.calculateDiscount = function (amount: number): number {
  let discount = 0;

  switch (this.discountType) {
    case "percentage":
      discount = (amount * this.discountValue) / 100;
      if (this.maxDiscountAmount) {
        discount = Math.min(discount, this.maxDiscountAmount);
      }
      break;
    case "fixed_amount":
      discount = Math.min(this.discountValue, amount);
      break;
    case "free_trial":
    case "free_shipping":
      discount = this.discountValue;
      break;
  }

  return Math.round(discount);
};

PromoCodeSchema.methods.isApplicableTo = function (
  itemType: string,
  itemId?: mongoose.Types.ObjectId
): boolean {
  const applicable = this.applicableItems;

  switch (applicable.type) {
    case "all":
      return true;
    case "specific_plans":
      return (
        itemType === "subscription" &&
        applicable.planIds?.some((id: mongoose.Types.ObjectId) =>
          id.equals(itemId)
        )
      );
    case "specific_items":
      return applicable.itemIds?.some((id: mongoose.Types.ObjectId) =>
        id.equals(itemId)
      );
    case "categories":
      // This would need additional logic to check item categories
      return true;
    default:
      return false;
  }
};

// **Static Methods**
PromoCodeSchema.statics.findValidCode = function (code: string) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [{ maxUses: null }, { $expr: { $lt: ["$currentUses", "$maxUses"] } }],
  });
};

PromoCodeSchema.statics.getActivePromotions = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });
};

PromoCodeSchema.statics.getExpiringCodes = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    isActive: true,
    endDate: { $lte: futureDate, $gte: new Date() },
  });
};

// **Pre-save Middleware**
PromoCodeSchema.pre("save", function (next) {
  // **Validate date range**
  if (this.endDate && this.startDate >= this.endDate) {
    return next(new Error("Start date must be before end date"));
  }

  // **Validate discount value based on type**
  if (
    this.discountType === "percentage" &&
    (this.discountValue < 0 || this.discountValue > 100)
  ) {
    return next(new Error("Percentage discount must be between 0 and 100"));
  }

  // **Ensure user restrictions are not conflicting**
  if (
    this.userRestrictions?.newUsersOnly &&
    this.userRestrictions.existingUsersOnly
  ) {
    return next(new Error("Cannot restrict to both new and existing users"));
  }

  next();
});

export type PromoCodeType = InferSchemaType<typeof PromoCodeSchema>;
export type PromoCodeDocument = HydratedDocument<PromoCodeType>;

export interface PromoCodeModel extends Model<PromoCodeType> {
  findValidCode(code: string): Promise<PromoCodeType | null>;
  getActivePromotions(): Promise<PromoCodeType[]>;
  getExpiringCodes(days?: number): Promise<PromoCodeType[]>;
}

// **Export Model**
const PromoCode =
  (models.PromoCode as PromoCodeModel) ||
  model<PromoCodeType, PromoCodeModel>("PromoCode", PromoCodeSchema);

export default PromoCode;
