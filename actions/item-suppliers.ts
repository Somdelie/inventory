"use server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function addSuppliersToItem(
  itemId: string,
  supplierIds: string[]
) {
  try {
    // Existing suppliers for the item
    const existingSuppliers = await db.itemSupplier.findMany({
      where: {
        itemId,
      },
    });

    // Get IDs of existing suppliers
    const existingSupplierIds = existingSuppliers.map(
      (supplier) => supplier.supplierId
    );

    // Filter out suppliers that are already associated with the item
    const newSupplierIds = supplierIds.filter(
      (id) => !existingSupplierIds.includes(id)
    );

    // If all suppliers already exist, return a message
    if (newSupplierIds.length === 0) {
      return {
        status: 400,
        message: "All selected suppliers are already associated with this item",
      };
    }

    // Create an array of ItemSupplier objects to create
    const itemSuppliers = newSupplierIds.map((supplierId) => ({
      itemId,
      supplierId,
    }));

    // Use createMany to insert multiple records at once
    const createdItemSuppliers = await db.itemSupplier.createMany({
      data: itemSuppliers,
    });

    revalidatePath(`/dashboard/inventory/items/${itemId}/suppliers`);
    revalidatePath("/dashboard/inventory/items");
    return {
      status: 200,
      message: `Successfully added ${newSupplierIds.length} suppliers`,
      data: createdItemSuppliers,
    };
  } catch (error) {
    console.error("Error adding suppliers to item:", error);
    return {
      status: 500,
      message: "An error occurred while adding suppliers",
    };
  }
}

// get item suppliers by item id
export async function getSuppliersByItemId(itemId: string) {
  try {
    const suppliers = await db.itemSupplier.findMany({
      where: {
        itemId,
      },
      include: {
        supplier: true,
      },
    });

    // Transform the data to match the SupplierDTO type
    return suppliers.map((supplier) => ({
      id: supplier.supplier.id,
      supplierId: supplier.supplierId,
      name: supplier.supplier.name,
      // Ensure email is never null - provide default empty string if null
      email: supplier.supplier.email || "",
      // Ensure organizationId is never null
      organizationId: supplier.supplier.organizationId || "",
      isPreferred: supplier.isPreferred,
      supplierSku: supplier.supplierSku || undefined, // Convert null to undefined
      leadTime: supplier.leadTime, // Already nullable
      minOrderQty: supplier.minOrderQty, // Already nullable
      unitCost: supplier.unitCost, // Already nullable
      lastPurchaseDate: supplier.lastPurchaseDate
        ? supplier.lastPurchaseDate.toISOString() // Convert Date to string
        : undefined,
      notes: supplier.notes || undefined, // Convert null to undefined
      createdAt: supplier.createdAt
        ? supplier.createdAt.toISOString() // Convert Date to string
        : undefined,
      updatedAt: supplier.updatedAt
        ? supplier.updatedAt.toISOString() // Convert Date to string
        : undefined,
      isActive: supplier.supplier.isActive, // Add isActive field from the supplier
      phone: supplier.supplier.phone, // Add phone field
      address: supplier.supplier.address, // Add address field
      taxId: supplier.supplier.taxId, // Add taxId field
      paymentTerms: supplier.supplier.paymentTerms, // Add paymentTerms field
    }));
  } catch (error) {
    console.error("Error fetching suppliers by item ID:", error);
    return null;
  }
}

//remove supplier from item
export async function removeSupplierFromItem(
  itemId: string,
  supplierId: string
) {
  try {
    const deletedItemSupplier = await db.itemSupplier.deleteMany({
      where: {
        itemId,
        supplierId,
      },
    });

    revalidatePath(`/dashboard/inventory/items/${itemId}/suppliers`);
    revalidatePath("/dashboard/inventory/items");
    return {
      status: 200,
      message: "Supplier removed successfully",
      data: deletedItemSupplier,
    };
  } catch (error) {
    console.error("Error removing supplier from item:", error);
    return {
      status: 500,
      message: "An error occurred while removing the supplier",
    };
  }
}

// Update an item supplier
export async function updateItemSupplier(supplierId: string, data: any) {
  console.log("Updating item supplier with data:", data);
  console.log("Supplier ID:", supplierId);

  try {
    // Extract the itemId from the data
    const { itemId } = data;

    if (!supplierId || !itemId) {
      return {
        success: false,
        message: "Supplier ID and Item ID are required",
      };
    }

    // Find the ItemSupplier record using both supplierId and itemId
    const itemSupplier = await db.itemSupplier.findFirst({
      where: {
        supplierId: supplierId,
        itemId: itemId,
      },
    });

    console.log("Found ItemSupplier relationship:", itemSupplier);

    if (!itemSupplier) {
      return {
        success: false,
        message: "Supplier association not found for this item",
      };
    }

    // Create a clean data object with only the fields that can be updated
    const updateData = {
      isPreferred:
        data.isPreferred !== undefined
          ? data.isPreferred
          : itemSupplier.isPreferred,
      supplierSku: data.supplierSku,
      leadTime: data.leadTime,
      minOrderQty: data.minOrderQty,
      unitCost: data.unitCost,
      lastPurchaseDate: data.lastPurchaseDate
        ? new Date(data.lastPurchaseDate)
        : null,
      notes: data.notes,
    };

    // Update the ItemSupplier record
    const updatedItemSupplier = await db.itemSupplier.update({
      where: {
        id: itemSupplier.id,
      },
      data: updateData,
    });

    // If a supplier is marked as preferred, update other suppliers for this item to not be preferred
    if (updateData.isPreferred) {
      await db.itemSupplier.updateMany({
        where: {
          itemId: itemId,
          id: {
            not: itemSupplier.id,
          },
        },
        data: {
          isPreferred: false,
        },
      });
    }

    // Revalidate paths to refresh the data
    revalidatePath(`/dashboard/inventory/items/${itemId}/suppliers`);
    revalidatePath("/dashboard/inventory/items");

    return {
      success: true,
      message: "Supplier details updated successfully",
      data: updatedItemSupplier,
    };
  } catch (error) {
    console.error("Error updating item supplier:", error);
    return {
      success: false,
      message: "Failed to update supplier details",
    };
  }
}
