import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const organizationId = id; // Get organizationId from params
    const searchParams = request.nextUrl.searchParams;

    // Check if pagination is requested
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    // Get total count for pagination metadata
    const totalCount = await db.item.count({
      where: {
        organizationId,
      },
    });

    if (isPaginated) {
      // Parse pagination parameters with defaults
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      // Fetch paginated items
      const items = await db.item.findMany({
        where: {
          organizationId,
        },
        include: {
          category: true,
          brand: true,
          unit: true,
          taxRate: true,
        },
        orderBy: {
          // name: "asc",
          createdAt: "asc",
        },
        skip,
        take: limit,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);

      // Construct response with pagination metadata
      const response = {
        data: items,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        success: true,
      };

      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // If no pagination parameters, return all data
      const allItems = await db.item.findMany({
        where: {
          organizationId,
        },
        include: {
          category: true,
          brand: true,
          unit: true,
          taxRate: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      console.log("All items fetched:", allItems);

      return new Response(JSON.stringify({ data: allItems }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizationId, ...data } = body; // Destructure organizationId from body

    const numericSellingPrice =
      typeof data.sellingPrice === "string"
        ? parseFloat(data.sellingPrice)
        : data.sellingPrice;

    const numericCostPrice =
      typeof data.costPrice === "string"
        ? parseFloat(data.costPrice)
        : data.costPrice;

    const numericQuantity =
      typeof data.quantity === "string"
        ? parseInt(data.quantity, 10)
        : data.quantity;

    // Check if the item already exists but it can be created with the same name only if the organizationId is different
    const existingItem = await db.item.findFirst({
      where: {
        name: data.name,
        organizationId: organizationId,
      },
    });

    if (existingItem) {
      return new Response(
        JSON.stringify({
          status: 400,
          error: "Item already exists with the same name in this organization",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new item with the organizationId included in the data
    const newItem = await db.item.create({
      data: {
        ...data,
        sellingPrice: numericSellingPrice,
        costPrice: numericCostPrice,
        quantity: numericQuantity,
        minStockLevel: numericQuantity || 0,
        organizationId, // Include organizationId in the item creation
      },
    });

    revalidatePath("/dashboard/inventory/items");

    return new Response(
      JSON.stringify({
        status: 201,
        message: "Item created successfully💐",
        data: newItem,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating item:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        error: error.message || "Failed to create item",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
