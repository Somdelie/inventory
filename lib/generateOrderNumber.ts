/**
 * Generates a purchase order number using the supplier code + sequence format.
 * Format: XXX-00000 where XXX is the first 3 letters of the supplier name (uppercase)
 * and 00000 is a zero-padded sequential number.
 *
 * @param supplierName The name of the supplier
 * @param sequenceNumber The current sequence number for purchase orders
 * @param padLength The length to pad the sequence number (default: 5)
 * @returns A formatted purchase order number
 */
export function generatePONumber(supplierName: string, sequenceNumber: number, padLength = 5): string {
  // Extract the first 3 letters from supplier name and convert to uppercase
  // If supplier name is less than 3 characters, pad with 'X'
  let supplierCode = supplierName.slice(0, 3).toUpperCase()

  // Handle empty supplier names or names with non-alphabetic characters
  supplierCode = supplierCode
    .replace(/[^A-Z]/g, "X") // Replace non-alphabetic characters with 'X'
    .padEnd(3, "X") // Ensure we have at least 3 characters

  // Pad the sequence number with leading zeros
  const paddedNumber = String(sequenceNumber).padStart(padLength, "0")

  // Combine parts with a hyphen
  return `${supplierCode}-${paddedNumber}`
}
