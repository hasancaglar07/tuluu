import { FilterQuery } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import ShopItem from "@/models/ShopItem";
import connectDB from "@/lib/db/connect";
import { UserInventoryDocument } from "@/models/UserInventory";
import { authGuard } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build query
    const query: FilterQuery<UserInventoryDocument> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Get shop items with inventory information
    const items = await ShopItem.aggregate([
      { $match: query },
      {
        $addFields: {
          stock: {
            $cond: {
              if: { $eq: ["$stockType", "unlimited"] },
              then: "Unlimited",
              else: {
                $cond: {
                  if: { $eq: ["$stockQuantity", 0] },
                  then: "Limited (0/0)",
                  else: {
                    $concat: [
                      "Limited (",
                      { $toString: "$stockQuantity" },
                      "/",
                      { $toString: "$stockQuantity" },
                      ")",
                    ],
                  },
                },
              },
            },
          },
          status: {
            $cond: {
              if: { $eq: ["$stockType", "unlimited"] },
              then: "In Stock",
              else: {
                $cond: {
                  if: { $eq: ["$stockQuantity", 0] },
                  then: "Out of Stock",
                  else: {
                    $cond: {
                      if: { $lt: ["$stockQuantity", 10] },
                      then: "Low Stock",
                      else: "In Stock",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          category: 1,
          stock: 1,
          status: 1,
          purchases: 1,
          lastUpdated: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Filter by status if specified
    const statusMap = {
      "in stock": "In Stock",
      "low stock": "Low Stock",
      "out of stock": "Out of Stock",
      expiring: "Expiring Soon",
    } as const;

    type StatusKey = keyof typeof statusMap;

    let filteredItems = items;
    if (status && status !== "all") {
      const key = status.toLowerCase() as StatusKey; // Assert as StatusKey

      const targetStatus = statusMap[key];
      if (targetStatus) {
        filteredItems = items.filter((item) => item.status === targetStatus);
      }
    }

    return NextResponse.json({ items: filteredItems });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
