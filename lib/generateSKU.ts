/**
 * Generates a unique SKU for an item
 * Format: Prefix based on name/brand/category + random digits for uniqueness
 *
 * @param name - The name of the item
 * @param brandName - The brand name (optional)
 * @param categoryName - The category name (optional)
 * @returns A unique SKU string
 */
export function generateSKU(
  name: string,
  brandName?: string | null,
  categoryName?: string | null
): string {
  // Extract first 3 letters from name (uppercase)
  const namePrefix = name
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  // Extract first 2 letters from brand (uppercase) or use empty string if not available
  const brandPrefix = brandName
    ? brandName
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 2)
        .toUpperCase()
    : "";

  // Extract first 2 letters from category (uppercase) or use empty string if not available
  const categoryPrefix = categoryName
    ? categoryName
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 2)
        .toUpperCase()
    : "";

  // Generate a random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  // Combine all parts to create the SKU
  if (brandPrefix && categoryPrefix) {
    // Include brand and category in SKU
    return `${brandPrefix}${categoryPrefix}-${namePrefix}${randomNum}`;
  } else if (brandPrefix) {
    // Include only brand in SKU
    return `${brandPrefix}-${namePrefix}${randomNum}`;
  } else if (categoryPrefix) {
    // Include only category in SKU
    return `${categoryPrefix}-${namePrefix}${randomNum}`;
  } else {
    // Basic SKU with just name prefix
    return `${namePrefix}${randomNum}`;
  }
}
