"use server";

import { db } from "@/prisma/db";
import { GoodsReceiptStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Get all goods receipts
export async function getGoodsReceipts(organizationId?: string) {
  try {
    const receipts = await db.goodsReceipt.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: {
        date: "desc",
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
        location: true,
      },
    });

    // console.log("Fetched Goods Receipts:", receipts);

    return receipts;
  } catch (error) {
    console.error("Error fetching goods receipts:", error);
    return [];
  }
}

// Get goods receipt count
export async function getGoodsReceiptCount(organizationId: string) {
  try {
    const count = await db.goodsReceipt.count({
      where: { organizationId },
    });

    return count;
  } catch (error) {
    console.error("Error counting goods receipts:", error);
    return 0;
  }
}

// Get a specific goods receipt by ID
export async function getGoodsReceiptById(receiptId: string) {
  try {
    const receipt = await db.goodsReceipt.findUnique({
      where: { id: receiptId },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
        location: true,
        lines: {
          include: {
            item: true,
            purchaseOrderLine: true,
          },
        },
      },
    });

    return receipt;
  } catch (error) {
    console.error(`Error fetching goods receipt ${receiptId}:`, error);
    return null;
  }
}

// Create a new goods receipt
export async function createGoodsReceipt(data: {
  receiptNumber: string;
  date: Date;
  purchaseOrderId: string;
  locationId: string;
  organizationId: string;
  receivedById: string;
  notes?: string;
  status?: GoodsReceiptStatus;
  lines: {
    itemId: string;
    purchaseOrderLineId: string;
    receivedQuantity: number;
    notes?: string;
  }[];
}) {
  try {
    // Create the goods receipt
    const goodsReceipt = await db.goodsReceipt.create({
      data: {
        receiptNumber: data.receiptNumber,
        date: data.date,
        status: data.status || GoodsReceiptStatus.PENDING,
        notes: data.notes,
        purchaseOrder: {
          connect: { id: data.purchaseOrderId },
        },
        location: {
          connect: { id: data.locationId },
        },
        organization: {
          connect: { id: data.organizationId },
        },
        receivedBy: {
          connect: { id: data.receivedById },
        },
        lines: {
          create: data.lines.map((line) => ({
            receivedQuantity: line.receivedQuantity,
            notes: line.notes,
            item: {
              connect: { id: line.itemId },
            },
            purchaseOrderLine: {
              connect: { id: line.purchaseOrderLineId },
            },
          })),
        },
      },
    });

    // Update purchase order line received quantities
    for (const line of data.lines) {
      // Get current purchase order line
      const poLine = await db.purchaseOrderLine.findUnique({
        where: { id: line.purchaseOrderLineId },
        select: { receivedQuantity: true, quantity: true },
      });

      if (poLine) {
        // Calculate new received quantity
        const newReceivedQty =
          (poLine.receivedQuantity || 0) + line.receivedQuantity;

        // Update the purchase order line
        await db.purchaseOrderLine.update({
          where: { id: line.purchaseOrderLineId },
          data: { receivedQuantity: newReceivedQty },
        });
      }
    }

    // Update purchase order status based on receipt
    await updatePurchaseOrderStatus(data.purchaseOrderId);

    // Update inventory quantities
    for (const line of data.lines) {
      // Get current inventory for this item in this location
      const inventory = await db.inventory.findFirst({
        where: {
          itemId: line.itemId,
          locationId: data.locationId,
        },
      });

      if (inventory) {
        // Update existing inventory
        await db.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity + line.receivedQuantity,
          },
        });
      } else {
        // Create new inventory record
        await db.inventory.create({
          data: {
            quantity: line.receivedQuantity,
            reservedQuantity: 0,
            item: {
              connect: { id: line.itemId },
            },
            location: {
              connect: { id: data.locationId },
            },
            organization: {
              connect: { id: data.organizationId },
            },
          },
        });
      }
    }

    revalidatePath("/dashboard/inventory/receipts");
    revalidatePath("/dashboard/purchases/orders");

    return {
      status: 200,
      message: "Goods receipt created successfully",
      data: goodsReceipt,
    };
  } catch (error) {
    console.error("Error creating goods receipt:", error);
    return {
      status: 500,
      message: "Failed to create goods receipt",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Update purchase order status based on receipt
async function updatePurchaseOrderStatus(purchaseOrderId: string) {
  try {
    // Get the purchase order with lines
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        lines: true,
      },
    });

    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }

    // Calculate if all items are fully received
    let allItemsReceived = true;
    let anyItemsReceived = false;

    for (const line of purchaseOrder.lines) {
      if ((line.receivedQuantity || 0) < line.quantity) {
        allItemsReceived = false;
      }

      if ((line.receivedQuantity || 0) > 0) {
        anyItemsReceived = true;
      }
    }

    // Update purchase order status
    let newStatus = purchaseOrder.status;

    if (allItemsReceived) {
      newStatus = "RECEIVED";
    } else if (anyItemsReceived) {
      newStatus = "PARTIALLY_RECEIVED";
    }

    // Update the purchase order
    await db.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: newStatus },
    });

    return true;
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    return false;
  }
}

// Delete a goods receipt
export async function deleteGoodsReceipt(receiptId: string) {
  try {
    // First, get the goods receipt with lines
    const goodsReceipt = await db.goodsReceipt.findUnique({
      where: { id: receiptId },
      include: {
        lines: true,
      },
    });

    if (!goodsReceipt) {
      return {
        status: 404,
        message: "Goods receipt not found",
      };
    }

    // Get the purchase order ID before deleting the receipt
    const purchaseOrderId = goodsReceipt.purchaseOrderId;

    // For each line, update the purchase order line to reduce received quantity
    for (const line of goodsReceipt.lines) {
      // Get current purchase order line
      const poLine = await db.purchaseOrderLine.findUnique({
        where: { id: line.purchaseOrderLineId },
        select: { receivedQuantity: true },
      });

      if (poLine) {
        // Calculate new received quantity
        const newReceivedQty = Math.max(
          0,
          (poLine.receivedQuantity || 0) - line.receivedQuantity
        );

        // Update the purchase order line
        await db.purchaseOrderLine.update({
          where: { id: line.purchaseOrderLineId },
          data: { receivedQuantity: newReceivedQty },
        });
      }

      // Update inventory quantities
      const inventory = await db.inventory.findFirst({
        where: {
          itemId: line.itemId,
          locationId: goodsReceipt.locationId,
        },
      });

      if (inventory) {
        // Update existing inventory (ensure quantity doesn't go negative)
        await db.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: Math.max(0, inventory.quantity - line.receivedQuantity),
          },
        });
      }
    }

    // Delete the goods receipt (cascade will delete lines)
    await db.goodsReceipt.delete({
      where: { id: receiptId },
    });

    // Update purchase order status
    if (purchaseOrderId) {
      await updatePurchaseOrderStatus(purchaseOrderId);
    }

    revalidatePath("/dashboard/inventory/receipts");
    revalidatePath("/dashboard/purchases/orders");

    return {
      status: 200,
      message: "Goods receipt deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting goods receipt:", error);
    return {
      status: 500,
      message: "Failed to delete goods receipt",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Update goods receipt status
export async function updateGoodsReceiptStatus(
  receiptId: string,
  status: GoodsReceiptStatus
) {
  try {
    const updatedReceipt = await db.goodsReceipt.update({
      where: { id: receiptId },
      data: { status },
    });

    revalidatePath("/dashboard/inventory/receipts");

    return {
      status: 200,
      message: "Goods receipt status updated successfully",
      data: updatedReceipt,
    };
  } catch (error) {
    console.error("Error updating goods receipt status:", error);
    return {
      status: 500,
      message: "Failed to update goods receipt status",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
