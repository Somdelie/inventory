import React from "react";
import { formatPrice } from "@/lib/formatPrice";

interface PriceDisplayProps {
  amount: number;
  countryCode?: string;
  currencyCode?: string;
  className?: string;
}

/**
 * Component to display formatted prices
 */
export function PriceDisplay({
  amount,
  countryCode = "ZA",
  currencyCode,
  className = "",
}: PriceDisplayProps) {
  return (
    <div className={`font-medium ${className}`}>
      {formatPrice(amount, { countryCode, currencyCode })}
    </div>
  );
}
