"use server";

import { generateSlug } from "@/lib/generateSlug";
import { db } from "@/prisma/db";
import { OrganizationProps } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function createOrganization(
  data: OrganizationProps,
  userId?: string
) {
  try {
    const slug = generateSlug(data.name);

    const existingOrganization = await db.organization.findUnique({
      where: { slug },
    });

    if (existingOrganization) {
      return {
        error: `Organization with name ${data.name} already exists`,
        status: 409,
        data: null,
      };
    }

    // Create the organization and make the user admin if userId is provided
    if (userId) {
      // Use a transaction to ensure both operations succeed or fail together
      return await db.$transaction(async (tx) => {
        // Create the organization
        const newOrganization = await tx.organization.create({
          data: {
            ...data,
            slug,
          },
        });

        // Find or create admin role
        let adminRole = await tx.role.findFirst({
          where: { roleName: "admin" },
        });

        if (!adminRole) {
          adminRole = await tx.role.create({
            data: {
              displayName: "Admin",
              roleName: "admin",
              description: "Administrator with full permissions",
              permissions: [
                "dashboard.read",
                "profile.read",
                "profile.update",
                "users.read",
                "users.create",
                "users.update",
                "users.delete",
                "organizations.read",
                "organizations.update",
                "organizations.delete",
                "orders.read",
                "orders.create",
                "orders.update",
                "orders.delete",
              ],
            },
          });
        }

        // Update the user to connect them to the organization and assign admin role
        await tx.user.update({
          where: { id: userId },
          data: {
            organizationId: newOrganization.id,
            roles: {
              connect: {
                id: adminRole.id,
              },
            },
          },
        });

        console.log(
          "Organization created successfully and user assigned as admin"
        );
        revalidatePath("/register");

        return {
          error: null,
          status: 200,
          data: newOrganization,
        };
      });
    } else {
      // Just create the organization without assigning an admin
      const response = await db.organization.create({
        data: {
          ...data,
          slug,
        },
      });

      console.log("Organization created successfully:", response);
      revalidatePath("/register");
      return {
        error: null,
        status: 200,
        data: response,
      };
    }
  } catch (error) {
    console.error("Error creating organization:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}

export async function getAllOrganizations() {
  const response = await db.organization.findMany();
  return response;
}
