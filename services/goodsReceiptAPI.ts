import {
  createGoodsReceipt,
  deleteGoodsReceipt,
  getGoodsReceiptById,
  getGoodsReceipts,
  getGoodsReceiptCount,
  updateGoodsReceiptStatus,
} from "@/actions/goods-receipts";
import { GoodsReceiptStatus } from "@prisma/client";

// Types for the API
export interface GoodsReceiptCreateDTO {
  receiptNumber: string;
  date: Date;
  purchaseOrderId: string;
  locationId: string;
  organizationId: string;
  receivedById: string;
  notes?: string;
  status?: GoodsReceiptStatus;
  lines: {
    itemId: string;
    purchaseOrderLineId: string;
    receivedQuantity: number;
    notes?: string;
  }[];
}

export interface GoodsReceiptUpdateStatusDTO {
  status: GoodsReceiptStatus;
}

// Centralized API object for all goods receipt-related server actions
export const goodsReceiptAPI = {
  // Fetch all goods receipts
  getAllGoodsReceipts: async (organizationId?: string) => {
    const response = await getGoodsReceipts(organizationId);
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch goods receipts");
    }
    return response;
  },

  // Get goods receipt count
  getCount: async (organizationId: string) => {
    const response = await getGoodsReceiptCount(organizationId);
    return response;
  },

  // Get a specific goods receipt
  getById: async (id: string) => {
    const response = await getGoodsReceiptById(id);
    if (!response) {
      throw new Error("Goods receipt not found");
    }
    return response;
  },

  // Create a new goods receipt
  create: async (data: GoodsReceiptCreateDTO) => {
    const response = await createGoodsReceipt(data);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to create goods receipt");
    }
  },

  // Update goods receipt status
  updateStatus: async (id: string, data: GoodsReceiptUpdateStatusDTO) => {
    const response = await updateGoodsReceiptStatus(id, data.status);
    if (response?.status !== 200) {
      throw new Error(
        response?.message || "Failed to update goods receipt status"
      );
    }
    return response.data;
  },

  // Delete a goods receipt
  delete: async (id: string) => {
    const response = await deleteGoodsReceipt(id);
    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to delete goods receipt");
    }
    return response;
  },

  // Get goods receipt line items
  getLines: async (receiptId: string) => {
    try {
      const response = await fetch(
        `/api/v1/organizations/goods-receipts/${receiptId}/lines`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch goods receipt lines: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Add a line item to a goods receipt
  addLine: async (
    receiptId: string,
    data: {
      itemId: string;
      purchaseOrderLineId: string;
      receivedQuantity: number;
      notes?: string;
    }
  ) => {
    try {
      const response = await fetch(`/api/goods-receipts/${receiptId}/lines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to add line item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
};
