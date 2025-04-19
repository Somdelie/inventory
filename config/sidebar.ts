// config/sidebar.ts
import {
  BaggageClaim,
  BarChart2,
  BarChart4,
  Book,
  Cable,
  CircleDollarSign,
  FolderTree,
  Home,
  Link,
  LucideIcon,
  Presentation,
  Settings,
  Users,
} from "lucide-react";

export interface ISidebarLink {
  title: string;
  href?: string;
  icon: LucideIcon;
  dropdown: boolean;
  permission: string; // Required permission to view this item
  dropdownMenu?: MenuItem[];
}

export interface IsSidebarCardsLink {
  title: string;
  description: string;
  icon: LucideIcon;
  count?: string;
  linkText: string;
  linkHref: string;
  href?: string;
  dropdown: boolean;
  permission: string; // Required permission to view this item
  dropdownMenu?: MenuItem[];
}

type MenuItem = {
  title: string;
  href: string;
  permission: string; // Required permission to view this menu item
};

export const sidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    dropdown: false,
    permission: "dashboard.read",
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/inventory/products",
    permission: "products.read",
    dropdownMenu: [
      {
        title: "Items",
        href: "/dashboard/inventory/items",
        permission: "products.read",
      },
      {
        title: "Categories",
        href: "/dashboard/inventory/categories",
        permission: "categories.read",
      },
      {
        title: "Brands",
        href: "/dashboard/inventory/brands",
        permission: "products.read",
      },
      {
        title: "Units",
        href: "/dashboard/inventory/units",
        permission: "products.read",
      },
      {
        title: "Current Stock",
        href: "/dashboard/inventory/current-stock",
        permission: "products.read",
      },
      {
        title: "Low Stock Items",
        href: "/dashboard/inventory/low-stock-items",
        permission: "products.read",
      },
      {
        title: "Serial Numbers",
        href: "/dashboard/inventory/serial-numbers",
        permission: "products.read",
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        permission: "products.read",
      },
      {
        title: "Create Transfer",
        href: "/dashboard/inventory/transfers/create",
        permission: "products.create",
      },
      {
        title: "Stock Adjustments",
        href: "/dashboard/inventory/adjustments",
        permission: "products.update",
      },
    ],
  },
  // purchases - mapped to products permissions since there's no direct purchases module
  {
    title: "Purchases",
    icon: CircleDollarSign,
    dropdown: true,
    href: "/dashboard/purchases/orders",
    permission: "products.read",
    dropdownMenu: [
      {
        title: "Purchase Orders",
        href: "/dashboard/purchases/orders",
        permission: "products.read",
      },
      {
        title: "Create Purchase Order",
        href: "/dashboard/purchases/orders/create",
        permission: "products.create",
      },
      {
        title: "Goods Receipts",
        href: "/dashboard/purchases/purchase/receipts",
        permission: "products.read",
      },
      {
        title: "Create Receipt",
        href: "/dashboard/purchases/purchase/receipts/create",
        permission: "products.create",
      },
      {
        title: "Suppliers",
        href: "/dashboard/purchases/suppliers",
        permission: "products.read",
      },
      {
        title: "Add Supplier",
        href: "/dashboard/purchases/suppliers/add",
        permission: "products.create",
      },
    ],
  },
  // sales
  {
    title: "Sales",
    icon: Presentation,
    dropdown: true,
    href: "/dashboard/sales/orders",
    permission: "sales.read",
    dropdownMenu: [
      {
        title: "POS Sales",
        href: "/dashboard/sales/pos",
        permission: "sales.read",
      },
      {
        title: "Sales Orders",
        href: "/dashboard/sales/orders",
        permission: "orders.read",
      },
      {
        title: "Create Sales Order",
        href: "/dashboard/sales/orders/create",
        permission: "orders.create",
      },
      {
        title: "Returns",
        href: "/dashboard/sales/returns",
        permission: "sales.read",
      },
      {
        title: "Create Return",
        href: "/dashboard/sales/returns/create",
        permission: "sales.create",
      },
      {
        title: "Customers",
        href: "/dashboard/sales/customers",
        permission: "customers.read",
      },
    ],
  },
  {
    title: "Reports",
    icon: BarChart2,
    dropdown: true,
    href: "/dashboard/reports",
    permission: "reports.read",
    dropdownMenu: [
      {
        title: "Stock Movement",
        href: "/dashboard/reports/inventory/movement",
        permission: "reports.read",
      },
      {
        title: "Inventory Valuation",
        href: "/dashboard/reports/inventory/valuation",
        permission: "reports.read",
      },
      {
        title: "Aging Analysis",
        href: "/dashboard/reports/inventory/aging",
        permission: "reports.read",
      },
      {
        title: "Purchase Summary",
        href: "/dashboard/reports/purchases/summary",
        permission: "reports.read",
      },
      {
        title: "Supplier Performance",
        href: "/dashboard/reports/purchases/supplier-performance",
        permission: "reports.read",
      },
      {
        title: "Sales Summary",
        href: "/dashboard/reports/sales/summary",
        permission: "reports.read",
      },
      {
        title: "Product Performance",
        href: "/dashboard/reports/sales/product-performance",
        permission: "reports.read",
      },
    ],
  },
  {
    title: "Integrations",
    icon: Link,
    dropdown: true,
    href: "/dashboard/integrations/pos",
    permission: "settings.read", // Mapped to settings since there's no integration module
    dropdownMenu: [
      {
        title: "POS Integrations",
        href: "/dashboard/integrations/pos",
        permission: "settings.read",
      },
      {
        title: "Accounting Integrations",
        href: "/dashboard/integrations/accounting",
        permission: "settings.read",
      },
      {
        title: "API Settings",
        href: "/dashboard/integrations/api",
        permission: "settings.read",
      },
    ],
  },
  {
    title: "Blogs",
    icon: Book,
    dropdown: true,
    href: "/dashboard/blogs",
    permission: "blogs.read",
    dropdownMenu: [
      {
        title: "All Blogs",
        href: "/dashboard/blogs",
        permission: "blogs.read",
      },
      {
        title: "Add Blog",
        href: "/dashboard/blogs/create",
        permission: "blogs.create",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    dropdown: true,
    permission: "settings.read",
    dropdownMenu: [
      {
        title: "Locations",
        href: "/dashboard/settings/locations",
        permission: "settings.read",
      },
      {
        title: "Add Location",
        href: "/dashboard/settings/locations/create",
        permission: "settings.create",
      },
      {
        title: "Users",
        href: "/dashboard/settings/users",
        permission: "users.read",
      },
      {
        title: "Roles & Permissions",
        href: "/dashboard/settings/roles",
        permission: "roles.read",
      },
      {
        title: "Company Settings",
        href: "/dashboard/settings/company",
        permission: "settings.read",
      },
      {
        title: "Tax Rates",
        href: "/dashboard/settings/tax-rates",
        permission: "settings.read",
      },
      {
        title: "Profile",
        href: "/dashboard/settings/profile",
        permission: "users.read",
      },
      {
        title: "Change Password",
        href: "/dashboard/settings/change-password",
        permission: "users.update",
      },
    ],
  },
];
