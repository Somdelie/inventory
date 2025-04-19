"use server";

import { api } from "@/config/axios";
import { db } from "@/prisma/db";
import { CategoryDTO } from "@/types/types";
import { revalidatePath } from "next/cache";

//create a new category
export async function createCategory(data: CategoryDTO) {
  try {
    // Check if the brand already exists
    const existingCategory = await db.category.findFirst({
      where: {
        slug: data.slug,
      },
    });
    if (existingCategory) {
      return {
        status: 400,
        message: "Category already exists",
        data: null,
        error: "",
      };
    }
    const category = await db.category.create({
      data,
    });
    revalidatePath("/dashboard/categories");
    return {
      status: 200,
      message: "Category created successfully",
      data: category,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// get categories by organization id
export async function getCategoriesByOrganizationId(organizationId: string) {
  try {
    const response = await api.get(
      `/organizations/${organizationId}/categories`
    );

    // Return the categories array directly from the nested data property
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// delete category by id
export async function deleteCategory(id: string) {
  try {
    const category = await db.category.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/categories");
    return {
      status: 200,
      message: "Category deleted successfully",
      data: category,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
// update category by id
export async function updateCategory(id: string, data: CategoryDTO) {
  try {
    const category = await db.category.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/categories");
    return {
      status: 200,
      message: "Category updated successfully",
      data: category,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
