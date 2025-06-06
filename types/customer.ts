// Add these types to your existing types/types.ts file

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  organizationId: string;
}

export interface CustomerDTO {
  id?: string;
  name: string;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  address?: string | null | undefined;
  taxId?: string | null | undefined;
  notes?: string | null | undefined;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date | null | undefined;
  organizationId: string;
}
