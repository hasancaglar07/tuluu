import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { SubscriptionPlanUpdateSchema } from "@/lib/validations/payment";
import { authGuard } from "@/lib/utils";
import { SubscriptionStatusChangeSchema } from "@/lib/validations/subscrption";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // **Connect to database**
    await connectDB();

    // **Get plan ID from params**
    const { id } = await params;

    // **Find subscription plan**
    const plan = await SubscriptionPlan.findById(id).lean();

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // **Transform plan for frontend**
    const transformedPlan = {
      id: plan._id.toString(),
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      shortDescription: plan.shortDescription,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      trialPeriodDays: plan.trialPeriodDays,
      features: plan.features,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      maxApiCalls: plan.maxApiCalls,
      status: plan.status,
      isPopular: plan.isPopular,
      isVisible: plan.isVisible,
      sortOrder: plan.sortOrder,
      promotionalPrice: plan.promotionalPrice,
      promotionalPeriod: plan.promotionalPeriod,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      formattedPrice: (plan.price / 100).toFixed(2),
    };

    return NextResponse.json({
      success: true,
      data: transformedPlan,
    });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscription plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    // **Connect to database**
    await connectDB();

    // **Get plan ID from params**
    const { id } = await params;

    // **Parse and validate request body**
    const body = await request.json();
    const validation = SubscriptionPlanUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    console.log(body);
    // **Check if plan exists**
    const existingPlan = await SubscriptionPlan.findById(id);
    if (!existingPlan) {
      return NextResponse.json(
        { success: false, message: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // **Update subscription plan**
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    // **Transform for frontend response**
    const transformedPlan = {
      id: updatedPlan!._id.toString(),
      name: updatedPlan!.name,
      slug: updatedPlan!.slug,
      description: updatedPlan!.description,
      price: updatedPlan!.price,
      currency: updatedPlan!.currency,
      billingCycle: updatedPlan!.billingCycle,
      features: updatedPlan!.features,
      status: updatedPlan!.status,
      isPopular: updatedPlan!.isPopular,
      isVisible: updatedPlan!.isVisible,
      metadata: updatedPlan!.metadata,
      createdAt: updatedPlan!.createdAt,
      updatedAt: updatedPlan!.updatedAt,
      formattedPrice: (updatedPlan!.price / 100).toFixed(2),
    };

    return NextResponse.json({
      success: true,
      data: { plan: transformedPlan },
      message: "Subscription plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update subscription plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    // **Connect to database**
    await connectDB();

    // **Get plan ID from params**
    const { id } = await params;

    // **Check if plan exists**
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // **Archive instead of delete to preserve data integrity**
    await SubscriptionPlan.findByIdAndUpdate(id, {
      status: "archived",
      isVisible: false,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan archived successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete subscription plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    // Connect to database
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate action with Zod
    const validatedData = SubscriptionStatusChangeSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { active } = validatedData.data;

    // Find quest
    const subscriptionPlan = await SubscriptionPlan.findById(id);
    if (!subscriptionPlan) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    let newStatus = subscriptionPlan.status;

    // Handle different actions
    switch (active) {
      case true:
        newStatus = "active";
        break;
      case false:
        newStatus = "inactive";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update quest status
    const updatedSubscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        status: newStatus,
      },
      { new: true }
    ).exec(); // better error visibility

    return NextResponse.json({
      success: true,
      data: {
        id: updatedSubscriptionPlan!._id.toString(),
        status: newStatus,
        active: active,
        updatedAt: updatedSubscriptionPlan!.updatedAt,
      },
      message: `Quest ${active}d successfully`,
    });
  } catch (error) {
    console.error("Error updating quest status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update quest status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
