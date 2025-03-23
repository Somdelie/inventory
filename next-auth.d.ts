// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      roles: Role[];
      permissions: string[];
      organizationId?: string;
      organizationName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    name?: string | null;
    email?: string | null;
    image?: string | null;
    organizationId?: string;
    organizationName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    organizationId?: string;
    organizationName?: string;
  }
}
