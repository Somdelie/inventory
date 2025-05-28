import { db } from "@/prisma/db";
import { format } from "date-fns";

export async function generateStockNumber(
  type: "TRANSFER" | "PURCHASE" | "SALE"
) {
  const prefix = type.slice(0, 2).toUpperCase(); // e.g., TR for TRANSFER
  const today = new Date();
  const dateStr = format(today, "yyyyMMdd"); // e.g., 20250416

  // Count existing stock movements of this type created today
  const count = await db.stockMovement.count({
    where: {
      type,
      createdAt: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  const serial = count + 1; // Next serial number for today
  return `${prefix}-${dateStr}-${serial}`;
}
