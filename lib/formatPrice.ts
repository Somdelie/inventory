/**
 * Using currency.js library for price formatting
 *
 * Installation:
 * npm install currency.js
 *
 * This approach uses the currency.js library to handle currency formatting
 * and then applies locale-specific adjustments.
 */

import currency from "currency.js";

// Define currency format interface
interface CurrencyFormat {
  symbol: string;
  separator: string;
  decimal: string;
  precision: number;
  code: string;
}

// Define supported country codes as type
type CountryCode = "ZA" | "US" | "GB" | "EU" | string;

// Define currency formats for different countries
const CURRENCY_FORMATS: Record<CountryCode, CurrencyFormat> = {
  // South Africa - Rand
  ZA: {
    symbol: "R",
    separator: " ",
    decimal: ",",
    precision: 2,
    code: "ZAR",
  },
  // United States - Dollar
  US: {
    symbol: "$",
    separator: ",",
    decimal: ".",
    precision: 2,
    code: "USD",
  },
  // United Kingdom - Pound
  GB: {
    symbol: "£",
    separator: ",",
    decimal: ".",
    precision: 2,
    code: "GBP",
  },
  // European Union - Euro
  EU: {
    symbol: "€",
    separator: ".",
    decimal: ",",
    precision: 2,
    code: "EUR",
  },
  // Add more as needed, or load from a configuration file
};

// Default format (South Africa)
const DEFAULT_FORMAT = CURRENCY_FORMATS.ZA;

/**
 * Format a price based on country/currency and preferences using currency.js
 */
export function formatPrice(
  amount: number,
  options: {
    countryCode?: CountryCode;
    currencyCode?: string;
    useSpaceSeparator?: boolean;
    decimals?: number;
    showCurrencySymbol?: boolean;
  } = {}
): string {
  // Get country code (default to ZA)
  const countryCode = options.countryCode || "ZA";

  // Get format based on country code
  // Check if country code exists in CURRENCY_FORMATS, otherwise use default
  const format = Object.prototype.hasOwnProperty.call(
    CURRENCY_FORMATS,
    countryCode
  )
    ? CURRENCY_FORMATS[countryCode]
    : DEFAULT_FORMAT;

  // Override format settings with options if provided
  const separator =
    options.useSpaceSeparator !== undefined
      ? options.useSpaceSeparator
        ? " "
        : ","
      : format.separator;

  const precision =
    options.decimals !== undefined ? options.decimals : format.precision;

  const symbol =
    options.showCurrencySymbol !== undefined && !options.showCurrencySymbol
      ? ""
      : format.symbol;

  // Format using currency.js
  const formatted = currency(amount, {
    symbol,
    precision,
    separator,
    decimal: format.decimal,
  }).format();

  return formatted;
}

/**
 * Format a price based on country/currency and preferences using native browser APIs
 */
export function formatPriceNative(
  amount: number,
  options: {
    countryCode?: CountryCode;
    currencyCode?: string;
    useSpaceSeparator?: boolean;
    decimals?: number;
    showCurrencySymbol?: boolean;
  } = {}
): string {
  // Default to South Africa if not specified
  const countryCode = options.countryCode || "ZA";

  // Use provided currency code or look up default for country
  const currencyCode =
    options.currencyCode ||
    (Object.prototype.hasOwnProperty.call(CURRENCY_FORMATS, countryCode)
      ? CURRENCY_FORMATS[countryCode].code
      : "ZAR");

  // Decimal places - default to 2
  const decimals = options.decimals !== undefined ? options.decimals : 2;

  // Whether to show currency symbol - default to true
  const showCurrencySymbol =
    options.showCurrencySymbol !== undefined
      ? options.showCurrencySymbol
      : true;

  // Whether to use space as thousand separator - default to true for ZA
  const useSpaceSeparator =
    options.useSpaceSeparator !== undefined
      ? options.useSpaceSeparator
      : countryCode === "ZA";

  try {
    // Create formatter options
    const formatterOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };

    // Add currency formatting if requested
    if (showCurrencySymbol) {
      formatterOptions.style = "currency";
      formatterOptions.currency = currencyCode;
    }

    // Format the price using Intl.NumberFormat
    let formattedPrice = new Intl.NumberFormat(
      `en-${countryCode}`,
      formatterOptions
    ).format(amount);

    // For South Africa with space separator, replace commas with spaces
    if (useSpaceSeparator && countryCode === "ZA" && showCurrencySymbol) {
      // Extract the currency symbol (first character typically)
      const currencySymbol = formattedPrice.substring(0, 1);
      // Remove the currency symbol
      let numericPart = formattedPrice.substring(1);
      // Replace dots with spaces (SA uses dots for thousands)
      numericPart = numericPart.replace(/\./g, " ");
      // Add the currency symbol back
      formattedPrice = currencySymbol + numericPart;
    }

    return formattedPrice;
  } catch (error) {
    // If Intl isn't fully supported, use a fallback
    const symbol = showCurrencySymbol
      ? Object.prototype.hasOwnProperty.call(CURRENCY_FORMATS, countryCode)
        ? CURRENCY_FORMATS[countryCode].symbol
        : "R"
      : "";
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}

/**
 * Example usage:
 *
 * // Basic usage - defaults to South African Rand with space separator
 * formatPrice(10500.30) // Returns "R10 500,30"
 *
 * // US Dollar formatting
 * formatPrice(10500.30, { countryCode: 'US' }) // Returns "$10,500.30"
 *
 * // Custom decimal places
 * formatPrice(10500, { decimals: 0 }) // Returns "R10 500"
 *
 * // No currency symbol
 * formatPrice(10500.30, { showCurrencySymbol: false }) // Returns "10 500,30"
 */
