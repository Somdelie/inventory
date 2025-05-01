import {
  createLocation,
  deleteLocation,
  getLocationsByOrganizationId,
  updateLocation,
  getActiveLocationsByOrganizationId,
} from "@/actions/location";
import { LocationDTO, LocationProps } from "@/types";

// Centralized API object for all location-related server actions
export const locationAPI = {
  // Fetch all locations for an organization
  getAllLocations: async (organizationId: string) => {
    const response = await getLocationsByOrganizationId(organizationId);
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch locations");
    }
    return response;
  },

  // Fetch only active locations for an organization
  getActiveLocations: async (organizationId: string) => {
    const response = await getActiveLocationsByOrganizationId(organizationId);
    if (!Array.isArray(response)) {
      throw new Error("Failed to fetch active locations");
    }
    return response;
  },

  // Create a new location
  create: async (data: LocationProps, organizationId: string) => {
    const response = await createLocation({
      ...data,
      organizationId, // Ensure organizationId is set
    });

    if (response?.status === 200) {
      return response.data;
    } else {
      throw new Error(
        response?.error || response?.message || "Failed to create location"
      );
    }
  },

  // Update an existing location
  update: async (id: string, data: LocationProps) => {
    // Make sure data is properly structured for update
    const locationData: LocationProps = {
      ...data,
      id, // Ensure ID matches the parameter
    };

    const response = await updateLocation(locationData, id);
    if (response?.status !== 200) {
      throw new Error(
        response?.error || response?.message || "Failed to update location"
      );
    }
    return response.data;
  },

  // Delete a location
  delete: async (id: string) => {
    const response = await deleteLocation(id);
    if (response?.status !== 200) {
      throw new Error(response?.message || "Failed to delete location");
    }
    return response.data;
  },
};
