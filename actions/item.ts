"use server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { api } from "@/config/axios";
import type { ItemCreateDTO, ItemDTO, ItemUpdateDTO } from "@/types/itemTypes";

// Function to create new item
export async function createItem(data: ItemCreateDTO, organizationId: string) {
  try {
    // Send the data in the request body
    const response = await api.post(
      `/organizations/${organizationId}/items`,
      data
    );
    console.log("Item created successfully:", response.data);
    revalidatePath("/dashboard/inventory/items");
    return {
      status: 200,
      message: "Item created successfully",
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error creating item:", error);

    // Check if it's a 400 error with a response body
    if (error.response?.status === 400) {
      // Extract the error message from the response
      const errorMessage =
        error.response.data?.error || "Failed to create item";

      return {
        status: 400,
        message: errorMessage,
        data: null,
      };
    }

    // Handle other errors
    return {
      status: error.response?.status || 500,
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create item",
      data: null,
    };
  }
}

// function to update item by id
export async function updateItem(data: ItemUpdateDTO, id: string) {
  try {
    // Extract the id from the data object if it's there, otherwise use the id parameter
    const itemId = id || data.id;

    // Remove id from data to avoid Prisma errors since id is in the where clause
    const { id: _, ...updateData } = data;

    console.log(data.organizationId, "data.organizationId");
    console.log(itemId, "itemId");
    console.log(updateData, "updateData");

    // Now make the API request with the correct organizationId
    const response = await api.put(
      `/organizations/items/${itemId}`,
      updateData
    );

    console.log("Item updated successfully:", response.data);
    revalidatePath("/dashboard/inventory/items");

    return {
      status: 200,
      message: "Item updated successfully",
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error updating item:", error);

    // Better error handling with proper error information
    return {
      status: error.response?.status || 500,
      message:
        error.response?.data?.error || error.message || "Failed to update item",
      data: null,
    };
  }
}

// function to get items by organization id using axios
export async function getItemsByOrganizationId(
  organizationId: string,
  params = {}
): Promise<ItemDTO[]> {
  try {
    const response = await api.get(`/organizations/${organizationId}/items`, {
      params,
    });

    // console.log("Items fetched successfully:", response.data);
    // Return the items array directly from the nested data property
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    return []; // Return an empty array in case of error
  }
}

// function to delete item by id
export async function deleteItem(id: string) {
  try {
    const item = await db.item.delete({
      where: {
        id,
      },
    });
    return {
      status: 200,
      message: "Item deleted successfully",
      data: item,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
