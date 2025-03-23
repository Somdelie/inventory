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
  organizationId: string;
  isNewOrganizationAdmin?: string; // To track if user should become admin of new org
};

// Add this to your types.ts file or wherever you define UserProps

export interface OrganizationProps {
  id?: string;
  name: string;
  slug?: string;
  industry?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
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
