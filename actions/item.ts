"use server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { api } from "@/config/axios";
import type { Item, ItemCreateDTO } from "@/types/itemTypes";
import { getAPIKey } from "./api-keys";
import { getAuthenticatedUser } from "@/config/useAuth";

// Function to create new item
export async function createItem(data: ItemCreateDTO, organizationId: string) {
  try {
    // Send the data in the request body
    const response = await api.post(
      `/organizations/${organizationId}/items`,
      data
    );
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
// Updated updateItem function to handle API errors better
export async function updateItem(data: Item, id: string) {
  try {
    // Extract the id from the data object if it's there, otherwise use the id parameter
    const itemId = id || data.id;

    // Remove id from data to avoid Prisma errors since id is in the where clause
    const { id: _, ...updateData } = data;

    // Now make the API request with the correct organizationId
    const response = await api.put(
      `/organizations/items/${itemId}`,
      updateData
    );
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
        error.response?.data?.error ||
        (error.message && error.message.includes("imageUrls")
          ? "Error updating item: Image URLs format is invalid"
          : error.message || "Failed to update item"),
      data: null,
    };
  }
}

// function to get items by organization id using axios
export async function getItemsByOrganizationId(
  organizationId: string,
  params = {}
): Promise<Item[]> {
  try {
    const apiKey = await getAPIKey(organizationId);
    if (!apiKey) {
      console.error("API key not found for organization:", organizationId);
      return []; // Return an empty array if API key is not found
    }
    const response = await api.get(`/organizations/${organizationId}/items`, {
      params,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${apiKey?.data?.key}`,
      },
    });
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

// function to get item by id
export async function getItemById(id: string) {
  const user = await getAuthenticatedUser();
  try {
    const organizationId = user?.organizationId;
    const apiKey = await getAPIKey(organizationId!);
    if (!apiKey) {
      console.error("API key not found for organization:", organizationId);
      return { data: null, success: false, error: "API key not found" };
    }
    const response = await api.get(`/organizations/items/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${apiKey?.data?.key}`,
      },
    });
    // Return the response data
    return response.data;
  } catch (error) {
    console.error("Error fetching item:", error);
    return { data: null, success: false, error: "Failed to fetch item" };
  }
}
