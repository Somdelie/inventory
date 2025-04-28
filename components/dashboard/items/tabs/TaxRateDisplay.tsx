import { formatTaxRate } from "@/lib/formatTaxRate";
import React from "react";

interface TaxRateDisplayProps {
  rate: number | null;
  decimals?: number;
  showPercentageSymbol?: boolean;
  className?: string;
}

/**
 * Component to display formatted tax rates
 */
export function TaxRateDisplay({
  rate,
  decimals = 2,
  showPercentageSymbol = true,
  className = "",
}: TaxRateDisplayProps) {
  return (
    <div className={`font-medium ${className}`}>
      {formatTaxRate(rate, { decimals, showPercentageSymbol })}
    </div>
  );
}
