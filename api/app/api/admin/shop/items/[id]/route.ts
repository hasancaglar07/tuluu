import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import ShopItem from "@/models/ShopItem";
import ShopCategory from "@/models/ShopCategory";
import dayjs from "dayjs";
import {
  UpdateShopItemInput,
  updateShopItemSchema,
} from "@/lib/validations/items";

// GET /api/admin/shop/items/[id] - Get specific shop item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Connect to database
    await connectDB();

    // Find shop item by ID
    const item = await ShopItem.findById(id).lean();
    if (!item) {
      return NextResponse.json(
        { error: "Shop item not found" },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedItem = {
      id: item._id,
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      price: item.price,
      currency: item.currency,
      image: item.image,
      stock:
        item.stockType === "unlimited"
          ? "Unlimited"
          : `Limited (${item.stockQuantity || 0})`,
      status: item.status,
      purchases: item.purchases,
      revenue: item.revenue,
      views: item.views,
      eligibility: item.eligibility,
      createdAt: item.createdAt
        ? dayjs(new Date(item.createdAt as unknown as string)).format(
            "YYYY-MM-DD"
          )
        : "",
      isLimitedTime: item.isLimitedTime,
      startDate: item.startDate,
      endDate: item.endDate,
      featured: item.featured,
      tags: item.tags,
      sortOrder: item.sortOrder,
      stockType: item.stockType,
      stockQuantity: item.stockQuantity,
      sendNotification: item.sendNotification,
      notificationMessage: item.notificationMessage,
    };

    return NextResponse.json({ item: transformedItem });
  } catch (error) {
    console.error("Error fetching shop item:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shop/items/[id] - Update shop item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateShopItemSchema.safeParse(body);

    if (!validatedData.success) {
      return Response.json(
        {
          message: "validation error",
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 500 }
      );
    }
    // Find existing item
    const existingItem = await ShopItem.findById(id);
    if (!existingItem) {
      return NextResponse.json(
        { error: "Shop item not found" },
        { status: 404 }
      );
    }

    const data = validatedData.data;
    // Prepare update data
    const updateData: UpdateShopItemInput = {
      ...data,
    };

    // Handle status update from isActive boolean
    if (body.isActive !== undefined) {
      updateData.status = body.isActive ? "active" : "inactive";
    }

    // Update category item counts if category changed
    if (data.category && data.category !== existingItem.category) {
      // Decrease count for old category
      await ShopCategory.findOneAndUpdate(
        { name: existingItem.category },
        { $inc: { itemCount: -1 } }
      );
      // Increase count for new category
      await ShopCategory.findOneAndUpdate(
        { name: data.category },
        { $inc: { itemCount: 1 } }
      );
    }
    console.log(updateData);
    // Update the item
    const updatedItem = await ShopItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedItem) {
      return NextResponse.json(
        {
          error: "error while updating",
        },
        { status: 500 }
      );
    }

    // Transform response data
    const responseItem = {
      id: updatedItem._id,
      name: updatedItem.name,
      description: updatedItem.description,
      type: updatedItem.type,
      category: updatedItem.category,
      price: updatedItem.price,
      currency: updatedItem.currency,
      image: updatedItem.image,
      stock:
        updatedItem.stockType === "unlimited"
          ? "Unlimited"
          : `Limited (${updatedItem.stockQuantity || 0})`,
      status: updatedItem.status,
      purchases: updatedItem.purchases,
      revenue: updatedItem.revenue,
      views: updatedItem.views,
      eligibility: updatedItem.eligibility,
      createdAt: updatedItem.createdAt
        ? dayjs(new Date(updatedItem.createdAt as unknown as string)).format(
            "YYYY-MM-DD"
          )
        : "",
      isLimitedTime: updatedItem.isLimitedTime,
      startDate: updatedItem.startDate,
      endDate: updatedItem.endDate,
      featured: updatedItem.featured,
      tags: updatedItem.tags,
      sortOrder: updatedItem.sortOrder,
    };

    return NextResponse.json({
      success: true,
      message: "Shop item updated successfully",
      data: {
        item: responseItem,
      },
    });
  } catch (error) {
    console.error("Error updating shop item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update shop item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/shop/items/[id] - Delete shop item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Connect to database
    await connectDB();

    // Find and delete the item
    const deletedItem = await ShopItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return NextResponse.json(
        { error: "Shop item not found" },
        { status: 404 }
      );
    }

    // Update category item count
    await ShopCategory.findOneAndUpdate(
      { name: deletedItem.category },
      { $inc: { itemCount: -1 } }
    );

    return NextResponse.json({
      message: "Shop item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shop item:", error);
    return NextResponse.json(
      { error: "Failed to delete shop item" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/shop/items/[id] - Update item status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { action } = body;

    // Find the item
    const item = await ShopItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: "Shop item not found" },
        { status: 404 }
      );
    }

    // Handle different actions
    const updateData: UpdateShopItemInput = { lastModifiedBy: userId };

    switch (action) {
      case "activate":
        updateData.status = "active";
        break;
      case "deactivate":
        updateData.status = "inactive";
        break;
      case "toggle-featured":
        updateData.featured = !item.featured;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update the item
    const updatedItem = await ShopItem.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();
    if (!updatedItem) {
      return NextResponse.json(
        { error: "Item can not be updated" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: `Shop item ${action} successfully`,
      item: {
        id: updatedItem._id,
        status: updatedItem.status,
        featured: updatedItem.featured,
      },
    });
  } catch (error) {
    console.error("Error updating shop item status:", error);
    return NextResponse.json(
      { error: "Failed to update shop item status" },
      { status: 500 }
    );
  }
}
