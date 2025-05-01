import { supplierAPI } from "@/services/supplier";
import { Supplier, SupplierDTO } from "@/types/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  listsSuppliers: (organizationId: string) =>
    [...supplierKeys.lists(), { organizationId }] as const,
  list: (filters: any) => [...supplierKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...supplierKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

interface CreateSupplierOptions {
  onSuccess?: () => void;
}

// Fetch all suppliers for an organization
export function useOrganizationSuppliers() {
  const {
    data: suppliers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: () => supplierAPI.getAllSuppliers,
  });

  return {
    suppliers,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Use Suspense query to fetch suppliers for a specific organization
export function useOrgSuppliers(organizationId: string) {
  const { data: suppliers = [], refetch } = useSuspenseQuery({
    queryKey: supplierKeys.listsSuppliers(organizationId),
    queryFn: () => supplierAPI.getAllSuppliers(organizationId),
  });
  return {
    suppliers,
    refetch,
  };
}

// Create a new supplier
export function useCreateSupplier(
  organizationId: string,
  options: CreateSupplierOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SupplierDTO) => supplierAPI.create(data, organizationId),
    onSuccess: (response) => {
      toast.success("Supplier added successfully", {
        description: "The supplier has been added to your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific organization's suppliers query
      queryClient.invalidateQueries({
        queryKey: supplierKeys.listsSuppliers(organizationId),
      });

      // Also invalidate the general lists query
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });

      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });
}

// Delete a supplier
export function useSupplierDelete(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplierId: string) => supplierAPI.delete(supplierId),
    onSuccess: () => {
      toast.success("Supplier deleted successfully", {
        description: "The supplier has been removed from your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // If we have an id, invalidate specific supplier queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: supplierKeys.detail(id),
        });
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });
}

// Update a supplier - Fixed with proper type handling
export function useSupplierUpdate(id: string, organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SupplierDTO) => {
      // Create a valid Supplier object from the DTO
      // Ensuring all required fields are present
      const supplier: Supplier = {
        id: id, // Use the ID from the hook parameter
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        taxId: data.taxId ?? null,
        paymentTerms: data.paymentTerms ?? null,
        notes: data.notes ?? null,
        // Use the organization ID from the hook parameter if available, otherwise from the data
        organizationId: organizationId || data.organizationId,
        isActive: data.isActive ?? true,
        // Required fields in Supplier type
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
      };

      return supplierAPI.update(id, supplier);
    },
    onSuccess: () => {
      toast.success("Supplier updated successfully", {
        description: "The supplier information has been updated.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific supplier's detail query
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(id),
      });

      // Also invalidate the organization's suppliers list if we have an organizationId
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: supplierKeys.listsSuppliers(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: supplierKeys.lists(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });
}
