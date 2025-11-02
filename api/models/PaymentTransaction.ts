import { HydratedDocument, models, Schema, type Model } from "mongoose";
import { InferSchemaType } from "mongoose";
import { model } from "mongoose";

// **PaymentTransaction Model**
// This model handles all payment transactions including one-time purchases and subscription payments
// Supports multiple payment providers (Stripe, PayPal, etc.) and various transaction types

// **Mongoose Schema Definition**
const PaymentTransactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: false,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["subscription", "one-time", "refund", "chargeback", "adjustment"],
      required: true,
      default: "subscription",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
        "cancelled",
        "refunded",
        "disputed",
      ],
      required: true,
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      match: /^[A-Z]{3}$/,
      default: "USD",
      minlength: 3,
      maxlength: 3,
    },
    originalAmount: Number,
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
    feeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentProvider: {
      type: String,
      enum: [
        "stripe",
        "paypal",
        "apple_pay",
        "google_pay",
        "bank_transfer",
        "crypto",
      ],
      required: true,
      default: "stripe",
    },
    paymentMethodId: String,
    paymentMethodType: {
      type: String,
      enum: ["card", "bank_account", "digital_wallet", "crypto", "other"],
      required: true,
      default: "card",
    },
    lastFourDigits: String,
    cardBrand: String,
    itemType: {
      type: String,
      enum: [
        "subscription",
        "shop_item",
        "course",
        "premium_feature",
        "credits",
      ],
      required: true,
      default: "subscription",
    },
    itemId: {
      type: Schema.Types.ObjectId,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    billingAddress: {
      name: String,
      email: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    description: {
      type: String,
      required: true,
    },
    invoiceId: String,
    receiptUrl: String,
    failureReason: String,
    refundReason: String,
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: "PromoCode",
    },
    promoCodeDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    providerData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    processedAt: Date,
    settledAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

PaymentTransactionSchema.index({ userId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ status: 1, createdAt: -1 });
PaymentTransactionSchema.index({ paymentProvider: 1, status: 1 });
PaymentTransactionSchema.index({ itemType: 1, itemId: 1 });
PaymentTransactionSchema.index({ subscriptionId: 1, createdAt: -1 });

// **Virtual Fields**
PaymentTransactionSchema.virtual("formattedAmount").get(function () {
  return (this.amount / 100).toFixed(2);
});

PaymentTransactionSchema.virtual("isSuccessful").get(function () {
  return this.status === "completed";
});

PaymentTransactionSchema.virtual("isRefundable").get(function () {
  return this.status === "completed" && this.type !== "refund";
});

// **Instance Methods**
PaymentTransactionSchema.methods.canBeRefunded = function (): boolean {
  return (
    this.status === "completed" && this.type !== "refund" && !this.refundedAt
  );
};

PaymentTransactionSchema.methods.getDisplayAmount = function (): string {
  const amount = this.amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency,
  }).format(amount);
};

// **Static Methods**
PaymentTransactionSchema.statics.getRevenueByPeriod = async function (
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        status: "completed",
        type: { $ne: "refund" },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$netAmount" },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: "$netAmount" },
      },
    },
  ]);
};

// **Pre-save Middleware**
PaymentTransactionSchema.pre("save", function (next) {
  // **Calculate net amount if not provided**
  if (!this.netAmount) {
    this.netAmount =
      this.amount - (this.feeAmount || 0) - (this.discountAmount || 0);
  }

  // **Set processed date for completed transactions**
  if (this.status === "completed" && !this.processedAt) {
    this.processedAt = new Date();
  }

  // **Set refunded date for refunded transactions**
  if (this.status === "refunded" && !this.refundedAt) {
    this.refundedAt = new Date();
  }

  next();
});

export type PaymentTransactionType = InferSchemaType<
  typeof PaymentTransactionSchema
>;
export type PaymentTransactionDocument =
  HydratedDocument<PaymentTransactionType>;

export interface PaymentTransactionModel extends Model<PaymentTransactionType> {
  getRevenueByPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<
    {
      _id: null;
      totalRevenue: number;
      totalTransactions: number;
      averageAmount: number;
    }[]
  >;
}
// Safe export
const PaymentTransaction =
  (models.PaymentTransaction as PaymentTransactionModel) ||
  model<PaymentTransactionType, PaymentTransactionModel>(
    "PaymentTransaction",
    PaymentTransactionSchema
  );

export default PaymentTransaction;
