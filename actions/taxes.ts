"use server";
import { TaxFormProps } from "@/components/Forms/settings/TaxForm";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Function to create a new tax rate
export async function createTax(data: TaxFormProps) {
  try {
    // Check if the tax rate already exists
    const existingTax = await db.taxRate.findFirst({
      where: {
        name: data.name,
        organizationId: data.organizationId,
      },
    });

    if (existingTax) {
      return {
        status: 400,
        error: "Tax rate already exists",
      };
    }

    const newTax = await db.taxRate.create({
      data,
    });
    revalidatePath("/dashboard/settings/tax-rates");
    return {
      status: 200,
      message: "Tax rate created successfully",
      data: newTax,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Something went wrong",
    };
  }
}

// fuction to get taxes by organization id
export async function getTaxesByOrganizationId(organizationId: string) {
  try {
    const taxes = await db.taxRate.findMany({
      where: {
        organizationId,
      },
    });
    return taxes;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// function to delete tax by id
export async function deleteTax(id: string) {
  try {
    const tax = await db.taxRate.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/settings/tax-rates");
    return {
      status: 200,
      message: "Tax rate deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Something went wrong",
    };
  }
}
