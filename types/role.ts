export interface RoleFormData {
  displayName: string;
  description?: string;
  permissions: string[];
  organizationId: string;
}

export interface RoleOption {
  label: string;
  value: string;
}

export interface RoleResponse {
  id: string;
  displayName: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
