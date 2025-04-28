import { formatUnitMeasure } from "@/lib/formatUnitMeasure";
import React from "react";

interface UnitMeasureDisplayProps {
  value: string | number | null;
  symbol: string | null;
  addSpace?: boolean;
  className?: string;
}

/**
 * Component to display formatted unit measurements
 */
export function UnitMeasureDisplay({
  value,
  symbol,
  addSpace = false,
  className = "",
}: UnitMeasureDisplayProps) {
  return (
    <div className={`font-medium ${className}`}>
      {formatUnitMeasure(value, symbol, { addSpace })}
    </div>
  );
}
