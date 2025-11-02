import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import ShopItem from "@/models/ShopItem";

type HistoryRecord = {
  _id?: string;
  action: string;
  userId?: string;
  timestamp: Date | string;
  description?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * GET /api/admin/shop/items/[id]/history
 *
 * Retrieves the change history for a specific shop item
 * Tracks all modifications, status changes, and administrative actions
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the item ID
 * @returns JSON response with history data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to the database
    await connectDB();

    const { id: itemId } = await params;

    // Validate that the item exists
    const item = await ShopItem.findById(itemId);
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop item not found",
        },
        { status: 404 }
      );
    }

    // Extract query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const actionType = searchParams.get("actionType"); // 'created', 'updated', 'status_changed', etc.
    const userId = searchParams.get("userId"); // Filter by specific user
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter for history records
    const filter: Record<string, unknown> = { itemId };
    if (actionType) {
      filter.action = actionType;
    }
    if (userId) {
      filter.userId = userId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get history from the item's history array (if it exists)
    // Note: This assumes the ShopItem model has a history field
    // If not, you might need to create a separate ItemHistory model
    let historyRecords = Array.isArray(item.history) ? item.history : [];
    // Apply filters
    if (actionType) {
      historyRecords = historyRecords.filter(
        (record: HistoryRecord) => record.action === actionType
      );
    }
    if (userId) {
      historyRecords = historyRecords.filter(
        (record: HistoryRecord) => record.userId?.toString() === userId
      );
    }

    // Sort records
    historyRecords.sort((a: HistoryRecord, b: HistoryRecord) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // Apply pagination
    const totalRecords = historyRecords.length;
    const paginatedRecords = historyRecords.slice(skip, skip + limit);

    // Populate user information for each history record
    const populatedHistory = await Promise.all(
      paginatedRecords.map(async (record: HistoryRecord) => {
        // let user = null;
        if (record.userId) {
          try {
            // user = await User.findById(record.userId)
            //   .select("username email avatar")
            //   .lean();
          } catch (error) {
            console.warn(`Failed to populate user ${record.userId}:`, error);
          }
        }

        return {
          id: record._id?.toString() || `${record.timestamp}_${record.action}`,
          action: record.action,
          timestamp: record.timestamp,
          userId: record.userId?.toString() || null,
          emai: record.userId?.toString() || null,
          description: record.description || generateActionDescription(record),
          changes: record.changes || {},
          metadata: record.metadata || {},
          ipAddress: record.ipAddress || null,
          userAgent: record.userAgent || null,
        };
      })
    );

    // Generate summary statistics
    const actionCounts: Record<string, number> = historyRecords.reduce(
      (acc, record: HistoryRecord) => {
        acc[record.action] = (acc[record.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const uniqueUsers = new Set(
      historyRecords
        .filter((record: HistoryRecord) => record.userId)
        .map((record: HistoryRecord) => record.userId?.toString())
    ).size;

    return NextResponse.json({
      success: true,
      data: {
        history: populatedHistory,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRecords / limit),
          totalItems: totalRecords,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalRecords / limit),
          hasPreviousPage: page > 1,
        },
        summary: {
          totalChanges: totalRecords,
          uniqueUsers,
          actionCounts,
          firstChange:
            historyRecords.length > 0
              ? historyRecords[historyRecords.length - 1].timestamp
              : null,
          lastChange:
            historyRecords.length > 0 ? historyRecords[0].timestamp : null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching item history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch item history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shop/items/[id]/history
 *
 * Add a new history record for the shop item
 * Used to manually log administrative actions or system events
 *
 * @param request - Next.js request object with history record data
 * @param params - Route parameters containing the item ID
 * @returns JSON response with creation result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: itemId } = await params;
    const body = await request.json();
    const { action, description, changes, metadata, userId } = body;

    // Validate required fields
    if (!action || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Action and description are required",
        },
        { status: 400 }
      );
    }

    // Validate that the item exists
    const item = await ShopItem.findById(itemId);
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop item not found",
        },
        { status: 404 }
      );
    }

    // Create new history record
    const historyRecord = {
      action,
      description,
      timestamp: new Date(),
      userId: userId || null,
      changes: changes || {},
      metadata: metadata || {},
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    };

    // Add to item history
    await ShopItem.findByIdAndUpdate(itemId, {
      $push: { history: historyRecord },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "History record added successfully",
        record: historyRecord,
      },
    });
  } catch (error) {
    console.error("Error adding history record:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add history record",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate human-readable descriptions for actions
 *
 * @param record - History record object
 * @returns Human-readable description string
 */
function generateActionDescription(record: HistoryRecord): string {
  switch (record.action) {
    case "created":
      return "Item was created";
    case "updated":
      return "Item details were updated";
    case "status_changed":
      return `Item status changed to ${record.changes?.status || "unknown"}`;
    case "price_changed":
      return `Price changed from ${record.changes?.oldPrice || "unknown"} to ${
        record.changes?.newPrice || "unknown"
      }`;
    case "stock_updated":
      return `Stock updated from ${record.changes?.oldStock || "unknown"} to ${
        record.changes?.newStock || "unknown"
      }`;
    case "category_changed":
      return `Category changed to ${record.changes?.newCategory || "unknown"}`;
    case "image_updated":
      return "Item images were updated";
    case "description_updated":
      return "Item description was updated";
    case "deleted":
      return "Item was deleted";
    case "restored":
      return "Item was restored from deletion";
    default:
      return `Action: ${record.action}`;
  }
}
