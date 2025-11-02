import { HydratedDocument, models, Schema, type Model } from "mongoose";
import { model } from "mongoose";
import { InferSchemaType } from "mongoose";

// **Subscription Model**
// Manages user subscriptions, billing cycles, and subscription lifecycle
// Handles renewals, cancellations, and subscription state management

// **Mongoose Schema Definition**
const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
      
    },
    status: {
      type: String,
      enum: [
        "active",
        "cancelled",
        "expired",
        "past_due",
        "trialing",
        "paused",
      ],
      required: true,
      
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      
    },
    nextBillingDate: {
      type: Date,
      
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "yearly", "lifetime"],
      required: true,
    },
    trialStart: Date,
    trialEnd: Date,
    isTrialing: {
      type: Boolean,
      default: false,
      
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: "USD",
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethodId: String,
    lastPaymentDate: Date,
    lastPaymentAmount: Number,
    failedPaymentAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledAt: Date,
    cancellationReason: String,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      
    },
    stripeCustomerId: {
      type: String,
      
    },
    usageMetrics: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, nextBillingDate: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });

// **Virtual Fields**
SubscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active" || this.status === "trialing";
});

SubscriptionSchema.virtual("daysUntilRenewal").get(function () {
  if (!this.nextBillingDate) return null;
  const now = new Date();
  const diffTime = this.nextBillingDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

SubscriptionSchema.virtual("formattedAmount").get(function () {
  return (this.amount / 100).toFixed(2);
});

// **Instance Methods**
SubscriptionSchema.methods.isExpired = function (): boolean {
  return new Date() > this.currentPeriodEnd;
};

SubscriptionSchema.methods.canBeReactivated = function (): boolean {
  return this.status === "cancelled" && !this.isExpired();
};

SubscriptionSchema.methods.getDisplayAmount = function (): string {
  const amount = this.amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency,
  }).format(amount);
};

SubscriptionSchema.methods.resetUsageMetrics = function (): void {
  this.usageMetrics = {};
  this.markModified("usageMetrics");
};

// **Static Methods**
SubscriptionSchema.statics.getActiveSubscriptions = function () {
  return this.find({
    status: { $in: ["active", "trialing"] },
  }).populate("userId planId");
};

SubscriptionSchema.statics.getExpiringSubscriptions = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: "active",
    currentPeriodEnd: { $lte: futureDate },
    cancelAtPeriodEnd: true,
  });
};

SubscriptionSchema.statics.getPastDueSubscriptions = function () {
  return this.find({
    status: "past_due",
    failedPaymentAttempts: { $gte: 1 },
  });
};

// **Pre-save Middleware**
SubscriptionSchema.pre("save", function (next) {
  // **Update trial status based on dates**
  if (this.trialStart && this.trialEnd) {
    const now = new Date();
    this.isTrialing = now >= this.trialStart && now <= this.trialEnd;
  }

  // **Set next billing date for active subscriptions**
  if (this.status === "active" && !this.nextBillingDate) {
    this.nextBillingDate = this.currentPeriodEnd;
  }

  // **Clear next billing date for cancelled subscriptions**
  if (this.status === "cancelled") {
    this.nextBillingDate = undefined;
  }

  next();
});

// 3. Types
export type SubscriptionType = InferSchemaType<typeof SubscriptionSchema>;
export type SubscriptionDocument = HydratedDocument<SubscriptionType>;

export interface SubscriptionModel extends Model<SubscriptionType> {
  getActiveSubscriptions(): Promise<SubscriptionType[]>;
  getExpiringSubscriptions(days?: number): Promise<SubscriptionType[]>;
  getPastDueSubscriptions(): Promise<SubscriptionType[]>;
}

const Subscription =
  (models.Subscription as SubscriptionModel) ||
  model<SubscriptionType, SubscriptionModel>(
    "Subscription",
    SubscriptionSchema
  );

export default Subscription;
