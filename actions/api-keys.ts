"use server";
import { ApiKeyFormProps } from "@/components/dashboard/integrations/create-key-dialog";
import { getAuthenticatedUser } from "@/config/useAuth";
import { generateApiKey } from "@/lib/generateApiKey";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function createAPIKey(data: ApiKeyFormProps) {
  const { name } = data;
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        data: null,
        error: "Your Not Authorized",
      };
    }
    const apiKey = generateApiKey();

    const existingKey = await db.apiKey.findFirst({
      where: {
        name: name,
        organizationId: user.organizationId!,
      },
    });

    if (existingKey) {
      return {
        success: false,
        data: null,
        error: "This Key Already exists",
      };
    }
    const newApiKey = await db.apiKey.create({
      data: {
        name: name,
        key: apiKey,
        organizationId: user.organizationId ?? "",
      },
    });
    revalidatePath("/dashboard/integrations/api");

    return {
      success: true,
      data: newApiKey,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: "Something went wrong",
    };
  }
}

export async function getOrgApiKeys(organizationId: string) {
  const user = await getAuthenticatedUser();
  try {
    if (!user) {
      return {
        success: false,
        data: null,
        error: "Oops! We are not sure what you are looking for.",
      };
    }
    const keys = await db.apiKey.findMany({
      where: {
        organizationId: organizationId,
      },
      select: {
        id: true,
        name: true,
        key: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return keys;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function deleteAPIKey(id: string) {
  const user = await getAuthenticatedUser();
  try {
    if (!user) {
      return {
        success: false,
        data: null,
        error: "Your Not Authorized",
      };
    }
    await db.apiKey.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/integrations/api");
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

//get single api key by id and organization id
export async function getAPIKey(organizationId: string) {
  const user = await getAuthenticatedUser();
  // Remove this line: const apiKey = await getAPIKey(organizationId!);

  try {
    if (!user) {
      return {
        success: false,
        data: null,
        error: "Your Not Authorized",
      };
    }
    const key = await db.apiKey.findFirst({
      where: {
        organizationId: organizationId,
      },
      select: {
        key: true,
      },
    });
    if (!key) {
      return {
        success: false,
        data: null,
        error: "Key not found",
      };
    }
    return {
      success: true,
      data: key,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: "Something went wrong",
    };
  }
}
