"use server";

import { UnitFormProps } from "@/components/Forms/inventory/UnitForm";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function createUnit(data: UnitFormProps) {
  console.log(data, "this is the data from the form");
  try {
    // Check if the unit already exists
    const existingUnit = await db.unit.findFirst({
      where: {
        title: data.title,
      },
    });

    if (existingUnit) {
      return {
        status: 400,
        error: "Unit already exists",
      };
    }

    const newUnit = await db.unit.create({
      data,
    });
    revalidatePath("/dashboard/inventory/units");
    return {
      status: 200,
      message: "Unit created successfully",
      data: newUnit,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Something went wrong",
    };
  }
}

//update unit
export async function updateUnit(id: string, data: UnitFormProps) {
  try {
    const unit = await db.unit.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/units");
    return {
      status: 200,
      message: "Unit updated successfully",
      data: unit,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

//gets all the units in the organization
export async function getUnitsByOrganizationId(organizationId: string) {
  try {
    const units = await db.unit.findMany({
      where: {
        organizationId,
      },
    });
    return units;
  } catch (error) {
    console.log(error);
    return null;
  }
}

//delete unit
export async function deleteUnit(id: string) {
  try {
    const unit = await db.unit.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/inventory/units");
    return {
      status: 200,
      message: "Unit deleted successfully",
      data: unit,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
