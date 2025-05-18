import { getPurchaseOrderLineItems } from "@/actions/purchase-orders";
import { purchaseOrderAPI } from "@/services/purchaseOrderAPI";
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "@/types/purchase-order";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const purchaseOrderKeys = {
  all: ["purchaseOrders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  listsPurchaseOrders: (organizationId: string) =>
    [...purchaseOrderKeys.lists(), { organizationId }] as const,
  listsActivePurchaseOrders: (organizationId: string) =>
    [...purchaseOrderKeys.lists(), "active", { organizationId }] as const,
  list: (filters: any) => [...purchaseOrderKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...purchaseOrderKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...purchaseOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

interface CreatePurchaseOrderOptions {
  onSuccess?: () => void;
}

// Use Suspense query to fetch purchase orders for a specific organization
export function useOrgPurchaseOrders(organizationId: string) {
  const { data: purchaseOrders = [], refetch } = useSuspenseQuery({
    queryKey: purchaseOrderKeys.listsPurchaseOrders(organizationId),
    queryFn: () => purchaseOrderAPI.getAllPurchaseOrders(),
  });
  return {
    purchaseOrders,
    refetch,
  };
}

// Use Suspense query to fetch all purchase orders items
export function usePurchaseOrderLineItems(purchaseOrderId: string) {
  const {
    data: lines = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: purchaseOrderKeys.detail(purchaseOrderId),
    queryFn: () => getPurchaseOrderLineItems(purchaseOrderId),
  });
  return {
    lines,
    refetch,
    isLoading,
  };
}

// Use Suspense query to fetch only active purchase orders for a specific organization
// export function useActivePurchaseOrders(organizationId: string) {
//   const { data: purchaseOrders = [], refetch } = useSuspenseQuery({
//     queryKey: purchaseOrderKeys.listsActivePurchaseOrders(organizationId),
//     queryFn: () => purchaseOrderAPI.getActivePurchaseOrders(organizationId),
//   });
//   return {
//     purchaseOrders,
//     refetch,
//   };
// }

// Fetch a specific purchase order by ID
export function usePurchaseOrderDetails(id: string) {
  const {
    data: purchaseOrder,
    isLoading,
    error,
  } = useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => purchaseOrderAPI.getById(id),
    enabled: !!id,
  });

  return {
    purchaseOrder,
    isLoading,
    error,
  };
}

// Create a new purchase order
export function useCreatePurchaseOrder(
  options: CreatePurchaseOrderOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderInput) =>
      purchaseOrderAPI.create(data),
    onSuccess: (response, variables) => {
      toast.success("Purchase order created successfully", {
        description: "The purchase order has been added to your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Get the organizationId from the variables
      const organizationId = variables.locationId.split("-")[0]; // Assuming locationId format includes org ID

      // Invalidate relevant queries
      if (organizationId) {
        // Invalidate the specific organization's purchase orders query
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.listsPurchaseOrders(organizationId),
        });

        // Also invalidate active purchase orders
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.listsActivePurchaseOrders(organizationId),
        });
      }

      // Also invalidate the general lists query
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.lists(),
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

// Delete a purchase order
export function usePurchaseOrderDelete(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseOrderId: string) =>
      purchaseOrderAPI.delete(purchaseOrderId),
    onSuccess: () => {
      toast.success("Purchase order deleted successfully", {
        description: "The purchase order has been removed from your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // If we have an id, invalidate specific purchase order queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.detail(id),
        });
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.lists(),
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

// Update a purchase order
export function usePurchaseOrderUpdate(id: string, organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePurchaseOrderInput) => {
      return purchaseOrderAPI.update(id, {
        ...data,
        id,
      });
    },
    onSuccess: () => {
      toast.success("Purchase order updated successfully", {
        description: "The purchase order information has been updated.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific purchase order's detail query
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(id),
      });

      // Also invalidate the organization's purchase orders list if we have an organizationId
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.listsPurchaseOrders(organizationId),
        });

        // Also invalidate active purchase orders
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.listsActivePurchaseOrders(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: purchaseOrderKeys.lists(),
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
