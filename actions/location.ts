"use server";
import { api } from "@/config/axios";
import { db } from "@/prisma/db";
import { LocationDTO, LocationProps } from "@/types";
import { revalidatePath } from "next/cache";
import { getAPIKey } from "./api-keys";

export async function createLocation(data: LocationProps) {
  try {
    // Check if the location already exists
    const existingLocation = await db.location.findFirst({
      where: {
        name: data.name,
        organizationId: data.organizationId,
      },
    });
    if (existingLocation) {
      return {
        status: 400,
        error: "Location already exists",
      };
    }

    // Set default values for optional fields to match Prisma schema requirements
    const locationData = {
      ...data,
      isActive: data.isActive ?? true,
      // Ensure dates are properly set
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const location = await db.location.create({
      data: locationData,
    });

    revalidatePath(`/dashboard/inventory/locations`);
    return {
      status: 200,
      message: "Location created successfully",
      data: location,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getLocationsByOrganizationId(
  organizationId: string,
  params = {}
): Promise<LocationDTO[]> {
  try {
    const apiKey = await getAPIKey(organizationId);
    if (!apiKey) {
      console.error("API key not found for organization:", organizationId);
      return []; // Return an empty array if API key is not found
    }
    const response = await api.get(
      `/organizations/${organizationId}/locations`,
      {
        params,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${apiKey?.data?.key}`,
        },
      }
    );
    // Return the items array directly from the nested data property
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return []; // Return an empty array in case of error
  }
}

export async function deleteLocation(id: string) {
  try {
    const location = await db.location.delete({
      where: {
        id,
      },
    });
    return {
      status: 200,
      message: "Location deleted successfully",
      data: location,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateLocation(data: LocationProps, id: string) {
  // console.log("Updating location with data:", data, "and id:", id);
  try {
    // Ensure we have a valid location ID
    const locationId = id || data.id;
    if (!locationId) {
      return {
        status: 400,
        message: "Location ID is required",
        data: null,
        error: "Missing location ID",
      };
    }

    // Ensure required fields are present
    if (!data.name || !data.organizationId || !data.type) {
      return {
        status: 400,
        message: "Name, organization ID, and type are required",
        data: null,
        error: "Missing required fields",
      };
    }

    const response = await api.put(
      `/organizations/locations/${locationId}`,
      data
    );

    revalidatePath("/dashboard/inventory/locations");
    console.log("Location updated successfully:", response.data.data);
    return {
      status: response.status,
      message: response.data?.message || "Location updated successfully",
      data: response.data?.data || null,
      error: null,
    };
  } catch (error: any) {
    console.error("Error updating location:", error);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong while updating the location.";

    return {
      status,
      message,
      data: null,
      error: message,
    };
  }
}

export async function getLocationById(id: string) {
  try {
    // Use the API to get the location by ID through query params
    const response = await api.get(`/organizations/locations/${id}`);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getActiveLocationsByOrganizationId(
  organizationId: string
): Promise<LocationDTO[]> {
  try {
    const locations = await db.location.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Type assertion to ensure compatibility with LocationDTO
    return locations as unknown as LocationDTO[];
  } catch (error) {
    console.error("Error fetching active locations:", error);
    return [];
  }
}
