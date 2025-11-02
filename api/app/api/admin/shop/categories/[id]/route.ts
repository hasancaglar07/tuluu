import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import ShopCategory from "@/models/ShopCategory";
import ShopItem from "@/models/ShopItem";
import { updateCategorySchema } from "@/lib/validations/categorie";
import { authGuard } from "@/lib/utils";

// PUT /api/admin/shop/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const { id } = await params;
    const { userId } = await auth;
    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Find existing category
    const existingCategory = await ShopCategory.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if new name already exists (if name is being changed)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await ShopCategory.findOne({
        name: validatedData.name,
      });
      if (nameExists) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 400 }
        );
      }

      // Update all shop items with the old category name
      await ShopItem.updateMany(
        { category: existingCategory.name },
        { category: validatedData.name }
      );
    }

    // Update the category
    const updatedCategory = await ShopCategory.findByIdAndUpdate(
      id,
      { ...validatedData, lastModifiedBy: userId },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Transform response data
    const responseCategory = {
      id: updatedCategory._id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      color: updatedCategory.color,
      icon: updatedCategory.icon,
      itemCount: updatedCategory.itemCount,
      sortOrder: updatedCategory.sortOrder,
      isActive: updatedCategory.isActive,
    };

    return NextResponse.json({
      message: "Category updated successfully",
      data: responseCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/shop/categories/[id] - Delete category
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

    // Find the category
    const category = await ShopCategory.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has items
    const itemCount = await ShopItem.countDocuments({
      category: category.name,
    });
    if (itemCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing items" },
        { status: 400 }
      );
    }

    // Delete the category
    await ShopCategory.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
