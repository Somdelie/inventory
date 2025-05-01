// Location type enum matching Prisma schema
export enum LocationType {
  SHOP = "SHOP",
  WAREHOUSE = "WAREHOUSE",
  OFFICE = "OFFICE",
  VIRTUAL = "VIRTUAL",
}

export interface LocationProps {
  id?: string;
  name: string;
  type: LocationType;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  organizationId: string;
}

export interface LocationDTO {
  id: string;
  name: string;
  type: LocationType;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// For location selection in forms
export interface LocationOption {
  label: string;
  value: string;
  type: LocationType;
}
