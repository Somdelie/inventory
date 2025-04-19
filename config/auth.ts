import { AuthOptions, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/prisma/db";

// Helper function to get user with roles and permissions
async function getUserWithRoles(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: true, // Include roles relation
      Organization: true, // Include organization relation
    },
  });

  if (!user) return null;

  // Get all permissions from user's roles
  const permissions = user.roles.flatMap((role) => role.permissions);

  // Remove duplicates from permissions
  const uniquePermissions = [...new Set(permissions)];

  return {
    ...user,
    permissions: uniquePermissions,
    organizationId: user.organizationId ?? undefined,
    organizationName: user.Organization?.name,
  };
}

// Helper function to create or find a default organization for OAuth users
async function getOrCreateDefaultOrganization(userEmail: string) {
  // Create a slug from email (remove @ and domain parts)
  const emailName = userEmail.split("@")[0];
  const slug = `${emailName}-org`.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  try {
    // Check if user already has an organization
    const existingUser = await db.user.findUnique({
      where: { email: userEmail },
      include: { Organization: true },
    });

    if (existingUser?.Organization) {
      return existingUser.Organization;
    }

    // Create a new organization with a unique name based on the user's email
    return await db.organization.create({
      data: {
        name: `${emailName}'s Organization`,
        slug: slug,
        country: "Not Specified",
      },
    });
  } catch (error) {
    console.error("Error creating organization:", error);

    // Fallback to finding any existing default organization
    const defaultOrg = await db.organization.findFirst({
      where: { slug: "default-organization" },
    });

    if (defaultOrg) return defaultOrg;

    // Create a truly default one if nothing else worked
    return await db.organization.create({
      data: {
        name: "Default Organization",
        slug: "default-organization",
      },
    });
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHubProvider({
      async profile(profile) {
        // Find or create default role
        const defaultRole = await db.role.findFirst({
          where: { roleName: "user" },
        });

        // Get or create an organization for this user
        const org = await getOrCreateDefaultOrganization(profile.email);

        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          firstName: profile.name?.split(" ")[0] || "",
          lastName: profile.name?.split(" ")[1] || "",
          phone: "",
          image: profile.avatar_url,
          email: profile.email,
          organizationId: org.id,
          organizationName: org.name,
          roles: defaultRole ? [defaultRole] : [],
          permissions: defaultRole ? defaultRole.permissions : [], // Include permissions from default role
        };
      },
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      async profile(profile) {
        // Find or create default role
        const defaultRole = await db.role.findFirst({
          where: { roleName: "user" },
        });

        // Get or create an organization for this user
        const org = await getOrCreateDefaultOrganization(profile.email);

        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          firstName: profile.given_name,
          lastName: profile.family_name,
          phone: "",
          image: profile.picture,
          email: profile.email,
          organizationId: org.id,
          organizationName: org.name,
          roles: defaultRole ? [defaultRole] : [],
          permissions: defaultRole ? defaultRole.permissions : [], // Include permissions from default role
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw { error: "No Inputs Found", status: 401 };
          }

          const existingUser = await db.user.findUnique({
            where: { email: credentials.email },
            include: {
              roles: true, // Include roles relation
              Organization: true, // Include organization relation
            },
          });

          if (!existingUser) {
            throw { error: "No user found", status: 401 };
          }

          let passwordMatch: boolean = false;
          if (existingUser && existingUser.password) {
            passwordMatch = await compare(
              credentials.password,
              existingUser.password
            );
          }

          if (!passwordMatch) {
            throw { error: "Password Incorrect", status: 401 };
          }

          //check if user is verified
          if (!existingUser.isVerfied) {
            throw { error: "User is not verified", status: 401 };
          }

          // Get all permissions from user's roles
          const permissions = existingUser.roles.flatMap(
            (role) => role.permissions
          );

          // Remove duplicates from permissions
          const uniquePermissions = [...new Set(permissions)];

          return {
            id: existingUser.id,
            name: existingUser.name,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            phone: existingUser.phone,
            image: existingUser.image,
            email: existingUser.email,
            roles: existingUser.roles,
            permissions: uniquePermissions,
            organizationId: existingUser.organizationId ?? undefined,
            organizationName: existingUser.Organization?.name,
          };
        } catch (error) {
          throw { error: "Something went wrong", status: 401 };
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, assign default role and organization if user is new
      if (
        account &&
        (account.provider === "google" || account.provider === "github")
      ) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
          include: {
            roles: true,
            Organization: true,
          },
        });

        console.log("existingUser", existingUser);

        // Create update data object
        const updateData: any = {};

        // Handle role assignment if needed
        if (!existingUser?.roles?.length) {
          // Assign default user role
          const defaultRole = await db.role.findFirst({
            where: { roleName: "user" },
          });

          if (defaultRole) {
            updateData.roles = {
              connect: { id: defaultRole.id },
            };
          }
        }

        // Handle organization assignment if needed
        if (!existingUser?.organizationId) {
          const org = await getOrCreateDefaultOrganization(user.email!);
          updateData.Organization = {
            connect: { id: org.id },
          };
        }

        // Update user if we have changes to make
        if (Object.keys(updateData).length > 0) {
          await db.user.update({
            where: { email: user.email! },
            data: updateData,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // For initial sign in
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
      } else {
        // For subsequent requests, refresh roles, permissions, and organization data
        const userData = await getUserWithRoles(token.id);
        if (userData) {
          token.roles = userData.roles;
          token.permissions = userData.permissions;
          token.organizationId = userData.organizationId ?? undefined;
          token.organizationName = userData.organizationName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.roles = token.roles;
        session.user.permissions = token.permissions;
        session.user.organizationId = token.organizationId as
          | string
          | undefined;
        session.user.organizationName = token.organizationName as
          | string
          | undefined;
      }
      return session;
    },
  },
};
