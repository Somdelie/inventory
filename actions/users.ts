"use server";
import { ResetPasswordEmail } from "@/components/email-templates/reset-password";
import { db } from "@/prisma/db";
import { UserProps } from "@/types/types";
import bcrypt, { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { PasswordProps } from "@/components/Forms/ChangePasswordForm";
import { Resend } from "resend";
import { generateToken } from "@/lib/token";
import { generateOTP } from "@/lib/generateOTP";
import VerifyEmail from "@/components/email-templates/verify-email";
// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const DEFAULT_USER_ROLE = {
  displayName: "User",
  roleName: "user",
  description: "Default user role with basic permissions",
  permissions: [
    "dashboard.read",
    "profile.read",
    "profile.update",
    "orders.read",
  ],
};

export async function createUser(data: UserProps) {
  const {
    email,
    password,
    firstName,
    lastName,
    name,
    phone,
    image,
    organizationId,
    country,
  } = data;

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      // Check for existing users
      const existingUserByEmail = await tx.user.findUnique({
        where: { email },
      });

      const existingUserByPhone = await tx.user.findUnique({
        where: { phone },
      });

      if (existingUserByEmail) {
        return {
          error: `This email ${email} is already in use`,
          status: 409,
          data: null,
        };
      }

      if (existingUserByPhone) {
        return {
          error: `This Phone number ${phone} is already in use`,
          status: 409,
          data: null,
        };
      }

      // Find or create default role
      let defaultRole = await tx.role.findFirst({
        where: { roleName: DEFAULT_USER_ROLE.roleName },
      });

      // Create default role if it doesn't exist
      if (!defaultRole) {
        defaultRole = await tx.role.create({
          data: DEFAULT_USER_ROLE,
        });
      }

      // Check if organization exists
      let organization;
      if (organizationId) {
        organization = await tx.organization.findUnique({
          where: { id: organizationId },
        });

        if (!organization) {
          return {
            error: `Organization not found`,
            status: 404,
            data: null,
          };
        }
      } else {
        // Create a default organization for the user
        const emailPrefix = email.split("@")[0];
        const orgName = `${name}'s Organization`;
        const slug = `${emailPrefix}-org`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-");

        organization = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            country: country || "Not Specified",
            industry: "Not Specified",
          },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate a 6 digit token for email verification
      const token = generateOTP();
      // Create user with role and organization
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          name,
          phone,
          token,
          image,
          roles: {
            connect: {
              id: defaultRole.id,
            },
          },
          Organization: {
            connect: {
              id: organization.id,
            },
          },
        },
        include: {
          roles: true,
          Organization: true,
        },
      });

      // Send email verification token using Resend API
      const verificationCode = newUser.token ?? "";

      const { data, error } = await resend.emails.send({
        from: "Somdelie Inventory <admin@cautiousndlovu.co.za>",
        to: email,
        subject: "Verify your account",
        react: VerifyEmail({ verificationCode }),
      });

      if (error) {
        console.log(error);
        return {
          error: error.message,
          status: 500,
          data: null,
        };
      }

      console.log(data);

      return {
        error: null,
        status: 200,
        data: newUser,
      };
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}

// resend verification code
export async function resendVerificationCode(email: string) {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        error: "User not found with this email address",
        status: 404,
        data: null,
      };
    }

    // Check if user is already verified
    if (user.isVerfied) {
      return {
        error: "User is already verified",
        status: 400,
        data: null,
      };
    }

    // Generate a new OTP
    const newToken = generateOTP();

    // Update user with new token
    const updatedUser = await db.user.update({
      where: { email },
      data: { token: newToken },
    });

    // Send email with new verification code
    const { data, error } = await resend.emails.send({
      from: "Somdelie Inventory <admin@cautiousndlovu.co.za>",
      to: email,
      subject: "Your New Verification Code",
      react: VerifyEmail({ verificationCode: newToken }),
    });

    if (error) {
      console.log(error);
      return {
        error: "Failed to send verification email",
        status: 500,
        data: null,
      };
    }

    return {
      error: null,
      status: 200,
      data: {
        message: "Verification code resent successfully",
        email: email,
      },
    };
  } catch (error) {
    console.error("Error resending verification code:", error);
    return {
      error: "Something went wrong, please try again",
      status: 500,
      data: null,
    };
  }
}

export async function getAllMembers() {
  try {
    const members = await db.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return members;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        roles: true,
        Organization: true, // Include organization data
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function deleteUser(id: string) {
  try {
    const deleted = await db.user.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deleted,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      error: "Failed to delete user",
    };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
        Organization: true, // Include organization data
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function sendResetLink(email: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return {
        status: 404,
        error: "We cannot associate this email with any user",
        data: null,
      };
    }
    const token = generateToken();
    const update = await db.user.update({
      where: {
        email,
      },
      data: {
        token,
      },
    });
    const userFirstname = user.firstName;

    const resetPasswordLink = `${baseUrl}/reset-password?token=${token}&&email=${email}`;
    const { data, error } = await resend.emails.send({
      from: "NextAdmin <info@desishub.com>",
      to: email,
      subject: "Reset Password Request",
      react: ResetPasswordEmail({ userFirstname, resetPasswordLink }),
    });
    if (error) {
      return {
        status: 404,
        error: error.message,
        data: null,
      };
    }
    console.log(data);
    return {
      status: 200,
      error: null,
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "We cannot find your email",
      data: null,
    };
  }
}

export async function updateUserPassword(id: string, data: PasswordProps) {
  const existingUser = await db.user.findUnique({
    where: {
      id,
    },
  });
  // Check if the Old Password = User Password
  let passwordMatch: boolean = false;
  // Check if Password is correct
  if (existingUser && existingUser.password) {
    // if user exists and password exists
    passwordMatch = await compare(data.oldPassword, existingUser.password);
  }
  if (!passwordMatch) {
    return { error: "Old Password Incorrect", status: 403 };
  }
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  try {
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
    revalidatePath("/dashboard/clients");
    return { error: null, status: 200 };
  } catch (error) {
    console.log(error);
    return { error: "Failed to update password", status: 500 };
  }
}

export async function resetUserPassword(
  email: string,
  token: string,
  newPassword: string
) {
  const user = await db.user.findUnique({
    where: {
      email,
      token,
    },
  });
  if (!user) {
    return {
      status: 404,
      error: "Please use a valid reset link",
      data: null,
    };
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    const updatedUser = await db.user.update({
      where: {
        email,
        token,
      },
      data: {
        password: hashedPassword,
        token: null, // Clear the token after use for security
      },
    });
    return {
      status: 200,
      error: null,
      data: null,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Failed to reset password",
      data: null,
    };
  }
}

// New function to get users by organization
export async function getUsersByOrganization(organizationId: string) {
  try {
    const users = await db.user.findMany({
      where: {
        organizationId,
      },
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users by organization:", error);
    return [];
  }
}

// update user by id once verified
export async function updateUserById(userId: string, otp: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user?.token !== otp) {
      return {
        status: 403,
        error: "Invalid Token",
        data: null,
      };
    }
    if (String(user?.token) !== String(otp)) {
      return {
        status: 403,
        error: "Invalid Token",
        data: null,
      };
    }
    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        isVerfied: true,
      },
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}
