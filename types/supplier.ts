export interface Supplier {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SupplierDTO = {
  id?: string;
  name: string;
  email: string | null; // Allow email to be null
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  isActive?: boolean;
  organizationId: string | null; // Allow organizationId to be null
  createdAt?: Date | string; // Allow string format for dates
  updatedAt?: Date | string | null; // Allow string format for dates
};
