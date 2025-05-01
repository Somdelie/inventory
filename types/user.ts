import { Role, User } from "@prisma/client";

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

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface UpdateUserRoleResponse {
  error: string | null;
  status: number;
  data: UserWithRoles | null;
}
