export type Permission = {
  create: string;
  read: string;
  update: string;
  delete: string;
};

export type ModulePermissions = {
  display: string;
  name: string;
  permissions: Permission;
};

export const permissions: ModulePermissions[] = [
  "dashboard",
  "users",
  "roles",
  "sales",
  "customers",
  "orders",
  "reports",
  "settings",
  "categories",
  "products",
  "taxes",
  "brands",
  "units",
  "api keys",
  "stock",
  "serial numbers",
  // Added missing permissions based on schema
  "suppliers",
  "inventory",
  "locations",
  "purchase orders",
  "goods receipts",
  "transfers",
  "adjustments",
  "organizations",
  "invitations",
  "pos",
].map((name) => ({
  display: name.charAt(0).toUpperCase() + name.slice(1),
  name,
  permissions: {
    create: `${name}.create`,
    read: `${name}.read`,
    update: `${name}.update`,
    delete: `${name}.delete`,
  },
}));

export const adminPermissions = [
  "dashboard.create",
  "dashboard.read",
  "dashboard.update",
  "dashboard.delete",

  "users.create",
  "users.read",
  "users.update",
  "users.delete",

  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete",

  "sales.create",
  "sales.read",
  "sales.update",
  "sales.delete",

  "customers.create",
  "customers.read",
  "customers.update",
  "customers.delete",

  "orders.create",
  "orders.read",
  "orders.update",
  "orders.delete",

  "reports.create",
  "reports.read",
  "reports.update",
  "reports.delete",

  "settings.access",
  "settings.create",
  "settings.read",
  "settings.update",
  "settings.delete",

  "taxes.create",
  "taxes.read",
  "taxes.update",
  "taxes.delete",

  "brands.create",
  "brands.read",
  "brands.update",
  "brands.delete",

  "units.create",
  "units.read",
  "units.update",
  "units.delete",

  "categories.create",
  "categories.read",
  "categories.update",
  "categories.delete",

  "products.create",
  "products.read",
  "products.update",
  "products.delete",

  "api keys.create",
  "api keys.read",
  "api keys.update",
  "api keys.delete",

  "stock.create",
  "stock.read",
  "stock.update",
  "stock.delete",

  "serial numbers.create",
  "serial numbers.read",
  "serial numbers.update",
  "serial numbers.delete",

  // Added missing admin permissions
  "suppliers.create",
  "suppliers.read",
  "suppliers.update",
  "suppliers.delete",

  "inventory.create",
  "inventory.read",
  "inventory.update",
  "inventory.delete",

  "locations.create",
  "locations.read",
  "locations.update",
  "locations.delete",

  "purchase orders.create",
  "purchase orders.read",
  "purchase orders.update",
  "purchase orders.delete",

  "goods receipts.create",
  "goods receipts.read",
  "goods receipts.update",
  "goods receipts.delete",

  "transfers.create",
  "transfers.read",
  "transfers.update",
  "transfers.delete",

  "adjustments.create",
  "adjustments.read",
  "adjustments.update",
  "adjustments.delete",

  "organizations.create",
  "organizations.read",
  "organizations.update",
  "organizations.delete",

  "invitations.create",
  "invitations.read",
  "invitations.update",
  "invitations.delete",

  // Added missing admin permissions
  "pos.create",
  "pos.read",
  "pos.update",
  "pos.delete",
];

export const userPermissions = [
  "dashboard.read",
  "profile.read",
  "profile.update",
  "products.read",
  "orders.read",
  "orders.create",
  "taxes.read",
  "categories.read",
  "customers.read",
  // Added permissions that regular users might need
  "inventory.read",
  "suppliers.read",
  "locations.read",
  "serial numbers.read",
];

// Added service provider permissions
export const serviceProviderPermissions = [
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
  "pos.read",
  "pos.create",
  "pos.update",
  "pos.delete",
];

// Helper function to get all permission strings
export function getAllPermissions(): string[] {
  return permissions.flatMap((module) => Object.values(module.permissions));
}

// Helper function to check if a permission exists
export function isValidPermission(permission: string): boolean {
  return getAllPermissions().includes(permission);
}

// Helper to get module permissions by name
export function getModulePermissions(
  moduleName: string
): Permission | undefined {
  const module = permissions.find((m) => m.name === moduleName);
  return module?.permissions;
}

// Type for the permissions object
export type PermissionsType = {
  [K in (typeof permissions)[number]["name"]]: Permission;
};

// Helper to get permissions for a specific role
export function getRolePermissions(role: string): string[] {
  switch (role) {
    case "ADMIN":
      return adminPermissions;
    case "USER":
      return userPermissions;
    case "SERVICE_PROVIDER":
      return serviceProviderPermissions;
    default:
      return [];
  }
}
