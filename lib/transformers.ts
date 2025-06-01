// lib/transformers.ts
/**
 * Transforms database data to match client component expectations
 * Converts Date objects to strings and null values to undefined
 */

// Helper function to convert null to undefined
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Helper function to serialize dates
export function serializeDate(date: Date): string {
  return date.toISOString();
}

// Transform adjustment data from database format to component format
export function transformAdjustmentData(rawAdjustment: any) {
  return {
    ...rawAdjustment,
    // Serialize dates
    date: serializeDate(rawAdjustment.date),
    createdAt: serializeDate(rawAdjustment.createdAt),
    updatedAt: serializeDate(rawAdjustment.updatedAt),

    // Convert null to undefined for optional fields
    notes: nullToUndefined(rawAdjustment.notes),

    // Transform nested objects
    location: {
      id: rawAdjustment.location.id,
      name: rawAdjustment.location.name,
      type: rawAdjustment.location.type,
    },

    // Transform approvedBy if it exists
    approvedBy: rawAdjustment.approvedBy
      ? {
          name: rawAdjustment.approvedBy.name,
          email: rawAdjustment.approvedBy.email,
        }
      : undefined,

    // Transform lines array
    lines: rawAdjustment.lines.map((line: any) => ({
      ...line,
      notes: nullToUndefined(line.notes),
      item: {
        id: line.item.id,
        name: line.item.name,
        sku: line.item.sku,
        costPrice: line.item.costPrice,
      },
    })),
  };
}
