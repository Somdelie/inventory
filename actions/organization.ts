"use server";

import { adminPermissions } from "@/config/permissions";
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
          where: {
            roleName: "admin",
            organizationId: newOrganization.id,
          },
        });

        if (!adminRole) {
          adminRole = await tx.role.create({
            data: {
              displayName: "Admin",
              roleName: "admin",
              description: "Administrator with full permissions",
              permissions: adminPermissions, // Use the comprehensive admin permissions
              organizationId: newOrganization.id, // Important: link role to organization
            },
          });
        }

        // Create default user and service provider roles
        await tx.role.create({
          data: {
            displayName: "User",
            roleName: "user",
            description: "Regular user with limited permissions",
            permissions: [
              "dashboard.read",
              "profile.read",
              "profile.update",
              "products.read",
              "orders.read",
              "orders.create",
              "taxes.read",
              "categories.read",
              "customers.read",
              "inventory.read",
              "suppliers.read",
              "locations.read",
              "serial numbers.read",
            ],
            organizationId: newOrganization.id,
          },
        });

        await tx.role.create({
          data: {
            displayName: "Service Provider",
            roleName: "service_provider",
            description:
              "Service provider with inventory management permissions",
            permissions: [
              "dashboard.read",
              "profile.read",
              "profile.update",
              "products.read",
              "products.create",
              "products.update",
              "inventory.read",
              "inventory.update",
              "purchase orders.read",
              "purchase orders.create",
              "goods receipts.read",
              "goods receipts.create",
              "transfers.read",
              "transfers.create",
              "adjustments.read",
              "adjustments.create",
              "suppliers.read",
              "locations.read",
              "serial numbers.read",
              "serial numbers.create",
              "serial numbers.update",
            ],
            organizationId: newOrganization.id,
          },
        });

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
  try {
    const response = await db.organization.findMany({
      include: {
        users: true,
        locations: true,
      },
    });
    return {
      error: null,
      status: 200,
      data: response,
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return {
      error: "Failed to fetch organizations",
      status: 500,
      data: null,
    };
  }
}

export async function getOrganizationById(id: string) {
  try {
    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        users: true,
        locations: true,
      },
    });

    if (!organization) {
      return {
        error: "Organization not found",
        status: 404,
        data: null,
      };
    }

    return {
      error: null,
      status: 200,
      data: organization,
    };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return {
      error: "Failed to fetch organization details",
      status: 500,
      data: null,
    };
  }
}

export async function updateOrganization(
  id: string,
  data: Partial<OrganizationProps>
) {
  try {
    // Check if organization exists
    const existingOrg = await db.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return {
        error: "Organization not found",
        status: 404,
        data: null,
      };
    }

    // If name is being updated, generate a new slug
    let updateData: any = { ...data };
    if (data.name && data.name !== existingOrg.name) {
      updateData.slug = generateSlug(data.name);

      // Check if the new slug already exists
      const slugExists = await db.organization.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists && slugExists.id !== id) {
        return {
          error: `Organization with name ${data.name} already exists`,
          status: 409,
          data: null,
        };
      }
    }

    const updatedOrganization = await db.organization.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/dashboard/organizations/${id}`);
    revalidatePath("/dashboard/organizations");

    return {
      error: null,
      status: 200,
      data: updatedOrganization,
    };
  } catch (error) {
    console.error("Error updating organization:", error);
    return {
      error: "Failed to update organization",
      status: 500,
      data: null,
    };
  }
}

export async function deleteOrganization(id: string) {
  try {
    await db.organization.delete({
      where: { id },
    });

    revalidatePath("/dashboard/organizations");

    return {
      error: null,
      status: 200,
      data: null,
    };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return {
      error: "Failed to delete organization",
      status: 500,
      data: null,
    };
  }
}
