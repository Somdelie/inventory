import { Role, User } from "@prisma/client";

export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
};
export type SavingProps = {
  amount: number;
  month: string;
  name: string;
  userId: string;
  paymentDate: any;
};
export type InvitedUserProps = {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  password: string;
  organizationId: string;
  organizationName: string;
  roleId: string;
};
export type UserProps = {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  password: string;
  country: string;
  state: string;
  city: string;
  address: string;
  organizationName: string;
};

// Add this to your types.ts file or wherever you define UserProps

export interface OrganizationProps {
  name: string;
  slug: string;
  country: string;
  currency: string;
  timezone: string;
}

export type LoginProps = {
  email: string;
  password: string;
};
export type ForgotPasswordProps = {
  email: string;
};

// types/types.ts

export interface RoleFormData {
  displayName: string;
  description?: string;
  permissions: string[];
  organizationId: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface RoleOption {
  label: string;
  value: string;
}

export interface UpdateUserRoleResponse {
  error: string | null;
  status: number;
  data: UserWithRoles | null;
}

export interface RoleResponse {
  id: string;
  displayName: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitDTO {
  id: string;
  title: string;
  symbol: string;
}

// BrandDTO
export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  organizationId: string | null;
}

// CategoryDTO
export interface CategoryDTO {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  organizationId: string | null;
  imageUrl: string | null;
}

export interface ItemDTO {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  brandId: string | null;
  unitId: string | null;
  taxRateId: string | null;
  organizationId: string | null;
  // imageUrl: string | null;
  // createdAt: Date;
  // updatedAt: Date;
}

export interface TaxDTO {
  id: string;
  name: string;
  rate: number;
  organizationId: string | null;
}
