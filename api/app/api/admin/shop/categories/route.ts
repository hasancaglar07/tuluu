import { createCategorySchema } from "@/lib/validations/categorie";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import ShopCategory from "@/models/ShopCategory";
import { z } from "zod";

// GET /api/admin/shop/categories - Fetch all categories
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Fetch all categories
    const categories = await ShopCategory.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Transform data for frontend
    const transformedCategories = categories.map((category) => ({
      id: category._id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      itemCount: category.itemCount,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    }));

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/shop/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Check if category name already exists
    const existingCategory = await ShopCategory.findOne({
      name: validatedData.name,
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Create new category
    const newCategory = new ShopCategory({
      ...validatedData,
      createdBy: userId,
      lastModifiedBy: userId,
    });
    await newCategory.save();

    // Transform response data
    const responseCategory = {
      id: newCategory._id,
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
      icon: newCategory.icon,
      itemCount: newCategory.itemCount,
      sortOrder: newCategory.sortOrder,
      isActive: newCategory.isActive,
    };

    return NextResponse.json(
      {
        message: "Category created successfully",
        data: responseCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shop/categories - Reorder categories
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { categoryIds } = body;

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "categoryIds must be an array" },
        { status: 400 }
      );
    }

    // Update sort order for each category
    const updatePromises = categoryIds.map((id, index) =>
      ShopCategory.findByIdAndUpdate(
        id,
        { sortOrder: index, lastModifiedBy: userId },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: "Categories reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering categories:", error);
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
