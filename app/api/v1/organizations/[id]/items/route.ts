import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// Update the GET function in your API route to include supplierRelations

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key") || "";
    const organizationId = id; // Get organizationId from params

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          data: null,
          status: 401,
          error: "API key not found",
          success: false,
        })
      );
    }

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
          suppliers: true,
          supplierRelations: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: {
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
          suppliers: true,
          supplierRelations: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

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
    // Destructure suppliers separately to handle it properly
    const { organizationId, suppliers, ...restData } = body;

    const numericSellingPrice =
      typeof restData.sellingPrice === "string"
        ? parseFloat(restData.sellingPrice)
        : restData.sellingPrice;

    const numericCostPrice =
      typeof restData.costPrice === "string"
        ? parseFloat(restData.costPrice)
        : restData.costPrice;

    const numericQuantity =
      typeof restData.quantity === "string"
        ? parseInt(restData.quantity, 10)
        : restData.quantity;

    // Check if the item already exists
    const existingItem = await db.item.findFirst({
      where: {
        name: restData.name,
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

    // Create a new item without the supplier connections first
    const newItem = await db.item.create({
      data: {
        ...restData,
        sellingPrice: numericSellingPrice,
        costPrice: numericCostPrice,
        quantity: numericQuantity || 0,
        minStockLevel: numericQuantity || 0,
        organizationId,
      },
    });

    // If suppliers are provided, create the connections separately
    if (Array.isArray(suppliers) && suppliers.length > 0) {
      // Validate supplier IDs exist
      const validSuppliers = await db.supplier.findMany({
        where: {
          id: { in: suppliers.map((id) => String(id)) },
        },
        select: { id: true },
      });

      const validSupplierIds = validSuppliers.map((s) => ({ id: s.id }));

      if (validSupplierIds.length > 0) {
        await db.item.update({
          where: { id: newItem.id },
          data: {
            suppliers: {
              connect: validSupplierIds,
            },
          },
        });
      }
    }

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
