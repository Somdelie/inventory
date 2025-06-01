"use server";
import { revalidatePath } from "next/cache";
import {
  AdjustmentType,
  AdjustmentStatus,
  StockMovementType,
  StockMovementStatus,
} from "@prisma/client";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";

// Types for the adjustment operations
export interface AdjustmentLineInput {
  itemId: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  notes?: string;
  serialNumbers?: string[];
}

export interface CreateAdjustmentInput {
  locationId: string;
  adjustmentType: AdjustmentType;
  reason: string;
  notes?: string;
  lines: AdjustmentLineInput[];
  organizationId: string;
  createdBy: string;
}

export interface UpdateInventoryInput {
  itemId: string;
  locationId: string;
  newQuantity: number;
  organizationId: string;
}

// Generate unique adjustment number
async function generateAdjustmentNumber(
  organizationId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const lastAdjustment = await db.adjustment.findFirst({
    where: {
      organizationId,
      adjustmentNumber: {
        startsWith: `ADJ-${year}`,
      },
    },
    orderBy: {
      adjustmentNumber: "desc",
    },
  });

  let nextNumber = 1;
  if (lastAdjustment) {
    const lastNumber = parseInt(lastAdjustment.adjustmentNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  return `ADJ-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

// Generate unique stock number for stock movements
async function generateStockNumber(): Promise<string> {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `STK-${timestamp}-${random}`;
}

// Get all adjustments for an organization
export async function getStockAdjustments(page = 1, limit = 10) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }
  const organizationId = user.organizationId;
  try {
    const skip = (page - 1) * limit;

    const [adjustments, total] = await Promise.all([
      db.adjustment.findMany({
        where: organizationId ? { organizationId } : {},
        include: {
          location: true,
          createdByUser: {
            select: {
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              name: true,
              email: true,
            },
          },
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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.adjustment.count({
        where: organizationId ? { organizationId } : {},
      }),
    ]);

    return {
      success: true,
      data: {
        adjustments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    return { success: false, error: "Failed to fetch adjustments" };
  }
}

// Get adjustment by ID
export async function getStockAdjustmentById(adjustmentId: string) {
  try {
    const adjustment = await db.adjustment.findUnique({
      where: { id: adjustmentId },
      include: {
        location: true,
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
              },
            },
          },
        },
      },
    });

    if (!adjustment) {
      return { success: false, error: "Adjustment not found" };
    }

    return { success: true, data: adjustment };
  } catch (error) {
    console.error("Error fetching stock adjustment:", error);
    return { success: false, error: "Failed to fetch adjustment" };
  }
}

// Cancel stock adjustment
export async function cancelStockAdjustment(adjustmentId: string) {
  try {
    const adjustment = await db.adjustment.findUnique({
      where: { id: adjustmentId },
    });

    if (!adjustment) {
      return { success: false, error: "Adjustment not found" };
    }

    if (adjustment.status !== AdjustmentStatus.DRAFT) {
      return {
        success: false,
        error: "Only draft adjustments can be canceled",
      };
    }

    const updatedAdjustment = await db.adjustment.update({
      where: { id: adjustmentId },
      data: {
        status: AdjustmentStatus.CANCELED,
      },
    });

    revalidatePath("/dashboard/inventory/adjustments");
    return { success: true, data: updatedAdjustment };
  } catch (error) {
    console.error("Error canceling stock adjustment:", error);
    return { success: false, error: "Failed to cancel adjustment" };
  }
}

// Get items with current stock for a location
export async function getItemsForAdjustment(
  organizationId: string,
  locationId: string
) {
  try {
    const items = await db.item.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        inventories: {
          where: {
            locationId,
          },
        },
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

    const itemsWithStock = items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      costPrice: item.costPrice,
      categoryName: item.category?.title || "Uncategorized",
      brandName: item.brand?.name || "No Brand",
      currentStock: item.inventories[0]?.quantity || 0,
      reservedQuantity: item.inventories[0]?.reservedQuantity || 0,
    }));

    return { success: true, data: itemsWithStock };
  } catch (error) {
    console.error("Error fetching items for adjustment:", error);
    return { success: false, error: "Failed to fetch items" };
  }
}

// Get locations for organization
export async function getLocations(organizationId: string) {
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

    return { success: true, data: locations };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { success: false, error: "Failed to fetch locations" };
  }
}

export async function createStockAdjustment(data: CreateAdjustmentInput) {
  try {
    const adjustmentNumber = await generateAdjustmentNumber(
      data.organizationId
    );

    const result = await db.$transaction(async (tx) => {
      // Create the adjustment in DRAFT status
      const adjustment = await tx.adjustment.create({
        data: {
          adjustmentNumber,
          date: new Date(),
          adjustmentType: data.adjustmentType,
          reason: data.reason,
          notes: data.notes,
          status: AdjustmentStatus.DRAFT, // Keep as DRAFT - don't auto-complete
          locationId: data.locationId,
          organizationId: data.organizationId,
          createdBy: data.createdBy,
          lines: {
            create: data.lines.map((line) => ({
              beforeQuantity: line.beforeQuantity,
              afterQuantity: line.afterQuantity,
              adjustmentQuantity: line.adjustmentQuantity,
              notes: line.notes,
              serialNumbers: line.serialNumbers || [],
              itemId: line.itemId,
            })),
          },
        },
        include: {
          lines: {
            include: {
              item: true,
            },
          },
          location: true,
          createdByUser: true,
        },
      });

      // DON'T update inventory or create stock movements yet
      // This will happen only when the adjustment is approved

      return adjustment;
    });

    revalidatePath("/dashboard/inventory/adjustments");
    return {
      success: true,
      data: result,
      message: "Stock adjustment created successfully. Pending approval.",
    };
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create adjustment",
    };
  }
}

// The approveStockAdjustment function should handle the inventory updates
export async function approveStockAdjustment(
  adjustmentId: string,
  approvedById: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get the adjustment with its lines
      const adjustment = await tx.adjustment.findUnique({
        where: { id: adjustmentId },
        include: {
          lines: {
            include: {
              item: true,
            },
          },
          location: true,
        },
      });

      if (!adjustment) {
        throw new Error("Adjustment not found");
      }

      if (adjustment.status !== AdjustmentStatus.DRAFT) {
        throw new Error("Only draft adjustments can be approved");
      }

      // Update adjustment status to APPROVED first
      await tx.adjustment.update({
        where: { id: adjustmentId },
        data: {
          status: AdjustmentStatus.APPROVED,
          approvedById,
        },
      });

      // NOW update inventory levels and create stock movements
      for (const line of adjustment.lines) {
        // Find existing inventory record first
        const existingInventory = await tx.inventory.findFirst({
          where: {
            itemId: line.itemId,
            locationId: adjustment.locationId,
            organizationId: adjustment.organizationId,
          },
        });

        if (existingInventory) {
          // Update existing inventory
          await tx.inventory.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity: line.afterQuantity,
            },
          });
        } else {
          // Create new inventory record
          await tx.inventory.create({
            data: {
              itemId: line.itemId,
              locationId: adjustment.locationId,
              organizationId: adjustment.organizationId,
              quantity: line.afterQuantity,
              reservedQuantity: 0,
            },
          });
        }

        // Create stock movement record
        const stockNumber = await generateStockNumber();
        await tx.stockMovement.create({
          data: {
            stockNumber,
            quantity: line.adjustmentQuantity,
            type: StockMovementType.ADJUSTMENT,
            status: StockMovementStatus.COMPLETED,
            reason: adjustment.reason,
            referenceId: adjustment.id,
            referenceType: "ADJUSTMENT",
            notes: `Stock adjustment: ${adjustment.adjustmentNumber} - ${
              line.notes || ""
            }`,
            itemId: line.itemId,
            toLocationId: adjustment.locationId,
            userId: approvedById,
            organizationId: adjustment.organizationId,
            unitCost: line.item.costPrice,
            totalValue: line.adjustmentQuantity * line.item.costPrice,
          },
        });

        // Update item total quantity across all locations
        const totalQuantity = await tx.inventory.aggregate({
          where: {
            itemId: line.itemId,
            organizationId: adjustment.organizationId,
          },
          _sum: {
            quantity: true,
          },
        });

        await tx.item.update({
          where: { id: line.itemId },
          data: {
            quantity: totalQuantity._sum.quantity || 0,
          },
        });
      }

      // Mark adjustment as completed after all inventory updates
      const updatedAdjustment = await tx.adjustment.update({
        where: { id: adjustmentId },
        data: {
          status: AdjustmentStatus.COMPLETED,
        },
        include: {
          lines: {
            include: {
              item: true,
            },
          },
          location: true,
          createdByUser: true,
          approvedBy: true,
        },
      });

      return updatedAdjustment;
    });

    revalidatePath("/dashboard/inventory/adjustments");
    revalidatePath("/dashboard/inventory");
    return {
      success: true,
      data: result,
      message: "Adjustment approved and inventory updated successfully",
    };
  } catch (error) {
    console.error("Error approving stock adjustment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve adjustment",
    };
  }
}

// Also add a debug function to help troubleshoot
export async function debugStockAdjustment(data: CreateAdjustmentInput) {
  console.log("=== STOCK ADJUSTMENT DEBUG ===");
  console.log("Adjustment Type:", data.adjustmentType);
  console.log("Location ID:", data.locationId);
  console.log("Organization ID:", data.organizationId);

  data.lines.forEach((line, index) => {
    console.log(`\nLine ${index + 1}:`);
    console.log("  Item ID:", line.itemId);
    console.log("  Before Quantity:", line.beforeQuantity);
    console.log("  After Quantity:", line.afterQuantity);
    console.log("  Adjustment Quantity:", line.adjustmentQuantity);
    console.log("  Notes:", line.notes);

    // Validate the logic
    const expectedAdjustment = line.afterQuantity - line.beforeQuantity;
    if (expectedAdjustment !== line.adjustmentQuantity) {
      console.log(
        "  ❌ MISMATCH! Expected:",
        expectedAdjustment,
        "Got:",
        line.adjustmentQuantity
      );
    } else {
      console.log("  ✅ Calculation correct");
    }
  });

  console.log("=== END DEBUG ===");

  // Call the actual function
  return createStockAdjustment(data);
}

// Helper function to recalculate item quantities (useful for data consistency)
export async function recalculateItemQuantities(organizationId: string) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get all items for the organization
      const items = await tx.item.findMany({
        where: { organizationId },
        select: { id: true },
      });

      // Update each item's total quantity
      const updatePromises = items.map(async (item) => {
        const totalQuantity = await tx.inventory.aggregate({
          where: {
            itemId: item.id,
            organizationId,
          },
          _sum: {
            quantity: true,
          },
        });

        return tx.item.update({
          where: { id: item.id },
          data: {
            quantity: totalQuantity._sum.quantity || 0,
          },
        });
      });

      await Promise.all(updatePromises);

      return { updatedCount: items.length };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error recalculating item quantities:", error);
    return { success: false, error: "Failed to recalculate item quantities" };
  }
}
