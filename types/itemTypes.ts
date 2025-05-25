import { SupplierDTO } from "./types";

export type ItemPayload = {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: string;
  numberPlate: string;
  organizationId: string;
  categoryId: string;
  brandId: string;
  sellingPrice: number;
  costPrice: number;
  thumbnail?: File | null; // Use File type for thumbnail if it's a file upload
};

export type UpdateItemPayload = {
  name?: string;
  price?: string;
  numberPlate?: string;
};

export type ItemApiResponse = {
  success: boolean;
  data: Item[];
  error?: string;
};

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// / Updated ItemCreateDTO interface
export interface ItemCreateDTO {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  organizationId: string;
  categoryId: string;
  brandId: string;
  sellingPrice: number;
  costPrice: number;
  thumbnail?: string | null;
  quantity?: number;
  // Change to string[] to match what we're using in the form
  suppliers?: string[];
}

export interface ItemUpdateDTO {
  id: string;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  organizationId?: string;
  categoryId?: string;
  brandId?: string;
  sellingPrice?: number;
  costPrice?: number;
  thumbnail?: string | null; // Changed from File to string to match how you're using it
  suppliers: SupplierDTO[]; // Assuming you have a SupplierDTO type defined elsewhere
}

interface Category {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  // Add other unit properties as needed
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  // Add other tax rate properties as needed
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface SimpleSupplierDTO {
  id: string;
  name: string;
  // Add any other fields you actually use in your UI
}

export interface ItemSupplierRelation {
  id: string;
  itemId: string;
  supplierId: string;
  isPreferred: boolean;
  supplier: {
    id: string;
    name: string;
  };
}

interface Item {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  categoryId: string;
  salesCount: number;
  salesTotal: number;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  isActive: boolean;
  isPublished: boolean;
  isSerialTracked: boolean;
  dimensions: string | null;
  weight: number | null;
  upc: string | null;
  ean: string | null;
  mpn: string | null;
  isbn: string | null;
  thumbnail: string;
  imageUrls: string[];
  unitOfMeasure: string | null;
  brandName: string | null;
  tax: number | null;
  taxId: string | null;
  unitId: string | null;
  brandId: string;
  taxRateId: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
  brand: Brand;
  unit: Unit | null;
  taxRate: TaxRate | null;
  suppliers: SimpleSupplierDTO[]; // Use simplified supplier type
  supplierRelations?: ItemSupplierRelation[]; // Add this field
  inventories?: {
    id: string;
    locationId: string;
    quantity: number;
    reservedQuantity: number;
    location: {
      id: string;
      name: string;
      type: string;
    };
  }[];
}

interface ItemResponse {
  data: Item | null;
  status: number;
  error: string | null;
  success: boolean;
  suppliers: SupplierDTO[]; // Full supplier objects
}

// Alternative: Create a separate interface for inventory items if they have different structure
// Quick fix: Update your existing InventoryItem interface
// Quick fix: Update your existing InventoryItem interface
interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  categoryId: string | null;
  salesCount: number;
  salesTotal: number;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number | null;
  isActive: boolean;
  isPublished: boolean;
  isSerialTracked: boolean;
  dimensions: string | null;
  weight: number | null;
  upc: string | null;
  ean: string | null;
  mpn: string | null;
  isbn: string | null;
  thumbnail: string | null; // Changed from string to string | null
  imageUrls: string[];
  unitOfMeasure: string | null;
  brandName: string | null;
  tax: number | null;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Make sure these match your actual Prisma query structure
  category: {
    title: string;
  } | null;

  inventories: {
    id: string;
    locationId: string;
    quantity: number;
    reservedQuantity: number;
    location: {
      id: string;
      name: string;
      type: string;
      createdAt: Date;
      updatedAt: Date;
      phone: string | null;
      email: string | null;
      address: string | null;
      organizationId: string | null;
      isActive: boolean;
    };
  }[];
}

// Export the interfaces
export type {
  ItemResponse,
  Item,
  Category,
  Brand,
  Unit,
  TaxRate,
  InventoryItem,
};
