"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { isToday, isSameDay } from "date-fns";
import type { RateCalendarDay } from "@/lib/hooks/useRatePlans";

interface CalendarCellProps {
  day: RateCalendarDay;
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  currencyCode: string;
  onSelect: (date: string) => void;
  onMouseEnter: (date: string) => void;
  onMouseDown: (date: string) => void;
}

export function CalendarCell({
  day,
  date,
  isCurrentMonth,
  isSelected,
  currencyCode,
  onSelect,
  onMouseEnter,
  onMouseDown,
}: CalendarCellProps) {
  const today = isToday(date);
  const dateStr = day.date;

  const cellSuffix = !day.isValid ? "not-valid" : "";
  const cellClass = cn(
    "min-h-[80px] border-r border-b p-1.5 flex flex-col items-center justify-start relative transition-colors select-none",
    !isCurrentMonth && "bg-gray-50 pointer-events-none opacity-40",
    !day.isValid && !isCurrentMonth && "opacity-20",
    isCurrentMonth && day.isValid && "cursor-pointer hover:bg-blue-50",
    day.stopSell && "bg-red-50",
    isSelected && "bg-blue-100 ring-1 ring-blue-400",
    !day.isValid && isCurrentMonth && "bg-gray-50",
  );

  const rateDisplay = () => {
    if (day.stopSell) {
      return (
        <span className="text-[10px] font-semibold text-red-700 leading-tight">
          Stop Sell
        </span>
      );
    }

    const hasOverride = day.overrideRate !== null;

    return (
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            hasOverride ? "text-blue-600" : "text-gray-700",
          )}
        >
          {formatCurrency(day.finalRate, currencyCode)}
        </span>
        {hasOverride && (
          <span className="text-[9px] text-gray-400 line-through tabular-nums">
            {formatCurrency(day.baseRate, currencyCode)}
          </span>
        )}
      </div>
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCurrentMonth || !day.isValid) return;
    onSelect(dateStr);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCurrentMonth || !day.isValid) return;
    onMouseDown(dateStr);
  };

  const handleMouseEnterEvent = () => {
    if (!isCurrentMonth || !day.isValid) return;
    onMouseEnter(dateStr);
  };

  return (
    <div
      className={cellClass}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnterEvent}
      title={`${dateStr}: ${formatCurrency(day.finalRate, currencyCode)}`}
    >
      <span
        className={cn(
          "text-[11px] font-medium leading-none mb-1",
          today && "ring-1 ring-blue-500 rounded-full w-5 h-5 flex items-center justify-center",
          !isCurrentMonth && "text-gray-400",
          day.stopSell && "text-red-600",
        )}
      >
        {date.getDate()}
      </span>

      {isCurrentMonth && rateDisplay()}

      {isSelected && (
        <div className="absolute inset-0 pointer-events-none bg-blue-400/10" />
      )}
    </div>
  );
}
