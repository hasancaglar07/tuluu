import mongoose, { Schema, type Document } from "mongoose";
import { HydratedDocument } from "mongoose";
import { Model } from "mongoose";
import { InferSchemaType } from "mongoose";
import { model } from "mongoose";
import { models } from "mongoose";
import type { BulkWriteResult } from "mongodb";

// Interface for ShopCategory document
export interface IShopCategory extends Document {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

// ShopCategory Schema
const ShopCategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    color: {
      type: String,
      required: true,
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex color validation
    },
    icon: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    itemCount: {
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
  },
  {
    timestamps: true,
  }
);

// Indexes
ShopCategorySchema.index({ isActive: 1, sortOrder: 1 });

// Method to update item count
ShopCategorySchema.methods.updateItemCount = async function () {
  const ShopCategory = mongoose.model("ShopCategory");
  const count = await ShopCategory.countDocuments({ category: this.name });
  this.itemCount = count;
  return this.save();
};

// Static method to get active categories with item counts
ShopCategorySchema.statics.getActiveCategories = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to reorder categories
ShopCategorySchema.statics.reorderCategories = async function (
  categoryIds: string[]
) {
  const updates = categoryIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { sortOrder: index },
    },
  }));

  return this.bulkWrite(updates);
};
// 3. Types
export type ShopCategoryType = InferSchemaType<typeof ShopCategorySchema>;
export type ShopCategoryDocument = HydratedDocument<ShopCategoryType>;

export interface ShopCategoryModel extends Model<ShopCategoryType> {
  getActiveCategories(): Promise<ShopCategoryDocument[]>;
  reorderCategories(categoryIds: string[]): Promise<BulkWriteResult>;
}

const ShopCategory =
  (models.ShopCategory as ShopCategoryModel) ||
  model<ShopCategoryType, ShopCategoryModel>(
    "ShopCategory",
    ShopCategorySchema
  );

export default ShopCategory;
