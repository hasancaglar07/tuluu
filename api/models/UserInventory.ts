import mongoose, { Model, Schema } from "mongoose";
import { InferSchemaType } from "mongoose";
import { HydratedDocument } from "mongoose";
import { model } from "mongoose";
import { models } from "mongoose";

// Interface for UserInventory document

// UserInventory Schema
const UserInventorySchema: Schema = new Schema(
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

    // Inventory details
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    acquiredDate: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      required: true,
      enum: ["purchase", "reward", "gift", "promotion"],
      default: "purchase",
    },

    // Usage tracking
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedDate: {
      type: Date,
      default: null,
    },

    // Status and expiry
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },

    // Metadata
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "UserInventory",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
UserInventorySchema.index({ userId: 1, itemType: 1 });
UserInventorySchema.index({ userId: 1, isActive: 1 });
UserInventorySchema.index({ expiryDate: 1 });

// Virtual to check if item is expired
UserInventorySchema.virtual("isExpired").get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual to check if item is available for use
UserInventorySchema.virtual("isAvailable").get(function () {
  return this.isActive && Number(this.quantity) > 0 && !this.isExpired;
});

// Method to use item (for consumables)
UserInventorySchema.methods.useItem = function (amount = 1) {
  if (!this.isAvailable) {
    throw new Error("Item is not available for use");
  }

  if (this.quantity < amount) {
    throw new Error("Insufficient quantity");
  }

  this.quantity -= amount;
  this.timesUsed += amount;
  this.lastUsedDate = new Date();

  // If quantity reaches 0 for consumables, deactivate
  if (this.quantity === 0 && this.itemType === "consumable") {
    this.isActive = false;
  }

  return this.save();
};

// Method to add quantity
UserInventorySchema.methods.addQuantity = function (amount: number) {
  this.quantity += amount;
  return this.save();
};

// Static method to get user's inventory
UserInventorySchema.statics.getUserInventory = function (
  userId: string,
  filters = {}
) {
  return this.find({
    userId,
    isActive: true,
    ...filters,
  })
    .populate("itemId")
    .sort({ acquiredDate: -1 });
};

// Static method to get user's inventory by type
UserInventorySchema.statics.getUserInventoryByType = function (
  userId: string,
  itemType: string
) {
  return this.find({
    userId,
    itemType,
    isActive: true,
    quantity: { $gt: 0 },
  }).populate("itemId");
};

// Static method to check if user owns item
UserInventorySchema.statics.userOwnsItem = function (
  userId: string,
  itemId: string
) {
  return this.findOne({
    userId,
    itemId: new mongoose.Types.ObjectId(itemId),
    isActive: true,
    quantity: { $gt: 0 },
  });
};

// Static method to get expired items
UserInventorySchema.statics.getExpiredItems = function () {
  const now = new Date();
  return this.find({
    expiryDate: { $lt: now },
    isActive: true,
  });
};

// Static method to cleanup expired items
UserInventorySchema.statics.cleanupExpiredItems = function () {
  const now = new Date();
  return this.updateMany(
    {
      expiryDate: { $lt: now },
      isActive: true,
    },
    {
      isActive: false,
    }
  );
};

// 3. Types
export type UserInventoryType = InferSchemaType<typeof UserInventorySchema>;
export type UserInventoryDocument = HydratedDocument<UserInventoryType>;

export interface UserInventoryModel extends Model<UserInventoryType> {
  getUserInventory(
    userId: string,
    filters?: Record<string, unknown>
  ): Promise<UserInventoryType[]>;
  getUserInventoryByType(
    userId: string,
    itemType: string
  ): Promise<UserInventoryType[]>;
  userOwnsItem(
    userId: string,
    itemId: string
  ): Promise<UserInventoryType | null>;
  getExpiredItems(): Promise<UserInventoryType[]>;
  cleanupExpiredItems(): Promise<{
    acknowledged: boolean;
    modifiedCount: number;
  }>;
}

// 4. Safe Export
const UserInventory =
  (models.UserInventory as UserInventoryModel) ||
  model<UserInventoryType, UserInventoryModel>(
    "UserInventory",
    UserInventorySchema
  );

export default UserInventory;
