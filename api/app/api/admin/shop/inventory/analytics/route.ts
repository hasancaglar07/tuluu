import { NextResponse } from "next/server";
import ShopItem from "@/models/ShopItem";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

/**
 * GET /api/admin/shop/inventory/analytics
 * Fetch inventory analytics data
 */
export async function GET() {
  try {
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    // Connect to database
    await connectDB();

    // Get inventory analytics
    const analytics = await ShopItem.aggregate([
      {
        $addFields: {
          inventoryStatus: {
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
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          inStock: {
            $sum: { $cond: [{ $eq: ["$inventoryStatus", "In Stock"] }, 1, 0] },
          },
          lowStock: {
            $sum: { $cond: [{ $eq: ["$inventoryStatus", "Low Stock"] }, 1, 0] },
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ["$inventoryStatus", "Out of Stock"] }, 1, 0],
            },
          },
          expiringItems: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isLimitedTime", true] },
                    {
                      $lt: [
                        "$endDate",
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      ],
                    }, // Next 7 days
                    { $gt: ["$endDate", new Date()] }, // Not yet expired
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = analytics[0] || {
      totalItems: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      expiringItems: 0,
    };

    return NextResponse.json({ analytics: result });
  } catch (error) {
    console.error("Error fetching inventory analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
