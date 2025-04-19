// permissions.ts

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
  "blogs",
  "taxes",
  "brands",
  "units",
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

  "blogs.create",
  "blogs.read",
  "blogs.update",
  "blogs.delete",
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
