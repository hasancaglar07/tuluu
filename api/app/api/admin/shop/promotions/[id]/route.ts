import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ShopPromotion from "@/models/ShopPromotion";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

/**
 * GET /api/admin/shop/promotions/[id]
 * Fetch a specific promotion
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    // Connect to database
    await connectDB();

    const { id } = await params;

    const promotion = await ShopPromotion.findById(id)
      .populate("shopItemIds", "name")
      .lean();

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/shop/promotions/[id]
 * Update a promotion
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    const { id } = await params;
    // Connect to database
    await connectDB();
    const { userId } = await auth();
    const data = await request.json();

    // Check if promotion exists
    const existingPromotion = await ShopPromotion.findById(id);
    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    // Validate dates if provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Update promotion
    const updatedPromotion = await ShopPromotion.findByIdAndUpdate(
      id,
      {
        ...data,
        lastModifiedBy: userId,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ promotion: updatedPromotion });
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/shop/promotions/[id]
 * Delete a promotion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    // Connect to database
    await connectDB();

    const { id } = await params;

    const deletedPromotion = await ShopPromotion.findByIdAndDelete(id);
    if (!deletedPromotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
