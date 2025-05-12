// app/api/confirm-purchase-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

/**
 * API route handler for confirming a purchase order
 */
export async function POST(req: NextRequest) {
  try {
    const { purchaseOrderId, token, deliveryDate, additionalNotes } =
      await req.json();

    // Check if the token is valid and not expired, with related purchaseOrder included
    const confirmationToken = await db.confirmationToken.findFirst({
      where: {
        token,
        purchaseOrderId,
        expiresAt: {
          gt: new Date(), // Make sure it hasn't expired
        },
        usedAt: null, // Make sure it hasn't been used already
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
      },
    });

    if (!confirmationToken) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 400 }
      );
    }

    // Get the supplier ID from the purchase order
    const supplierId =
      confirmationToken.purchaseOrder.supplierId ||
      confirmationToken.purchaseOrder.supplier?.id;

    if (!supplierId) {
      console.warn("No supplier ID found for purchase order:", purchaseOrderId);
    }

    // Update the purchase order
    await db.purchaseOrder.update({
      where: {
        id: purchaseOrderId,
      },
      data: {
        status: "APPROVED",
        expectedDeliveryDate: new Date(deliveryDate),
        notes: additionalNotes
          ? `${
              confirmationToken.purchaseOrder.notes || ""
            }\n\nSupplier Notes: ${additionalNotes}`
          : confirmationToken.purchaseOrder.notes,
        ...(supplierId
          ? {
              approvedBy: {
                connect: {
                  id: supplierId,
                },
              },
            }
          : {}),
      },
    });

    // Mark the token as used
    await db.confirmationToken.update({
      where: {
        id: confirmationToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Create activity log entry
    // await db.activity.create({
    //   data: {
    //     action: "PURCHASE_ORDER_CONFIRMED",
    //     description: `Purchase order ${confirmationToken.purchaseOrder.poNumber} confirmed by supplier`,
    //     entityId: purchaseOrderId,
    //     entityType: "PURCHASE_ORDER",
    //     organizationId: confirmationToken.purchaseOrder.organizationId || "",
    //   },
    // });

    // Revalidate relevant pages
    revalidatePath(`/dashboard/purchases/orders/${purchaseOrderId}`);
    revalidatePath("/dashboard/purchases/orders");

    // Return success
    return NextResponse.json({
      success: true,
      message: "Purchase order confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming purchase order:", error);
    return NextResponse.json(
      { error: "Failed to confirm purchase order" },
      { status: 500 }
    );
  }
}

/**
 * API route handler for validating a confirmation token without confirming the order
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const purchaseOrderId = url.searchParams.get("id");

    if (!token || !purchaseOrderId) {
      return NextResponse.json(
        { error: "Missing token or purchase order ID" },
        { status: 400 }
      );
    }

    // Check if the token is valid and not expired
    const confirmationToken = await db.confirmationToken.findFirst({
      where: {
        token,
        purchaseOrderId,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            lines: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    if (!confirmationToken) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid or expired confirmation token",
        },
        { status: 200 } // Return 200 with valid:false instead of error status
      );
    }

    // Return the purchase order data
    return NextResponse.json({
      valid: true,
      purchaseOrder: {
        id: confirmationToken.purchaseOrder.id,
        poNumber: confirmationToken.purchaseOrder.poNumber,
        date: confirmationToken.purchaseOrder.date,
        expectedDeliveryDate:
          confirmationToken.purchaseOrder.expectedDeliveryDate,
        status: confirmationToken.purchaseOrder.status,
        subtotal: confirmationToken.purchaseOrder.subtotal,
        taxAmount: confirmationToken.purchaseOrder.taxAmount,
        total: confirmationToken.purchaseOrder.totalAmount,
        notes: confirmationToken.purchaseOrder.notes,
        paymentTerms: confirmationToken.purchaseOrder.paymentTerms,
        supplierName:
          confirmationToken.purchaseOrder.supplierName ||
          confirmationToken.purchaseOrder.supplier?.name,
        items: confirmationToken.purchaseOrder.lines.map((line) => ({
          name: line.item?.name || "Unknown Item",
          sku: line.item?.sku,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          total: line.totalPrice,
        })),
      },
    });
  } catch (error) {
    console.error("Error validating confirmation token:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate confirmation token" },
      { status: 500 }
    );
  }
}
