// services/confirmationTokenService.ts
import { db } from "@/prisma/db";
import crypto from "crypto";

/**
 * Generates a secure random token for purchase order confirmation
 * @returns A random string token
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates a confirmation token for a purchase order
 * @param purchaseOrderId The ID of the purchase order
 * @param expirationHours Number of hours until the token expires (default: 24)
 * @returns The generated confirmation token
 */
export async function createConfirmationToken(
  purchaseOrderId: string,
  expirationHours: number = 24
): Promise<string> {
  // Create expiration date
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  // Generate token
  const token = generateRandomToken();

  // Save token to database
  await db.confirmationToken.create({
    data: {
      token,
      purchaseOrderId,
      expiresAt,
    },
  });

  return token;
}

/**
 * Invalidates all existing tokens for a purchase order
 * @param purchaseOrderId The ID of the purchase order
 */
export async function invalidateExistingTokens(
  purchaseOrderId: string
): Promise<void> {
  // Mark all unused tokens for this purchase order as used
  await db.confirmationToken.updateMany({
    where: {
      purchaseOrderId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

/**
 * Creates a purchase order confirmation URL
 * @param purchaseOrderId The ID of the purchase order
 * @param expirationHours Number of hours until the token expires (default: 24)
 * @param baseUrl Base URL for the application (default: from environment)
 * @returns The full confirmation URL
 */
export async function createPurchaseOrderConfirmationUrl(
  purchaseOrderId: string,
  expirationHours: number = 24,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
): Promise<string> {
  // Invalidate any existing tokens
  await invalidateExistingTokens(purchaseOrderId);

  // Create a new token
  const token = await createConfirmationToken(purchaseOrderId, expirationHours);

  // Build the URL
  return `${baseUrl}/confirm-purchase-order/${purchaseOrderId}?token=${token}`;
}

/**
 * Validates a confirmation token without using it
 * @param purchaseOrderId The ID of the purchase order
 * @param token The token to validate
 * @returns The associated purchase order if valid, null otherwise
 */
export async function validateTokenWithoutUsing(
  purchaseOrderId: string,
  token: string
) {
  const confirmationToken = await db.confirmationToken.findFirst({
    where: {
      token,
      purchaseOrderId,
      expiresAt: {
        gt: new Date(),
      },
      usedAt: null,
    },
    include: {
      purchaseOrder: true,
    },
  });

  if (!confirmationToken) {
    return null;
  }

  return confirmationToken.purchaseOrder;
}

/**
 * Marks a token as used
 * @param token The token to mark as used
 * @returns Whether the operation was successful
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    await db.confirmationToken.updateMany({
      where: {
        token,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error marking token as used:", error);
    return false;
  }
}
