import { locationAPI } from "@/services/location";
import { LocationDTO, LocationProps } from "@/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  listsLocations: (organizationId: string) =>
    [...locationKeys.lists(), { organizationId }] as const,
  listsActiveLocations: (organizationId: string) =>
    [...locationKeys.lists(), "active", { organizationId }] as const,
  list: (filters: any) => [...locationKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...locationKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...locationKeys.all, "detail"] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

interface CreateLocationOptions {
  onSuccess?: () => void;
}

// Use Suspense query to fetch locations for a specific organization
export function useOrgLocations(organizationId: string) {
  const { data: locations = [], refetch } = useSuspenseQuery({
    queryKey: locationKeys.listsLocations(organizationId),
    queryFn: () => locationAPI.getAllLocations(organizationId),
  });
  return {
    locations,
    refetch,
  };
}

// Use Suspense query to fetch only active locations for a specific organization
export function useActiveLocations(organizationId: string) {
  const { data: locations = [], refetch } = useSuspenseQuery({
    queryKey: locationKeys.listsActiveLocations(organizationId),
    queryFn: () => locationAPI.getActiveLocations(organizationId),
  });
  return {
    locations,
    refetch,
  };
}

// Create a new location
export function useCreateLocation(
  organizationId: string,
  options: CreateLocationOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LocationProps) =>
      locationAPI.create(data, organizationId),
    onSuccess: (response) => {
      toast.success("Location added successfully", {
        description: "The location has been added to your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific organization's locations query
      queryClient.invalidateQueries({
        queryKey: locationKeys.listsLocations(organizationId),
      });

      // Also invalidate active locations
      queryClient.invalidateQueries({
        queryKey: locationKeys.listsActiveLocations(organizationId),
      });

      // Also invalidate the general lists query
      queryClient.invalidateQueries({
        queryKey: locationKeys.lists(),
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

// Delete a location
export function useLocationDelete(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) => locationAPI.delete(locationId),
    onSuccess: () => {
      toast.success("Location deleted successfully", {
        description: "The location has been removed from your system.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // If we have an id, invalidate specific location queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: locationKeys.detail(id),
        });
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: locationKeys.lists(),
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

// Update a location
export function useLocationUpdate(id: string, organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LocationProps) => {
      return locationAPI.update(id, {
        ...data,
        id,
        organizationId: organizationId || data.organizationId,
      });
    },
    onSuccess: () => {
      toast.success("Location updated successfully", {
        description: "The location information has been updated.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate the specific location's detail query
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(id),
      });

      // Also invalidate the organization's locations list if we have an organizationId
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: locationKeys.listsLocations(organizationId),
        });

        // Also invalidate active locations
        queryClient.invalidateQueries({
          queryKey: locationKeys.listsActiveLocations(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: locationKeys.lists(),
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
