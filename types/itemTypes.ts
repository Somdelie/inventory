export interface ItemDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: string;
  numberPlate: string;
  salesCount: number;
  salesTotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  thumbnail: string | null;
  quantity?: number;
  organizationId: string;
  categoryId: string;
  brandId: string;
  sellingPrice: number;
  costPrice: number;
  emptyStateModalTitle: string;
}

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
  data: ItemDTO[];
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
