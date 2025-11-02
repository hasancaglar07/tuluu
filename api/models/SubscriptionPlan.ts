import {
  HydratedDocument,
  models,
  model,
  Schema,
  type Model,
  InferSchemaType,
} from "mongoose";

// **SubscriptionPlan Model**
// Defines different subscription tiers and pricing plans
// Supports flexible billing cycles, feature sets, and promotional pricing

// **Mongoose Schema Definition**
const SubscriptionPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      lowercase: true,
      unique: true,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
      lowercase: true,
    },
    price: {
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
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "yearly", "lifetime"],
      required: true,
    },
    trialPeriodDays: {
      type: Number,
      min: 0,
      max: 365,
      default: 0,
    },
    features: {
      type: [String],
      lowercase: true,
      default: [],
    },
    maxUsers: {
      type: Number,
      min: 1,
    },
    maxProjects: {
      type: Number,
      min: 0,
    },
    maxStorage: {
      type: Number,
      min: 0,
    },
    maxApiCalls: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    promotionalPrice: {
      type: Number,
      min: 0,
    },
    promotionalPeriod: {
      startDate: Date,
      endDate: Date,
    },
    stripeProductId: {
      type: String,

      lowercase: true,
    },
    stripePriceId: {
      type: String,
    },
    checkoutLink: {
      type: String,
      required: true,
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
// Pre-save hook to generate slug from name
SubscriptionPlanSchema.pre("save", async function (next) {
  if (this.isModified("name") && !this.slug) {
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check if slug already exists
    while (
      await SubscriptionPlan.exists({
        slug: uniqueSlug,
        _id: { $ne: this._id }, // Avoid matching self when updating
      })
    ) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    this.slug = uniqueSlug;
  }

  next();
});
// Compound Indexes
SubscriptionPlanSchema.index({ status: 1, isVisible: 1, sortOrder: 1 });
SubscriptionPlanSchema.index({ billingCycle: 1, status: 1 });
SubscriptionPlanSchema.index({ isPopular: 1, status: 1 });

// **Virtual Fields**
SubscriptionPlanSchema.virtual("formattedPrice").get(function () {
  return (this.price / 100).toFixed(2);
});

SubscriptionPlanSchema.virtual("currentPrice").get(function () {
  if (
    this.promotionalPrice &&
    this.promotionalPeriod &&
    this.promotionalPeriod.startDate &&
    this.promotionalPeriod.endDate
  ) {
    const now = new Date();
    if (
      now >= this.promotionalPeriod.startDate &&
      now <= this.promotionalPeriod.endDate
    ) {
      return this.promotionalPrice;
    }
  }
  return this.price;
});

SubscriptionPlanSchema.virtual("isOnPromotion").get(function () {
  if (
    !this.promotionalPrice ||
    !this.promotionalPeriod ||
    !this.promotionalPeriod.startDate ||
    !this.promotionalPeriod.endDate
  )
    return false;

  const now = new Date();
  return (
    now >= this.promotionalPeriod.startDate &&
    now <= this.promotionalPeriod.endDate
  );
});

// **Instance Methods**
SubscriptionPlanSchema.methods.getDisplayPrice = function (): string {
  const price = this.currentPrice / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency,
  }).format(price);
};

SubscriptionPlanSchema.methods.getFeatureByName = function (
  featureName: string
):
  | {
      name: string;
      description?: string;
      included: boolean;
      limit?: number;
      unit?: string;
    }
  | undefined {
  return this.features.find(
    (feature: {
      name: string;
      description?: string;
      included: boolean;
      limit?: number;
      unit?: string;
    }) => feature.name === featureName
  );
};

SubscriptionPlanSchema.methods.hasFeature = function (
  featureName: string
): boolean {
  const feature = this.getFeatureByName(featureName);
  return feature ? feature.included : false;
};

// **Static Methods**
SubscriptionPlanSchema.statics.getVisiblePlans = function () {
  return this.find({
    status: "active",
    isVisible: true,
  }).sort({ sortOrder: 1, price: 1 });
};

SubscriptionPlanSchema.statics.getPopularPlan = function () {
  return this.findOne({
    status: "active",
    isVisible: true,
    isPopular: true,
  });
};

// **Pre-save Middleware**
// SubscriptionPlanSchema.pre("save", function (next) {
//   // Generate slug from name if not provided
//   if (!this.slug && this.name) {
//     this.slug = this.name
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");
//   }

//   // Validate promotional period dates
//   if (this.promotionalPeriod) {
//     if (
//       this.promotionalPeriod.startDate &&
//       this.promotionalPeriod.endDate &&
//       this.promotionalPeriod.startDate >= this.promotionalPeriod.endDate
//     ) {
//       return next(new Error("Promotional start date must be before end date"));
//     }
//   }

//   next();
// });

// 3. Types
export type SubscriptionPlanType = InferSchemaType<
  typeof SubscriptionPlanSchema
>;
export type SubscriptionPlanTypeWithIsOnPromotion = SubscriptionPlanType & {
  isOnPromotion: boolean;
};

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlanType>;

export interface SubscriptionPlanModel extends Model<SubscriptionPlanType> {
  getVisiblePlans(): Promise<SubscriptionPlanType[]>;
  getPopularPlan(): Promise<SubscriptionPlanType | null>;
}

// Export Model
const SubscriptionPlan: SubscriptionPlanModel =
  (models.SubscriptionPlan as SubscriptionPlanModel) ||
  model<SubscriptionPlanType, SubscriptionPlanModel>(
    "SubscriptionPlan",
    SubscriptionPlanSchema
  );

export default SubscriptionPlan;
