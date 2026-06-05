"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";

interface CostSummaryProps {
  estimatedCost: number | null;
  actualCost: number | null;
  currency?: string;
  showVariance?: boolean;
}

export function CostSummary({
  estimatedCost,
  actualCost,
  currency = "USD",
  showVariance = true,
}: CostSummaryProps) {
  const hasEstimated = estimatedCost != null;
  const hasActual = actualCost != null;

  let variance: number | null = null;
  let varianceLabel = "";
  let varianceClass = "";

  if (showVariance && hasEstimated && hasActual && estimatedCost! > 0) {
    variance = ((actualCost! - estimatedCost!) / estimatedCost!) * 100;
    if (variance <= 0) {
      varianceLabel = "Under estimate";
      varianceClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (variance <= 20) {
      varianceLabel = `${variance.toFixed(0)}% over estimate`;
      varianceClass = "text-orange-600 bg-orange-50 border-orange-200";
    } else {
      varianceLabel = `${variance.toFixed(0)}% over estimate \u26A0`;
      varianceClass = "text-red-600 bg-red-50 border-red-200";
    }
  }

  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">
        Est: {hasEstimated ? formatCurrency(estimatedCost!, currency) : "\u2014"}
      </div>
      <div className="text-xs text-muted-foreground">
        Act: {hasActual ? formatCurrency(actualCost!, currency) : "pending"}
      </div>
      {variance != null && (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
            varianceClass,
          )}
        >
          {varianceLabel}
        </span>
      )}
    </div>
  );
}
