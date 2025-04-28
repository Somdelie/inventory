import { db } from "@/prisma/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const itemId = await params;
  try {
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key") || "";

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

    const validKey = await db.apiKey.findUnique({
      where: {
        key: apiKey,
      },
    });
    if (!validKey) {
      return new Response(
        JSON.stringify({
          data: null,
          status: 401,
          error: "Invalid API key",
          success: false,
        })
      );
    }

    const item = await db.item.findUnique({
      where: {
        id: itemId.id,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        taxRate: true,
      },
    });
    return new Response(
      JSON.stringify({
        data: item,
        status: 200,
        error: null,
        success: true,
      })
    );
  } catch (error) {
    console.error("Error fetching item:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// update item by id
// Modified PUT route handler that safely handles imageUrls
// Modified PUT route handler that safely handles imageUrls and numeric values
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const itemId = await params;
  const body = await request.json();

  try {
    const updateData: any = {};

    // Define numeric fields that need conversion
    const numericFields = [
      "salesCount",
      "salesTotal",
      "costPrice",
      "sellingPrice",
      "quantity",
      "minStockLevel",
      "maxStockLevel",
      "weight",
      "tax",
    ];

    // Conditionally add fields
    const fields = [
      "name",
      "slug",
      "sku",
      "barcode",
      "description",
      "categoryId",
      "isActive",
      "isPublished",
      "isSerialTracked",
      "dimensions",
      "upc",
      "ean",
      "mpn",
      "isbn",
      "thumbnail",
      "unitOfMeasure",
      "brandName",
      "taxRateId",
      "unitId",
    ];

    // Add regular fields
    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add numeric fields with type conversion
    for (const field of numericFields) {
      if (body[field] !== undefined) {
        // Convert to number or null if can't be parsed
        const parsedValue =
          typeof body[field] === "string"
            ? parseFloat(body[field])
            : body[field];

        updateData[field] = !isNaN(parsedValue) ? parsedValue : null;
      }
    }

    // Handle image URLs separately
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      updateData.imageUrls = { set: [...body.imageUrls] };
    }

    // Check for name conflict
    const existingItem = await db.item.findFirst({
      where: {
        name: body.name,
        id: { not: itemId.id }, // Exclude current item from check
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          data: null,
          status: 409,
          message: "Item with this name already exists",
          success: false,
        },
        { status: 409 }
      );
    }

    // Log the update data for debugging
    console.log("Update data:", JSON.stringify(updateData, null, 2));

    const item = await db.item.update({
      where: { id: itemId.id },
      data: updateData,
    });

    return NextResponse.json({
      data: item,
      status: 200,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      {
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : "Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
}
