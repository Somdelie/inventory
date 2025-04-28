/**
 * Helper functions for formatting unit measurements
 */

/**
 * Format a unit measurement with the appropriate symbol
 *
 * @param value - The measurement value
 * @param symbol - The unit symbol (e.g., "L" for liter)
 * @param options - Formatting options
 * @returns Formatted unit measurement
 */
export function formatUnitMeasure(
  value: string | number | null,
  symbol: string | null,
  options: {
    /**
     * Whether to add a space between the value and symbol
     * Defaults to false (e.g., "5L" instead of "5 L")
     */
    addSpace?: boolean;
  } = {}
): string {
  // If value or symbol is null, return empty string
  if (value === null || symbol === null || value === "") {
    return "";
  }

  // Convert value to string if it's a number
  const valueStr = typeof value === "number" ? value.toString() : value;

  // Add space between value and symbol if requested
  const space = options.addSpace ? " " : "";

  // Return formatted measurement
  return `${valueStr}${space}${symbol}`;
}

/**
 * Parse a unit measurement string into its value and symbol components
 *
 * @param measurement - The unit measurement string (e.g., "5L")
 * @param knownSymbol - If provided, used to identify the symbol part
 * @returns Object with value and symbol
 */
export function parseUnitMeasure(
  measurement: string,
  knownSymbol?: string
): { value: string; symbol: string | null } {
  if (!measurement) {
    return { value: "", symbol: null };
  }

  // If we know the symbol, we can split more reliably
  if (knownSymbol && measurement.includes(knownSymbol)) {
    const value = measurement.replace(knownSymbol, "").trim();
    return { value, symbol: knownSymbol };
  }

  // Otherwise, try to detect the symbol
  // This is a simplified approach that assumes numeric value followed by symbol
  const match = measurement.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);

  if (match) {
    return { value: match[1], symbol: match[2] };
  }

  // If no pattern is detected, assume the whole string is a value with no symbol
  return { value: measurement, symbol: null };
}
