import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
  toggleCustomerStatus,
} from "@/actions/customers";
import { CustomerDTO } from "@/types/customer";

// Helper function to convert null to undefined for API compatibility
const cleanCustomerData = (data: CustomerDTO) => ({
  name: data.name,
  email: data.email || undefined,
  phone: data.phone || undefined,
  address: data.address || undefined,
  taxId: data.taxId || undefined,
  notes: data.notes || undefined,
});

// Helper function to transform database response to CustomerDTO
const transformCustomerFromDB = (customer: any): CustomerDTO => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  taxId: customer.taxId,
  notes: customer.notes,
  isActive: customer.isActive,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
  organizationId: customer.organizationId,
});

// Centralized API object for all customer-related server actions
export const customerAPI = {
  // Fetch all customers
  getAllCustomers: async (organizationId: string) => {
    const response = await listCustomers(organizationId);
    if (response?.success) {
      // Transform the database response to match CustomerDTO
      return response?.customers?.map(transformCustomerFromDB);
    } else {
      throw new Error(response?.error || "Failed to fetch customers");
    }
  },

  // Create a new customer
  create: async (data: CustomerDTO, organizationId: string) => {
    // Transform CustomerDTO to match createCustomer expected format
    const createData = {
      ...cleanCustomerData(data),
      organizationId,
    };

    const response = await createCustomer(createData);

    if (response?.success) {
      return transformCustomerFromDB(response.customer);
    } else {
      throw new Error(response?.error || "Failed to create customer");
    }
  },

  // Update an existing customer with the correct type
  update: async (id: string, data: CustomerDTO) => {
    // Transform CustomerDTO to the format expected by updateCustomer
    const updateData = {
      ...cleanCustomerData(data),
      isActive: data.isActive,
      updatedAt: new Date(),
    };

    const response = await updateCustomer(id, updateData);
    if (response?.success) {
      return transformCustomerFromDB(response.customer);
    } else {
      throw new Error(response?.error || "Failed to update customer");
    }
  },

  // Toggle customer status (optimized for status changes)
  toggleStatus: async (id: string, isActive: boolean) => {
    const response = await toggleCustomerStatus(id, isActive);
    if (response?.success) {
      return transformCustomerFromDB(response.customer);
    } else {
      throw new Error(response?.error || "Failed to toggle customer status");
    }
  },

  // Delete a customer
  delete: async (id: string) => {
    const response = await deleteCustomer(id);
    if (response?.success) {
      return response;
    } else {
      throw new Error(response?.error || "Failed to delete customer");
    }
  },
};
