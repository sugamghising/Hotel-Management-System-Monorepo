"use client";

import { formatDate, formatCurrency } from "@/lib/utils/formatters";

interface NightlyRate {
  date: string;
  baseRate: number;
  finalRate: number;
  adjustments: Array<{ description: string; amount: number }>;
}

interface NightlyRateBreakdownProps {
  nightlyRates: NightlyRate[];
  currencyCode: string;
}

export function NightlyRateBreakdown({
  nightlyRates,
  currencyCode,
}: NightlyRateBreakdownProps) {
  return (
    <div className="text-sm space-y-2">
      <div className="grid grid-cols-3 gap-2 font-medium text-xs text-muted-foreground uppercase tracking-wide pb-1 border-b">
        <span>Date</span>
        <span className="text-right">Base Rate</span>
        <span className="text-right">Final Rate</span>
      </div>
      {nightlyRates.map((rate, i) => (
        <div
          key={i}
          className="grid grid-cols-3 gap-2 text-sm"
        >
          <span>{formatDate(rate.date)}</span>
          <span className="text-right tabular-nums">
            {formatCurrency(rate.baseRate, currencyCode)}
          </span>
          <span className="text-right tabular-nums font-medium">
            {rate.finalRate !== rate.baseRate
              ? formatCurrency(rate.finalRate, currencyCode)
              : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
