/**
 * Helper functions for formatting tax rates
 */

/**
 * Format a tax rate with a percentage symbol
 *
 * @param rate - The tax rate value to format
 * @param options - Formatting options
 * @returns Formatted tax rate string
 */
export function formatTaxRate(
  rate: number | null,
  options: {
    /**
     * Number of decimal places to show
     * Defaults to 2
     */
    decimals?: number;

    /**
     * Whether to show the percentage symbol
     * Defaults to true
     */
    showPercentageSymbol?: boolean;
  } = {}
): string {
  // Return empty string if rate is null
  if (rate === null) {
    return "";
  }

  // Decimal places - default to 2
  const decimals = options.decimals !== undefined ? options.decimals : 2;

  // Whether to show percentage symbol - default to true
  const showPercentageSymbol =
    options.showPercentageSymbol !== undefined
      ? options.showPercentageSymbol
      : true;

  // Format the tax rate
  const formattedRate = rate.toFixed(decimals);

  // Add percentage symbol if requested
  return showPercentageSymbol ? `${formattedRate}%` : formattedRate;
}

/**
 * Parse a tax rate string (possibly with % symbol) to a number
 *
 * @param rateStr - Tax rate string to parse
 * @returns Parsed tax rate as a number or null if invalid
 */
export function parseTaxRate(rateStr: string): number | null {
  // Return null for empty string
  if (!rateStr) {
    return null;
  }

  // Remove percentage symbol and any whitespace
  const cleanRate = rateStr.replace(/%/g, "").trim();

  // Parse as float
  const rateValue = parseFloat(cleanRate);

  // Return null if parsing failed
  if (isNaN(rateValue)) {
    return null;
  }

  return rateValue;
}
