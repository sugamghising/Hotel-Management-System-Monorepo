"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import {
  parse,
  format,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  getDay,
} from "date-fns";
import { CalendarCell } from "./CalendarCell";
import { cn } from "@/lib/utils";
import type { RateCalendarDay, RateCalendarResponse } from "@/lib/hooks/useRatePlans";

interface CalendarGridProps {
  calendar: RateCalendarResponse | undefined;
  monthStr: string;
  selectedDates: string[];
  currencyCode: string;
  onDateClick: (date: string) => void;
  onSelectionChange: (dates: string[]) => void;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  calendar,
  monthStr,
  selectedDates,
  currencyCode,
  onDateClick,
  onSelectionChange,
}: CalendarGridProps) {
  const dateMap = useMemo(() => {
    const map = new Map<string, RateCalendarDay>();
    if (calendar?.dates) {
      calendar.dates.forEach((d) => map.set(d.date, d));
    }
    return map;
  }, [calendar]);

  const monthDate = parse(monthStr, "yyyy-MM", new Date());
  const daysInMonth = getDaysInMonth(monthDate);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  const allDays = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const padStart = getDay(start);
    const padEnd = 6 - getDay(end);
    const result: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    for (let i = padStart; i > 0; i--) {
      const d = new Date(start);
      d.setDate(d.getDate() - i);
      result.push({ date: d, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(monthDate.getFullYear(), monthDate.getMonth(), d), isCurrentMonth: true });
    }

    for (let i = 1; i <= padEnd; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() + i);
      result.push({ date: d, isCurrentMonth: false });
    }

    return result;
  }, [monthDate, daysInMonth]);

  const isSelecting = useRef(false);
  const selectionStart = useRef<string | null>(null);

  const handleMouseDown = useCallback(
    (dateStr: string) => {
      isSelecting.current = true;
      selectionStart.current = dateStr;
      onSelectionChange([dateStr]);
    },
    [onSelectionChange],
  );

  const handleMouseEnter = useCallback(
    (dateStr: string) => {
      if (!isSelecting.current || !selectionStart.current) return;
      const allDates = allDays
        .filter((d) => d.isCurrentMonth && dateMap.has(format(d.date, "yyyy-MM-dd")))
        .map((d) => format(d.date, "yyyy-MM-dd"))
        .sort();
      const startIdx = allDates.indexOf(selectionStart.current);
      const endIdx = allDates.indexOf(dateStr);
      if (startIdx === -1 || endIdx === -1) return;
      const min = Math.min(startIdx, endIdx);
      const max = Math.max(startIdx, endIdx);
      onSelectionChange(allDates.slice(min, max + 1));
    },
    [allDays, dateMap, onSelectionChange],
  );

  const handleMouseUp = useCallback(() => {
    isSelecting.current = false;
  }, []);

  const handleDateClick = useCallback(
    (dateStr: string) => {
      onDateClick(dateStr);
    },
    [onDateClick],
  );

  const weeks: Array<Array<{ date: Date; isCurrentMonth: boolean }>> = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <div className="flex-1 overflow-auto" onMouseUp={handleMouseUp}>
      <div className="grid grid-cols-7 min-w-[700px]">
        {DAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={cn(
              "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-2 border-b border-r bg-muted/20",
              i >= 5 && "text-muted-foreground/50",
            )}
          >
            {h}
          </div>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const dateStr = format(day.date, "yyyy-MM-dd");
            const calDay = dateMap.get(dateStr);
            const isSel = selectedDates.includes(dateStr);
            return (
              <CalendarCell
                key={`${wi}-${di}`}
                day={
                  calDay ?? {
                    date: dateStr,
                    baseRate: 0,
                    overrideRate: null,
                    finalRate: 0,
                    stopSell: false,
                    minStay: null,
                    isValid: false,
                  }
                }
                date={day.date}
                isCurrentMonth={day.isCurrentMonth}
                isSelected={isSel}
                currencyCode={currencyCode}
                onSelect={handleDateClick}
                onMouseEnter={handleMouseEnter}
                onMouseDown={handleMouseDown}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
