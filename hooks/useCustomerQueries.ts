import { customerAPI } from "@/services/customerAPI";
import { CustomerDTO } from "@/types/customer";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  listsCustomers: (organizationId: string) =>
    [...customerKeys.lists(), { organizationId }] as const,
  list: (filters: any) => [...customerKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...customerKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

interface CreateCustomerOptions {
  onSuccess?: () => void;
}

// Fetch all customers for an organization
export function useOrganizationCustomers() {
  const {
    data: customers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => customerAPI.getAllCustomers,
  });

  return {
    customers,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Use Suspense query to fetch customers for a specific organization
export function useOrgCustomers(organizationId: string) {
  const { data: customers = [], refetch } = useSuspenseQuery({
    queryKey: customerKeys.listsCustomers(organizationId),
    queryFn: () => customerAPI.getAllCustomers(organizationId),
  });
  return {
    customers,
    refetch,
  };
}

// Create a new customer
export function useCreateCustomer(
  organizationId: string,
  options: CreateCustomerOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerDTO) => customerAPI.create(data, organizationId),
    onSuccess: (response) => {
      toast.success("Customer added successfully", {
        description: "The customer has been added to your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific organization's customers query
      queryClient.invalidateQueries({
        queryKey: customerKeys.listsCustomers(organizationId),
      });

      // Also invalidate the general lists query
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
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

// Delete a customer
export function useCustomerDelete(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => customerAPI.delete(customerId),
    onSuccess: () => {
      toast.success("Customer deleted successfully", {
        description: "The customer has been removed from your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // If we have an id, invalidate specific customer queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: customerKeys.detail(id),
        });
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
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

// Toggle customer status - optimized for quick status changes
export function useCustomerStatusToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      customerAPI.toggleStatus(id, isActive),
    onSuccess: (data, variables) => {
      toast.success(
        `Customer ${variables.isActive ? "activated" : "deactivated"}`,
        {
          description: `Customer status has been updated successfully.`,
          style: {
            backgroundColor: "green",
            color: "#fff",
          },
        }
      );

      // Invalidate all customer queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update status", {
        description: error.message,
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });
}
export function useCustomerUpdate(id: string, organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerDTO) => {
      // Ensure we have a valid ID
      if (!id) {
        throw new Error("Customer ID is required for update");
      }

      return customerAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success("Customer updated successfully", {
        description: "The customer information has been updated.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific customer's detail query
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(id),
      });

      // Also invalidate the organization's customers list if we have an organizationId
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: customerKeys.listsCustomers(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
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
