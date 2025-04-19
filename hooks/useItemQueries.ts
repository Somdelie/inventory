import { itemAPI } from "@/services/item";
import { ItemCreateDTO, ItemUpdateDTO } from "@/types/itemTypes";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  listsItems: (organizationId: string) =>
    [...itemKeys.lists(), { organizationId }] as const,
  list: (filters: any) => [...itemKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...itemKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

interface CreateItemOptions {
  onSuccess?: () => void;
}

// Fix the useOrganizationItems hook to properly fetch items
export function useOrganizationItems() {
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: itemKeys.lists(),
    queryFn: () => itemAPI.getAllItems,
    // This was missing the actual function call
  });

  return {
    items,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Fix the useOrgItems hook to properly handle loading states
export function useOrgItems(organizationId: string) {
  // Get all items for a specific organization
  const { data: items = [], refetch } = useSuspenseQuery({
    queryKey: itemKeys.listsItems(organizationId),
    queryFn: () => itemAPI.getAllItems(organizationId),
  });
  return {
    items,
    refetch,
  };
}

// Fix the useCreateItem hook to properly invalidate queries
export function useCreateItem(
  organizationId: string,
  options: CreateItemOptions = {}
) {
  const queryClient = useQueryClient();

  // Create a new item
  return useMutation({
    mutationFn: (data: ItemCreateDTO) => itemAPI.create(data, organizationId),
    onSuccess: () => {
      toast.success("Item added successfully", {
        description: "The item has been added to your inventory.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });
      // Invalidate the specific organization's items query
      queryClient.invalidateQueries({
        queryKey: itemKeys.listsItems(organizationId),
      });
      // Also invalidate the general lists query
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
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

// useItemDelete hook to delete an item
export function useItemDelete(id?: string) {
  // Make id optional
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemAPI.delete(itemId), // Accept ID from mutate() call
    onSuccess: () => {
      toast.success("Item deleted successfully", {
        description: "The item has been removed from your inventory.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // If we have an id, invalidate specific item queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.detail(id),
        });
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
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

// useItem hook to update an item
export function useItemUpdate(id: string, organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ItemUpdateDTO) => {
      // Make sure to include organizationId in the update data
      const updateData = {
        ...data,
        organizationId: organizationId || data.organizationId,
      };
      return itemAPI.update(id, updateData);
    },
    onSuccess: () => {
      toast.success("Item updated successfully", {
        description: "The item has been updated in your inventory.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific item's detail query
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(id),
      });

      // Also invalidate the organization's items list if we have an organizationId
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.listsItems(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists(),
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
