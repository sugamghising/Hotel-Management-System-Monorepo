"use client";

import { useCallback } from "react";
import {
  subDays,
  startOfMonth,
  startOfYear,
  format,
  differenceInDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface ReportControlsProps {
  from: string;
  to: string;
  preset: string;
  groupBy: string;
  tab: string;
  onPresetChange: (preset: string, from: string, to: string, groupBy: string) => void;
  onDateRangeChange: (from: string, to: string, groupBy?: string) => void;
  onGroupByChange: (groupBy: string) => void;
}

const PRESETS = [
  { key: "7D", label: "7D" },
  { key: "MTD", label: "MTD" },
  { key: "30D", label: "30D" },
  { key: "90D", label: "90D" },
  { key: "YTD", label: "YTD" },
];

const GROUP_BY_OPTIONS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const todayStr = () => format(new Date(), "yyyy-MM-dd");

function computeDates(preset: string) {
  const today = new Date();
  let from: Date;
  switch (preset) {
    case "7D":
      from = subDays(today, 7);
      break;
    case "MTD":
      from = startOfMonth(today);
      break;
    case "30D":
      from = subDays(today, 30);
      break;
    case "90D":
      from = subDays(today, 90);
      break;
    case "YTD":
      from = startOfYear(today);
      break;
    default:
      from = startOfMonth(today);
  }
  return { from: format(from, "yyyy-MM-dd"), to: todayStr() };
}

function autoGroupBy(fromStr: string, toStr: string) {
  const days = differenceInDays(new Date(toStr), new Date(fromStr));
  if (days <= 31) return "day";
  if (days <= 90) return "week";
  return "month";
}

export function ReportControls({
  from,
  to,
  preset,
  groupBy,
  tab,
  onPresetChange,
  onDateRangeChange,
  onGroupByChange,
}: ReportControlsProps) {
  const handlePresetClick = useCallback(
    (key: string) => {
      const { from: f, to: t } = computeDates(key);
      const gb = autoGroupBy(f, t);
      onPresetChange(key, f, t, gb);
    },
    [onPresetChange],
  );

  return (
    <div className="sticky top-0 z-10 bg-white border-b py-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            variant={preset === p.key ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(p.key)}
            className={cn(
              "min-w-[44px]",
              preset === p.key && "bg-primary text-primary-foreground",
            )}
          >
            {p.label}
          </Button>
        ))}

        <span className="text-xs text-muted-foreground px-1">|</span>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>
            {from} – {to}
          </span>
        </div>
      </div>

      {tab !== "audit" && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Group by:</span>
          {GROUP_BY_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              variant={groupBy === opt.key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onGroupByChange(opt.key)}
              className={cn(
                "h-7 px-3 text-xs",
                groupBy === opt.key && "bg-muted font-medium",
              )}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export { computeDates, autoGroupBy, todayStr };
