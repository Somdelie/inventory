"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { CreatePurchaseOrderInput } from "@/types/purchase-order";
import { PurchaseOrderStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createPurchaseOrder(data: CreatePurchaseOrderInput) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }

    // Create the purchase order with its line items using a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the purchase order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber: data.poNumber,
          date: data.date,
          supplierName: data.supplierName,
          supplierEmail: data.supplierEmail,
          supplierPhone: data.supplierPhone,
          status: PurchaseOrderStatus.DRAFT,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingCost: data.shippingCost,
          discount: data.discount,
          totalAmount: data.totalAmount,
          notes: data.notes || null,
          paymentTerms: data.paymentTerms || null,
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod || null,

          // Connect to supplier if supplierId is provided
          ...(data.supplierId
            ? {
                supplier: {
                  connect: { id: data.supplierId },
                },
              }
            : {}),

          // Connect to location if locationId is provided
          ...(data.locationId
            ? {
                Location: {
                  connect: { id: data.locationId },
                },
              }
            : {}),

          // Connect to delivery location if deliveryLocationId is provided
          ...(data.deliveryLocationId
            ? {
                deliveryLocation: {
                  connect: { id: data.deliveryLocationId },
                },
              }
            : {}),

          // Connect to organization and created by user
          organization: {
            connect: { id: organizationId },
          },
          createdBy: {
            connect: { id: user.id },
          },

          // Create purchase order lines
          lines: {
            create: data.lines.map((line) => ({
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate || 0,
              taxAmount: line.taxAmount || 0,
              discount: line.discount || null,
              totalPrice: line.totalPrice,
              notes: line.notes || null,
              item: {
                connect: { id: line.itemId },
              },
            })),
          },
        },
        include: {
          supplier: true,
          Location: true,
          deliveryLocation: true,
          lines: {
            include: {
              item: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      revalidatePath("/dashboard/purchases/orders");
      return purchaseOrder;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getPurchaseOrders() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId: organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: true,
        Location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return purchaseOrders;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return []; // Return an empty array in case of error
  }
}

export async function getPurchaseOrderNumber(organizationId: string) {
  try {
    const purchaseOrderCount = await db.purchaseOrder.count({
      where: {
        organizationId: organizationId,
      },
    });
    return purchaseOrderCount;
  } catch (error) {
    console.error("Error fetching purchase order count:", error);
    return 0; // Return 0 in case of error
  }
}

// Get purchase order count for an organization (used for generating PO numbers)
export async function getPurchaseOrderCount(organizationId: string) {
  try {
    const purchaseOrderCount = await db.purchaseOrder.count({
      where: {
        organizationId: organizationId,
      },
    });
    return purchaseOrderCount;
  } catch (error) {
    console.error("Error fetching purchase order count:", error);
    return 0; // Return 0 in case of error
  }
}

export async function getPurchaseOrderById(id: string) {
  try {
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: {
        id: id,
      },
      include: {
        supplier: true,
        Location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return purchaseOrder;
  } catch (error) {
    console.error("Error fetching purchase order by ID:", error);
    return null; // Return null in case of error
  }
}

export async function getItemsBySupplier(supplierId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }

    // Find all items that have a relationship with this supplier through ItemSupplier
    const items = await db.item.findMany({
      where: {
        organizationId,
        isActive: true,
        supplierRelations: {
          some: {
            supplierId,
          },
        },
      },
      include: {
        supplierRelations: {
          where: {
            supplierId,
          },
        },
        category: true,
        unit: true,
        brand: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Map the items to include supplier-specific pricing
    return items.map((item) => {
      const supplierRelation = item.supplierRelations[0];

      return {
        ...item,
        // Use supplier-specific cost if available, otherwise fall back to item's default cost
        costPrice: supplierRelation?.unitCost ?? item.costPrice,
      };
    });
  } catch (error) {
    console.error("Error fetching items for supplier:", error);
    return [];
  }
}

// delete purchase order by id
export async function deletePurchaseOrder(id: string) {
  try {
    const purchaseOrder = await db.purchaseOrder.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/purchases/orders");
    return {
      status: 200,
      message: "Purchase order deleted successfully",
      data: purchaseOrder,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
