// File: app/api/goods-receipts/[id]/lines/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if goods receipt ID is provided
    const goodsReceiptId = id;
    if (!goodsReceiptId) {
      return NextResponse.json(
        { error: "Goods receipt ID is required" },
        { status: 400 }
      );
    }

    // Fetch goods receipt lines
    const lines = await db.goodsReceiptLine.findMany({
      where: {
        goodsReceiptId,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            description: true,
            imageUrls: true,
          },
        },
        purchaseOrderLine: {
          select: {
            id: true,
            purchaseOrderId: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("Fetched goods receipt lines from api:", lines);

    return NextResponse.json(lines);
  } catch (error) {
    console.error("Error fetching goods receipt lines:", error);
    return NextResponse.json(
      { error: "Failed to fetch goods receipt lines" },
      { status: 500 }
    );
  }
}

// For adding a new line item to an existing goods receipt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed this line to match GET function
) {
  const { id } = await params; // Added this line to await params

  try {
    // Verify authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if goods receipt ID is provided
    const goodsReceiptId = id; // Changed from params.id to id
    if (!goodsReceiptId) {
      return NextResponse.json(
        { error: "Goods receipt ID is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Validate required fields
    if (
      !body.itemId ||
      !body.purchaseOrderLineId ||
      body.receivedQuantity === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the goods receipt exists and user has access
    const goodsReceipt = await db.goodsReceipt.findUnique({
      where: {
        id: goodsReceiptId,
        organizationId: user.organizationId ?? "",
      },
    });

    if (!goodsReceipt) {
      return NextResponse.json(
        { error: "Goods receipt not found" },
        { status: 404 }
      );
    }

    // Create new line item
    const newLine = await db.goodsReceiptLine.create({
      data: {
        receivedQuantity: body.receivedQuantity,
        notes: body.notes,
        goodsReceipt: {
          connect: { id: goodsReceiptId },
        },
        item: {
          connect: { id: body.itemId },
        },
        purchaseOrderLine: {
          connect: { id: body.purchaseOrderLineId },
        },
      },
      include: {
        item: true,
        purchaseOrderLine: true,
      },
    });

    // Update purchase order line received quantity
    const poLine = await db.purchaseOrderLine.findUnique({
      where: { id: body.purchaseOrderLineId },
      select: { receivedQuantity: true, quantity: true },
    });

    if (poLine) {
      // Calculate new received quantity
      const newReceivedQty =
        (poLine.receivedQuantity || 0) + body.receivedQuantity;

      // Update the purchase order line
      await db.purchaseOrderLine.update({
        where: { id: body.purchaseOrderLineId },
        data: { receivedQuantity: newReceivedQty },
      });
    }

    // Update inventory
    const inventory = await db.inventory.findFirst({
      where: {
        itemId: body.itemId,
        locationId: goodsReceipt.locationId,
      },
    });

    if (inventory) {
      // Update existing inventory
      await db.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: inventory.quantity + body.receivedQuantity,
        },
      });
    } else {
      // Create new inventory record
      await db.inventory.create({
        data: {
          quantity: body.receivedQuantity,
          reservedQuantity: 0,
          item: {
            connect: { id: body.itemId },
          },
          location: {
            connect: { id: goodsReceipt.locationId },
          },
          organization: {
            connect: { id: goodsReceipt.organizationId },
          },
        },
      });
    }

    return NextResponse.json({
      message: "Line item added successfully",
      data: newLine,
    });
  } catch (error) {
    console.error("Error adding goods receipt line:", error);
    return NextResponse.json(
      { error: "Failed to add goods receipt line" },
      { status: 500 }
    );
  }
}
