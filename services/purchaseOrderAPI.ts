import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderById,
  getPurchaseOrders,
  getPurchaseOrdersItems,
  updatePurchaseOrder,
} from "@/actions/purchase-orders";
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "@/types/purchase-order";

// Centralized API object for all purchase order-related server actions
export const purchaseOrderAPI = {
  // Fetch all purchase orders for an organization
  getAllPurchaseOrders: async () => {
    const response = await getPurchaseOrders();
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch purchase orders");
    }
    return response;
  },
  // Fetch purchase order line items for a specific purchase order
  getPurchaseOrderLineItems: async (purchaseOrderId: string) => {
    const response = await getPurchaseOrdersItems(purchaseOrderId);
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch purchase order line items");
    }
    return response;
  },

  // Fetch only active purchase orders for an organization
  //   getActivePurchaseOrders: async (organizationId: string) => {
  //     const response = await getActivePurchaseOrdersByOrganizationId(
  //       organizationId
  //     );
  //     if (!Array.isArray(response)) {
  //       throw new Error("Failed to fetch active purchase orders");
  //     }
  //     return response;
  //   },

  // Get a specific purchase order by ID
  getById: async (id: string) => {
    const response = await getPurchaseOrderById(id);
    if (!response) {
      throw new Error("Failed to fetch purchase order");
    }
    return response;
  },

  // Create a new purchase order
  create: async (data: CreatePurchaseOrderInput) => {
    const response = await createPurchaseOrder(data);

    if (response?.success) {
      return response.data;
    } else {
      throw new Error(response?.error || "Failed to create purchase order");
    }
  },

  // Update an existing purchase order
  update: async (id: string, data: UpdatePurchaseOrderInput) => {
    // Make sure data includes the ID
    const purchaseOrderData: UpdatePurchaseOrderInput = {
      ...data,
      id, // Ensure ID matches the parameter
    };

    const response = await updatePurchaseOrder(purchaseOrderData);
    if (!response?.success) {
      throw new Error(response?.error || "Failed to update purchase order");
    }
    return response.data;
  },

  // Delete a purchase order
  delete: async (id: string) => {
    const response = await deletePurchaseOrder(id);

    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to delete purchase order");
    }

    return response.data;
  },
};
