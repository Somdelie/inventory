import { adminPermissions, userPermissions } from "@/config/permissions";
import { db } from "./db";
import bcrypt from "bcryptjs";

// Get current year for password generation
const currentYear = new Date().getFullYear();

async function cleanDatabase() {
  console.log("Cleaning up existing data...");
  try {
    // Use a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // Get all users
      const users = await tx.user.findMany({
        include: {
          roles: true,
        },
      });
      // Disconnect all roles from users
      for (const user of users) {
        if (user.roles.length > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              roles: {
                disconnect: user.roles.map((role) => ({ id: role.id })),
              },
            },
          });
        }
      }

      // Delete all organizations first
      await tx.organization.deleteMany({});

      // Delete all sessions
      await tx.session.deleteMany({});

      // Delete all accounts
      await tx.account.deleteMany({});

      // Delete all Blogs and Blog cats
      await tx.blog.deleteMany({});
      await tx.blogCategory.deleteMany({});

      // Delete all Savings and Categories
      await tx.saving.deleteMany({});
      await tx.category.deleteMany({});

      // Now safely delete all users
      const deleteUsers = await tx.user.deleteMany({});
      console.log("Deleted users:", deleteUsers.count);

      // Finally delete all roles
      const deleteRoles = await tx.role.deleteMany({});
      console.log("Deleted roles:", deleteRoles.count);
    });

    console.log("Database cleanup completed.");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log("Starting to seed new data...");

    // Create organizations
    console.log("Creating organizations...");
    const adminOrg = await db.organization.create({
      data: {
        name: "Developer Organization",
        slug: "developer-org",
        currency: "ZAR",
        timezone: "Africa/Johannesburg",
        fisicalYear: "January-December",
      },
    });

    const userOrg = await db.organization.create({
      data: {
        name: "Regular User Organization",
        slug: "regular-user-org",
        currency: "ZAR",
        timezone: "Africa/Johannesburg",
        fisicalYear: "January-December",
      },
    });

    // Create admin role with all permissions
    console.log("Creating admin role...");
    const adminRole = await db.role.create({
      data: {
        displayName: "Administrator",
        roleName: "admin",
        description: "Full system access",
        permissions: adminPermissions,
        organizationId: adminOrg.id,
      },
    });

    // Create user role with limited permissions
    console.log("Creating user role...");
    const userRole = await db.role.create({
      data: {
        displayName: "User",
        roleName: "user",
        description: "Basic user access",
        permissions: userPermissions,
        organizationId: userOrg.id,
      },
    });

    // Create admin user
    console.log("Creating admin user...");
    const adminPassword = `Admin@${currentYear}`;
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await db.user.create({
      data: {
        email: "admin@cautiousndlovu.co.za",
        name: "System Admin",
        firstName: "System",
        lastName: "Admin",
        phone: "1234567890",
        password: hashedAdminPassword,
        roles: {
          connect: { id: adminRole.id },
        },
        Organization: {
          connect: { id: adminOrg.id },
        },
      },
    });

    // Create regular user
    console.log("Creating regular user...");
    const userPassword = `User@${currentYear}`;
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    const regularUser = await db.user.create({
      data: {
        email: "user@user.com",
        name: "Regular User",
        firstName: "Regular",
        lastName: "User",
        phone: "0987654321",
        password: hashedUserPassword,
        organizationName: userOrg.name,
        roles: {
          connect: { id: userRole.id },
        },
        Organization: {
          connect: { id: adminOrg.id },
        },
      },
    });

    console.log("Seed completed successfully!");
    console.log("Admin credentials:", {
      email: "admin@cautiousndlovu.co.za",
      password: adminPassword,
      organization: adminOrg.name,
    });
    console.log("User credentials:", {
      email: "user@user.com",
      password: userPassword,
      organization: userOrg.name,
    });
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

async function main() {
  console.log("Starting database seed process...");

  try {
    // First clean up existing data
    await cleanDatabase();

    // Then seed new data
    await seedDatabase();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error in main seed process:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Failed to seed database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
