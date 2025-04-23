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
    console.log("Item fetched:", item);
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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const itemId = await params;
  const body = await request.json();
  try {
    // Build the update data object conditionally
    const updateData: any = {};

    // Only include fields that are present in the request body
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.barcode !== undefined) updateData.barcode = body.barcode;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.salesCount !== undefined) updateData.salesCount = body.salesCount;
    if (body.salesTotal !== undefined) updateData.salesTotal = body.salesTotal;
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice;
    if (body.sellingPrice !== undefined)
      updateData.sellingPrice = body.sellingPrice;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.minStockLevel !== undefined)
      updateData.minStockLevel = body.minStockLevel;
    if (body.maxStockLevel !== undefined)
      updateData.maxStockLevel = body.maxStockLevel;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isPublished !== undefined)
      updateData.isPublished = body.isPublished;
    if (body.isSerialTracked !== undefined)
      updateData.isSerialTracked = body.isSerialTracked;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.upc !== undefined) updateData.upc = body.upc;
    if (body.ean !== undefined) updateData.ean = body.ean;
    if (body.mpn !== undefined) updateData.mpn = body.mpn;
    if (body.isbn !== undefined) updateData.isbn = body.isbn;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.unitOfMeasure !== undefined)
      updateData.unitOfMeasure = body.unitOfMeasure;
    if (body.brandName !== undefined) updateData.brandName = body.brandName;
    if (body.taxRateId !== undefined) updateData.taxRateId = body.taxRateId;

    // Handle imageUrls safely - only include if it's present and is actually an array
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      updateData.imageUrls = {
        set: [...body.imageUrls],
      };
    }

    // Update the item with only the fields that were provided
    const item = await db.item.update({
      where: {
        id: itemId.id,
      },
      data: updateData,
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
    console.error("Error updating item:", error);
    return new Response(
      JSON.stringify({
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : "Internal Server Error",
        success: false,
      }),
      { status: 500 }
    );
  }
}
