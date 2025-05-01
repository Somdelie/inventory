import {
  createSupplier,
  deleteSupplier,
  getSuppliersByOrganizationId,
  updateSupplier,
} from "@/actions/suppliers";
import { Supplier, SupplierDTO } from "@/types/types";

// Centralized API object for all supplier-related server actions
export const supplierAPI = {
  // Fetch all suppliers
  getAllSuppliers: async (organizationId: string) => {
    const response = await getSuppliersByOrganizationId(organizationId);
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch suppliers");
    }
    return response;
  },

  // Create a new supplier
  create: async (data: SupplierDTO, organizationId: string) => {
    const response = await createSupplier({
      ...data,
      organizationId, // Ensure organizationId is set
    });

    if (response?.status === 200) {
      return response.data;
    } else {
      throw new Error(response?.message || "Failed to create supplier");
    }
  },

  // Update an existing supplier with the correct type
  update: async (id: string, data: Supplier) => {
    // Make sure ID is present and matches the parameter
    const supplierData: Supplier = {
      ...data,
      id, // Ensure ID matches the parameter
    };

    const response = await updateSupplier(supplierData, id);
    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to update supplier");
    }
    return response.data;
  },

  // Delete a supplier
  delete: async (id: string) => {
    const response = await deleteSupplier(id);
    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to delete supplier");
    }
    return response.data;
  },
};
