"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { generateStockNumber } from "@/lib/transfers/generateStockNumber";
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

      const stockNumber = await generateStockNumber("TRANSFER");
      // 7. Create inventory movement record for audit trail (optional)
      await tx.stockMovement.create({
        data: {
          itemId,
          stockNumber,
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

export async function getStockTransfers() {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    console.error("Organization ID not found");
    return [];
  }

  try {
    const transfers = await db.stockMovement.findMany({
      where: {
        organizationId: user.organizationId,
        type: "TRANSFER",
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
        fromLocation: {
          select: {
            name: true,
          },
        },
        toLocation: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched stock transfers:", transfers);

    return transfers;
  } catch (error) {
    console.error("Error fetching stock transfers:", error);
    return [];
  }
}

// delete stock transfer
export async function deleteStockTransfer(transferId: string) {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    console.error("Organization ID not found");
    return {
      success: false,
      error: "Unauthorized: Organization ID not found",
    };
  }

  try {
    // Check if the transfer exists
    const transfer = await db.stockMovement.findUnique({
      where: {
        id: transferId,
        organizationId: user.organizationId,
      },
    });

    if (!transfer) {
      return {
        success: false,
        error: "Transfer not found",
      };
    }

    // Delete the transfer
    await db.stockMovement.delete({
      where: {
        id: transferId,
      },
    });

    revalidatePath("/dashboard/inventory/stock");

    return {
      success: true,
      message: "Stock transfer deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting stock transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// delete all stock transfers
export async function deleteAllStockTransfers() {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    console.error("Organization ID not found");
    return {
      success: false,
      error: "Unauthorized: Organization ID not found",
    };
  }

  try {
    // Delete all transfers for the organization
    await db.stockMovement.deleteMany({
      where: {
        organizationId: user.organizationId,
      },
    });

    revalidatePath("/dashboard/inventory/stock");

    return {
      success: true,
      message: "All stock transfers deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting all stock transfers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Function to get a specific stock transfer by ID
export async function getStockTransferById(transferId: string) {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    console.error("Organization ID not found");
    return null;
  }

  try {
    const transfer = await db.stockMovement.findUnique({
      where: {
        id: transferId,
        organizationId: user.organizationId,
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
        fromLocation: {
          select: {
            name: true,
          },
        },
        toLocation: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return transfer;
  } catch (error) {
    console.error("Error fetching stock transfer by ID:", error);
    return null;
  }
}

// Add these functions to your existing actions file

// Function to approve a stock transfer
export async function approveStockTransfer(transferId: string) {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    return {
      success: false,
      error: "Unauthorized: Organization ID not found",
    };
  }

  try {
    // Check if the transfer exists and belongs to the organization
    const transfer = await db.stockMovement.findUnique({
      where: {
        id: transferId,
        organizationId: user.organizationId,
      },
    });

    if (!transfer) {
      return {
        success: false,
        error: "Transfer not found or access denied",
      };
    }

    // Check if the transfer is in CREATED status
    if (transfer.status !== "CREATED") {
      return {
        success: false,
        error: "Transfer can only be approved when in CREATED status",
      };
    }

    // Update the transfer status to APPROVED
    await db.stockMovement.update({
      where: {
        id: transferId,
      },
      data: {
        status: "APPROVED",
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/inventory/stock/${transferId}`);
    revalidatePath("/dashboard/inventory/stock");

    return {
      success: true,
      message: "Transfer approved successfully",
    };
  } catch (error) {
    console.error("Error approving stock transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Function to set transfer to IN_TRANSIT status
export async function setTransferInTransit(transferId: string) {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    return {
      success: false,
      error: "Unauthorized: Organization ID not found",
    };
  }

  try {
    // Check if the transfer exists and belongs to the organization
    const transfer = await db.stockMovement.findUnique({
      where: {
        id: transferId,
        organizationId: user.organizationId,
      },
    });

    if (!transfer) {
      return {
        success: false,
        error: "Transfer not found or access denied",
      };
    }

    // Check if the transfer is in APPROVED status
    if (transfer.status !== "APPROVED") {
      return {
        success: false,
        error: "Transfer can only be set to in-transit when approved",
      };
    }

    // Update the transfer status to IN_TRANSIT
    await db.stockMovement.update({
      where: {
        id: transferId,
      },
      data: {
        status: "IN_TRANSIT",
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/inventory/stock/${transferId}`);
    revalidatePath("/dashboard/inventory/stock");

    return {
      success: true,
      message: "Transfer set to in-transit successfully",
    };
  } catch (error) {
    console.error("Error setting transfer to in-transit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Function to complete a stock transfer
export async function completeStockTransfer(transferId: string) {
  const user = await getAuthenticatedUser();

  if (!user?.organizationId) {
    return {
      success: false,
      error: "Unauthorized: Organization ID not found",
    };
  }

  try {
    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Get the transfer details
      const transfer = await tx.stockMovement.findUnique({
        where: {
          id: transferId,
          organizationId: user.organizationId!,
        },
        include: {
          item: true,
        },
      });

      if (!transfer) {
        throw new Error("Transfer not found or access denied");
      }

      // Check if the transfer can be completed (should be IN_TRANSIT or APPROVED)
      if (!["APPROVED", "IN_TRANSIT"].includes(transfer.status)) {
        throw new Error(
          "Transfer can only be completed when approved or in-transit"
        );
      }

      // If transfer is still in APPROVED status, move it to IN_TRANSIT first, then COMPLETED
      // This handles cases where we want to complete directly from APPROVED
      const targetStatus = "COMPLETED";

      // Perform the actual inventory movement if not already done
      if (transfer.fromLocationId && transfer.toLocationId) {
        // Find the source location inventory
        const fromInventory = await tx.inventory.findFirst({
          where: {
            itemId: transfer.itemId,
            locationId: transfer.fromLocationId,
          },
        });

        if (!fromInventory) {
          throw new Error("Source location inventory not found");
        }

        // Check if there's enough available stock
        const availableQuantity =
          fromInventory.quantity - fromInventory.reservedQuantity;
        if (availableQuantity < transfer.quantity) {
          throw new Error(
            `Insufficient stock. Available: ${availableQuantity}, Requested: ${transfer.quantity}`
          );
        }

        // Update the source location (reduce quantity)
        await tx.inventory.update({
          where: {
            id: fromInventory.id,
          },
          data: {
            quantity: fromInventory.quantity - transfer.quantity,
          },
        });

        // Find or create destination location inventory
        const toInventory = await tx.inventory.findFirst({
          where: {
            itemId: transfer.itemId,
            locationId: transfer.toLocationId,
          },
        });

        if (toInventory) {
          // Update existing inventory
          await tx.inventory.update({
            where: {
              id: toInventory.id,
            },
            data: {
              quantity: toInventory.quantity + transfer.quantity,
            },
          });
        } else {
          // Create new inventory record
          await tx.inventory.create({
            data: {
              organizationId: user.organizationId!,
              itemId: transfer.itemId,
              locationId: transfer.toLocationId,
              quantity: transfer.quantity,
              reservedQuantity: 0,
            },
          });
        }
      }

      // Update the transfer status to COMPLETED
      await tx.stockMovement.update({
        where: {
          id: transferId,
        },
        data: {
          status: targetStatus,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Transfer completed successfully",
      };
    });

    revalidatePath(`/dashboard/inventory/stock/${transferId}`);
    revalidatePath("/dashboard/inventory/stock");
    revalidatePath("/dashboard/inventory");

    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error("Error completing stock transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
