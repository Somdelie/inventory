"use server";
import { api } from "@/config/axios";
import { db } from "@/prisma/db";
import { Supplier, SupplierDTO } from "@/types/types";
import { revalidatePath } from "next/cache";
import { getAPIKey } from "./api-keys";

export async function createSupplier(data: SupplierDTO) {
  try {
    // Check if the supplier already exists
    const existingSupplier = await db.supplier.findFirst({
      where: {
        name: data.name,
        organizationId: data.organizationId,
      },
    });
    if (existingSupplier) {
      return {
        status: 400,
        error: "Supplier already exists",
      };
    }

    // Set default values for optional fields to match Prisma schema requirements
    const supplierData = {
      ...data,
      isActive: data.isActive ?? true,
      // Ensure dates are proper Date objects
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };

    const supplier = await db.supplier.create({
      data: supplierData,
    });

    revalidatePath(`/dashboard/purchases/suppliers`);
    return {
      status: 200,
      message: "Supplier created successfully",
      data: supplier,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getSuppliersByOrganizationId(
  organizationId: string,
  params = {}
): Promise<SupplierDTO[]> {
  try {
    const apiKey = await getAPIKey(organizationId);
    if (!apiKey) {
      console.error("API key not found for organization:", organizationId);
      return []; // Return an empty array if API key is not found
    }
    const response = await api.get(
      `/organizations/${organizationId}/suppliers`,
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
    console.error("Error fetching items:", error);
    return []; // Return an empty array in case of error
  }
}

export async function deleteSupplier(id: string) {
  try {
    const supplier = await db.supplier.delete({
      where: {
        id,
      },
    });
    return {
      status: 200,
      message: "Supplier deleted successfully",
      data: supplier,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Fixed function to update supplier by id with correct typing
export async function updateSupplier(data: Supplier, id: string) {
  try {
    // Ensure we have a valid supplier ID
    const supplierId = id || data.id;
    if (!supplierId) {
      return {
        status: 400,
        message: "Supplier ID is required",
        data: null,
        error: "Missing supplier ID",
      };
    }

    // Remove id from the update data as it's not needed in the update payload
    // Use type assertion to handle the required fields properly
    const { id: _, ...updateData } = data;

    // Ensure required fields are present
    if (!updateData.name || !updateData.organizationId) {
      return {
        status: 400,
        message: "Name and organization ID are required",
        data: null,
        error: "Missing required fields",
      };
    }

    const response = await api.put(
      `/organizations/purchases/supplier/${supplierId}`,
      updateData
    );

    revalidatePath("/dashboard/purchases/suppliers");
    console.log("Supplier updated successfully:", response.data.data);
    return {
      status: response.status,
      message: response.data?.message || "Supplier updated successfully",
      data: response.data?.data || null,
      error: null,
    };
  } catch (error: any) {
    console.error("Error updating supplier:", error);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong while updating the supplier.";

    return {
      status,
      message,
      data: null,
      error: message,
    };
  }
}
export async function getSupplierById(id: string) {
  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id,
      },
    });
    return supplier;
  } catch (error) {
    console.log(error);
    return null;
  }
}
