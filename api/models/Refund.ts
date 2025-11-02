import mongoose, { Schema, type Document, type Model } from "mongoose";
import { InferSchemaType } from "mongoose";
import { HydratedDocument } from "mongoose";
import { model } from "mongoose";
import { models } from "mongoose";

// **Refund Model**
// Manages refund requests, processing, and tracking
// Handles both automatic and manual refund processes

export interface IRefund extends Document {
  // **Basic Refund Information**
  refundId: string; // Unique refund identifier
  originalTransactionId: mongoose.Types.ObjectId; // Reference to original transaction
  userId: mongoose.Types.ObjectId; // User requesting refund

  // **Refund Details**
  amount: number; // Refund amount in cents
  currency: string; // Currency code
  reason:
    | "customer_request"
    | "fraud"
    | "duplicate"
    | "product_issue"
    | "billing_error"
    | "other";
  reasonDescription?: string; // Detailed reason

  // **Refund Status**
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "processed"
    | "failed"
    | "cancelled";

  // **Processing Information**
  requestedAt: Date; // When refund was requested
  processedAt?: Date; // When refund was processed
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved
  rejectedBy?: mongoose.Types.ObjectId; // Admin who rejected
  rejectionReason?: string; // Reason for rejection

  // **Payment Provider Information**
  paymentProvider:
    | "stripe"
    | "paypal"
    | "apple_pay"
    | "google_pay"
    | "bank_transfer"
    | "crypto";
  providerRefundId?: string; // Refund ID from payment provider
  providerResponse?: Record<string, unknown>; // Provider response data

  // **Refund Type**
  refundType: "full" | "partial";
  originalAmount: number; // Original transaction amount

  // **Customer Information**
  customerEmail?: string; // Customer email for notifications
  customerNote?: string; // Customer's note with refund request

  // **Admin Information**
  adminNotes?: string; // Internal admin notes
  internalReason?: string; // Internal reason code

  // **Metadata**
  metadata: {
    automaticRefund?: boolean; // Whether refund was automatic
    disputeId?: string; // Related dispute ID
    chargebackId?: string; // Related chargeback ID
    [key: string]: unknown; // Additional metadata
  };

  // **Timestamps**
  createdAt: Date;
  updatedAt: Date;
}

// **Mongoose Schema Definition**
const RefundSchema = new Schema<IRefund>(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
    },
    originalTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    },
    reason: {
      type: String,
      enum: [
        "customer_request",
        "fraud",
        "duplicate",
        "product_issue",
        "billing_error",
        "other",
      ],
      required: true,
    },
    reasonDescription: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "processed",
        "failed",
        "cancelled",
      ],
      required: true,
    },
    requestedAt: {
      type: Date,
      required: true,
    },
    processedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
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
    },
    providerRefundId: String,
    providerResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
    refundType: {
      type: String,
      enum: ["full", "partial"],
      required: true,
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    customerEmail: String,
    customerNote: {
      type: String,
      maxlength: 1000,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    internalReason: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// **Virtual Fields**
RefundSchema.virtual("formattedAmount").get(function () {
  return (this.amount / 100).toFixed(2);
});

RefundSchema.virtual("refundPercentage").get(function () {
  return (this.amount / Number(this.originalAmount)) * 100;
});

RefundSchema.virtual("processingTime").get(function () {
  if (!this.processedAt) return null;
  return this.processedAt.getTime() - this.requestedAt.getTime();
});

RefundSchema.virtual("isPending").get(function () {
  return this.status === "pending";
});

RefundSchema.virtual("isProcessed").get(function () {
  return this.status === "processed";
});

// **Instance Methods**
RefundSchema.methods.getDisplayAmount = function (): string {
  const amount = this.amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency,
  }).format(amount);
};

RefundSchema.methods.canBeApproved = function (): boolean {
  return this.status === "pending";
};

RefundSchema.methods.canBeRejected = function (): boolean {
  return this.status === "pending";
};

RefundSchema.methods.canBeCancelled = function (): boolean {
  return ["pending", "approved"].includes(this.status);
};

// **Static Methods**
RefundSchema.statics.getPendingRefunds = function () {
  return this.find({ status: "pending" })
    .populate("userId", "username email")
    .populate("originalTransactionId")
    .sort({ requestedAt: 1 });
};

RefundSchema.statics.getRefundsByDateRange = function (
  startDate: Date,
  endDate: Date
) {
  return this.find({
    requestedAt: { $gte: startDate, $lte: endDate },
  }).sort({ requestedAt: -1 });
};

RefundSchema.statics.getRefundStats = function (
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        requestedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        averageAmount: { $avg: "$amount" },
      },
    },
  ]);
};

// **Pre-save Middleware**
RefundSchema.pre("save", function (next) {
  // **Generate refund ID if not provided**
  if (!this.refundId) {
    this.refundId = `REF_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // **Set processed date when status changes to processed**
  if (this.status === "processed" && !this.processedAt) {
    this.processedAt = new Date();
  }

  // **Validate refund amount doesn't exceed original amount**
  if (this.amount > this.originalAmount) {
    return next(
      new Error("Refund amount cannot exceed original transaction amount")
    );
  }

  next();
});

// Types
export type RefundType = InferSchemaType<typeof RefundSchema>;
export type RefundDocument = HydratedDocument<RefundType>;

export interface RefundModel extends Model<RefundType> {
  getPendingRefunds(): Promise<RefundDocument[]>;
  getRefundsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<RefundDocument[]>;
  getRefundStats(
    startDate: Date,
    endDate: Date
  ): Promise<
    Array<{
      _id: string;
      count: number;
      totalAmount: number;
      averageAmount: number;
    }>
  >;
}

// Safe Export
const Refund =
  (models.Refund as RefundModel) ||
  model<RefundType, RefundModel>("Refund", RefundSchema);

export default Refund;
