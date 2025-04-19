// File: app/api/v1/organizations/items/[id]/route.ts
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // In Next.js App Router, params is NOT a Promise so don't await it
    const itemId = id; // Get item ID from URL parameters

    const item = await db.item.findUnique({
      where: {
        id: itemId,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        taxRate: true,
      },
    });

    if (!item) {
      return new Response("Item not found", { status: 404 });
    }

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// PUT handler for updating an item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Get item ID from URL parameters
  try {
    const itemId = id; // In Next.js App Router, params is NOT a Promise so don't await it
    const body = await request.json();

    // Parse numeric values if they are strings
    const numericSellingPrice =
      typeof body.sellingPrice === "string"
        ? parseFloat(body.sellingPrice)
        : body.sellingPrice;

    const numericCostPrice =
      typeof body.costPrice === "string"
        ? parseFloat(body.costPrice)
        : body.costPrice;

    const numericQuantity =
      typeof body.quantity === "string"
        ? parseInt(body.quantity, 10)
        : body.quantity;

    // Update the item
    const updatedItem = await db.item.update({
      where: { id: itemId },
      data: {
        ...body,
        sellingPrice: numericSellingPrice,
        costPrice: numericCostPrice,
        quantity: numericQuantity,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Item updated successfully",
        data: updatedItem,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error updating item:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        error: error.message || "Failed to update item",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
