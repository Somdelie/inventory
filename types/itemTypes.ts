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

export interface ItemCreateDTO {
  data: ItemPayload;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  organizationId: string;
  categoryId: string;
  brandId: string;
  sellingPrice: number;
  costPrice: number;
  thumbnail?: string | null; // Use string type for thumbnail if it's a URL
  quantity?: number; // Optional field for quantity
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
  weight: string | null;
  upc: string | null;
  ean: string | null;
  mpn: string | null;
  isbn: string | null;
  thumbnail: string;
  imageUrls: string[];
  unitOfMeasure: string | null;
  brandName: string | null;
  tax: string | null;
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
}

interface ItemResponse {
  data: Item | null;
  status: number;
  error: string | null;
  success: boolean;
}

// Export the interfaces
export type { ItemResponse, Item, Category, Brand, Unit, TaxRate };
