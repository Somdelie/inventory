// @/actions/sales-orders.ts
"use server";

import { db } from "@/prisma/db";
import { Prisma } from "@prisma/client";

// Create a new sales order
export async function createSalesOrder(data: {
  customerId: string;
  organizationId: string;
  locationId?: string;
  createdBy: string;
  source: "POS" | "SALES_ORDER";
  notes?: string;
  lines: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }>;
}) {
  try {
    // Generate order number
    const orderCount = await db.salesOrder.count({
      where: { organizationId: data.organizationId },
    });
    const orderNumber = `SO-${String(orderCount + 1).padStart(6, "0")}`;

    // Calculate totals
    let subtotal = 0;
    let totalTaxAmount = 0;

    const orderLines = data.lines.map((line) => {
      const lineSubtotal = line.quantity * line.unitPrice;
      const lineDiscount = line.discount || 0;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTaxAmount = lineAfterDiscount * ((line.taxRate || 0) / 100);
      const lineTotalPrice = lineAfterDiscount + lineTaxAmount;

      subtotal += lineAfterDiscount;
      totalTaxAmount += lineTaxAmount;

      return {
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate || 0,
        taxAmount: lineTaxAmount,
        discount: line.discount || 0,
        totalPrice: lineTotalPrice,
      };
    });

    const totalAmount = subtotal + totalTaxAmount;

    const salesOrder = await db.salesOrder.create({
      data: {
        orderNumber,
        date: new Date(),
        status: "DRAFT",
        subtotal,
        taxAmount: totalTaxAmount,
        totalAmount,
        notes: data.notes,
        source: data.source,
        customerId: data.customerId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        lines: {
          create: orderLines,
        },
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: true, salesOrder };
  } catch (error) {
    console.error("Error creating sales order:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

// Get items for order creation
export async function getItemsForOrder(organizationId: string) {
  try {
    const items = await db.item.findMany({
      where: {
        organizationId,
        isActive: true,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        sellingPrice: true,
        costPrice: true,
        quantity: true,
        tax: true,
        category: {
          select: {
            title: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, items };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      success: false,
      error: (error as Error).message,
      items: [],
    };
  }
}

// Get locations for the organization
export async function getLocationsForOrder(organizationId: string) {
  try {
    const locations = await db.location.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, locations };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      success: false,
      error: (error as Error).message,
      locations: [],
    };
  }
}
