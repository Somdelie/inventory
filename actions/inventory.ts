"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId;
  if (!organizationId) {
    console.error("Organization ID not found");
    return [];
  }
  try {
    const items = await db.item.findMany({
      where: {
        organizationId,
      },
      include: {
        category: {
          select: {
            title: true,
          },
        },
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });

    console.log("Fetched items:", items);

    return items;
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
}

// Alternative function if you want to get items and then their inventory separately
export async function getInventoryItemsAlternative() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId;
  if (!organizationId) {
    console.error("Organization ID not found");
    return [];
  }

  try {
    const items = await db.item.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // For each item, get its inventory across all locations
    const itemsWithInventory = await Promise.all(
      items.map(async (item) => {
        const inventory = await db.inventory.findMany({
          where: {
            itemId: item.id,
            organizationId,
          },
          include: {
            location: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        return {
          id: item.id,
          name: item.name,
          sku: item.sku || "",
          description: item.description || undefined,
          imageUrl: item.imageUrls?.[0] || undefined,
          category: item.category?.title || "Uncategorized",
          unitOfMeasure: item.unitOfMeasure || "EA",
          inventory: inventory.map((inv) => ({
            locationId: inv.locationId,
            locationName: inv.location.name,
            quantity: inv.quantity,
            reservedQuantity: inv.reservedQuantity || 0,
          })),
        };
      })
    );

    return itemsWithInventory;
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
}

export async function transferInventory({
  itemId,
  fromLocationId,
  toLocationId,
  quantity,
}: {
  itemId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
}) {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    return {
      success: false,
      error: "Unauthorized: Organization ID not found",
    };
  }

  if (quantity <= 0) {
    return {
      success: false,
      error: "Quantity must be greater than 0",
    };
  }

  try {
    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // 1. Verify the item belongs to the user's organization
      const item = await tx.item.findFirst({
        where: {
          id: itemId,
          organizationId: user.organizationId,
        },
        include: {
          inventories: true,
        },
      });

      if (!item) {
        throw new Error("Item not found or access denied");
      }

      // 2. Find the source location inventory
      const fromInventory = await tx.inventory.findFirst({
        where: {
          itemId,
          locationId: fromLocationId,
        },
      });

      if (!fromInventory) {
        throw new Error("Source location inventory not found");
      }

      // 3. Check if there's enough available stock (considering reserved quantity)
      const availableQuantity =
        fromInventory.quantity - fromInventory.reservedQuantity;
      if (availableQuantity < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}`
        );
      }

      // 4. Verify locations exist and belong to the organization
      const [fromLocation, toLocation] = await Promise.all([
        tx.location.findFirst({
          where: { id: fromLocationId, organizationId: user.organizationId },
        }),
        tx.location.findFirst({
          where: { id: toLocationId, organizationId: user.organizationId },
        }),
      ]);

      if (!fromLocation || !toLocation) {
        throw new Error("One or both locations not found or access denied");
      }

      // 5. Update the source location (reduce quantity)
      await tx.inventory.update({
        where: {
          id: fromInventory.id,
        },
        data: {
          quantity: fromInventory.quantity - quantity,
        },
      });

      // 6. Find or create destination location inventory
      const toInventory = await tx.inventory.findFirst({
        where: {
          itemId,
          locationId: toLocationId,
        },
      });

      if (toInventory) {
        // Update existing inventory
        await tx.inventory.update({
          where: {
            id: toInventory.id,
          },
          data: {
            quantity: toInventory.quantity + quantity,
          },
        });
      } else {
        // Create new inventory record
        await tx.inventory.create({
          data: {
            organizationId: user.organizationId!,
            itemId,
            locationId: toLocationId,
            quantity,
            reservedQuantity: 0,
          },
        });
      }

      // 7. Create inventory movement record for audit trail (optional)
      await tx.stockMovement.create({
        data: {
          itemId,
          fromLocationId,
          toLocationId,
          quantity,
          type: "TRANSFER",
          reason: "Stock Transfer",
          organizationId: user.organizationId!,
          userId: user.id, // Add the userId property
        },
      });

      revalidatePath("/dashboard/inventory/stock");
      return {
        success: true,
        message: `Successfully transferred ${quantity} units from ${fromLocation.name} to ${toLocation.name}`,
      };
    });

    // Revalidate the inventory page to reflect changes
    revalidatePath("/inventory");

    return result;
  } catch (error) {
    console.error("Error transferring inventory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Optional: Get all locations for the organization
export async function getLocations() {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    console.error("Organization ID not found");
    return [];
  }

  try {
    const locations = await db.location.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}
