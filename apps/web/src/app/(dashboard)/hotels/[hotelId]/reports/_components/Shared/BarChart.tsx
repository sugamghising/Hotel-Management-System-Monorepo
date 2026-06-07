"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils/formatters";

interface BarData {
  label: string;
  value: number;
  meta?: string;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  maxValue?: number;
  color?: string;
  referenceLine?: number;
  referenceLabel?: string;
  showGuideLines?: boolean;
  currencyCode?: string;
  formatType?: "number" | "currency" | "percent";
}

export function BarChart({
  data,
  height = 240,
  maxValue,
  color = "bg-primary",
  referenceLine,
  referenceLabel,
  showGuideLines = true,
  currencyCode = "USD",
  formatType = "number",
}: BarChartProps) {
  const computedMax = useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    const max = Math.max(...data.map((d) => d.value), 1);
    return max * 1.1;
  }, [data, maxValue]);

  const formatValue = (v: number) => {
    if (formatType === "currency") return formatCurrency(v, currencyCode);
    if (formatType === "percent") return `${v.toFixed(1)}%`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return v.toLocaleString();
  };

  if (!data.length) return null;

  const manyDays = data.length > 12;
  const needsRotate = data.length > 7;

  return (
    <div className="relative">
      <div
        className="relative overflow-x-auto"
        style={{ height }}
      >
        <div
          className="relative h-full"
          style={{ minWidth: manyDays ? data.length * 48 : undefined }}
        >
          {showGuideLines && (
            <div className="absolute inset-0 pointer-events-none">
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <div
                  key={fraction}
                  className="absolute left-0 right-0 border-b border-dashed border-gray-200"
                  style={{ bottom: `${fraction * 100}%` }}
                />
              ))}
            </div>
          )}

          {referenceLine !== undefined && (
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{ bottom: `${(referenceLine / computedMax) * 100}%` }}
            >
              <div className="flex items-center gap-1">
                <div className="flex-1 border-t-2 border-dashed border-orange-400" />
                {referenceLabel && (
                  <span className="text-[10px] font-medium text-orange-600 whitespace-nowrap pr-1">
                    {referenceLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex items-end gap-1 px-2">
            {data.map((d, i) => {
              const barHeight = (d.value / computedMax) * (height - 32);
              return (
                <Tooltip
                  key={i}
                  content={`${d.label}: ${formatValue(d.value)}${d.meta ? ` (${d.meta})` : ""}`}
                >
                  <div
                    className={cn(
                      "flex-1 rounded-t transition-all duration-200 hover:opacity-80 cursor-pointer min-w-[8px]",
                      d.color || color,
                    )}
                    style={{ height: `${Math.max(barHeight, 2)}px` }}
                  />
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div
        className={cn(
          "flex gap-1 px-2 pt-1",
          needsRotate ? "overflow-x-auto pb-8" : "",
        )}
        style={{ minWidth: manyDays ? data.length * 48 : undefined }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 text-[10px] text-muted-foreground text-center truncate min-w-[8px]",
              needsRotate && "rotate-[-45deg] origin-top-left whitespace-nowrap",
            )}
            title={d.label}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
