"use server";
import { api } from "@/config/axios";
import { db } from "@/prisma/db";
import { BrandDTO } from "@/types/types";

export async function createBrand(data: BrandDTO) {
  console.log(data, "this is the data");
  try {
    // Check if the brand already exists
    const existingBrand = await db.brand.findFirst({
      where: {
        name: data.name,
      },
    });
    if (existingBrand) {
      return {
        status: 400,
        error: "Brand already exists",
      };
    }
    const brand = await db.brand.create({
      data,
    });
    return {
      status: 200,
      message: "Brand created successfully",
      data: brand,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getBrandsByOrganizationId(id: string) {
  try {
    const organizationId = id;
    console.log("Fetching brands for organization ID:", organizationId);

    const response = await api.get(`/organizations/${organizationId}/brands`);

    // Check if the response has a data property (for pagination case)
    if (response.data && response.data.data) {
      return response.data.data || [];
    }

    // For non-paginated case, the brands are directly in response.data
    return response.data || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return []; // Return empty array instead of null
  }
}

// delete brand
export async function deleteBrand(id: string) {
  try {
    const brand = await db.brand.delete({
      where: {
        id,
      },
    });
    return {
      status: 200,
      message: "Brand deleted successfully",
      data: brand,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
