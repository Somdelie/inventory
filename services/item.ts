import {
  createItem,
  deleteItem,
  getItemsByOrganizationId,
  updateItem,
} from "@/actions/item";
import { ItemCreateDTO, ItemUpdateDTO } from "@/types/itemTypes";

// Centralized API object for all product-related server actions
export const itemAPI = {
  // Fetch all products
  getAllItems: async (organizationId: string) => {
    const response = await getItemsByOrganizationId(organizationId);
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch products");
    }
    return response;
  },

  // Create a new product
  create: async (data: ItemCreateDTO, organizationId: string) => {
    const response = await createItem(data, organizationId);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to create product");
    }
  },

  // Update an existing product
  update: async (id: string, data: ItemUpdateDTO) => {
    const response = await updateItem(data, id); // Pass parameters in this order to match implementation
    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to update product");
    }
    return response.data;
  },
  // Delete a product
  delete: async (id: string) => {
    const response = await deleteItem(id);
    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to delete product");
    }
    return response.data;
  },
};
