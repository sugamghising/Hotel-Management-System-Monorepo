"use client";

import { useState, useCallback, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  parse,
  addMonths,
  subMonths,
} from "date-fns";
import {
  useRateCalendar,
  useBulkRateOverride,
  useUpdateRateOverride,
  useDeleteRateOverride,
} from "@/lib/hooks/useRatePlans";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { BulkSelectionBar } from "./BulkSelectionBar";
import { DateOverridePopover } from "../Dialogs/DateOverridePopover";
import { BulkOverrideDialog } from "../Dialogs/BulkOverrideDialog";
import { Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RatePlanListItem } from "@/lib/hooks/useRatePlans";

interface RateCalendarPanelProps {
  selectedPlan: RatePlanListItem | null;
  monthStr: string;
  canUpdate: boolean;
  canCreate: boolean;
  onMonthChange: (month: string) => void;
  onEdit: () => void;
  onClone: () => void;
  onCreateNew: () => void;
}

export function RateCalendarPanel({
  selectedPlan,
  monthStr,
  canUpdate,
  canCreate,
  onMonthChange,
  onEdit,
  onClone,
  onCreateNew,
}: RateCalendarPanelProps) {
  const monthDate = parse(monthStr, "yyyy-MM", new Date());
  const monthStart = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(monthDate), "yyyy-MM-dd");

  const { data: calendar, isLoading: calLoading } = useRateCalendar(
    selectedPlan?.id ?? "",
    monthStart,
    monthEnd,
  );

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [overrideDate, setOverrideDate] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const updateOverride = useUpdateRateOverride();
  const deleteOverride = useDeleteRateOverride();
  const bulkOverride = useBulkRateOverride();

  const currencyCode = selectedPlan?.currencyCode ?? "USD";

  const handlePrevMonth = useCallback(() => {
    const prev = subMonths(monthDate, 1);
    onMonthChange(format(prev, "yyyy-MM"));
    setSelectedDates([]);
  }, [monthDate, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    const next = addMonths(monthDate, 1);
    onMonthChange(format(next, "yyyy-MM"));
    setSelectedDates([]);
  }, [monthDate, onMonthChange]);

  const handleToday = useCallback(() => {
    onMonthChange(format(new Date(), "yyyy-MM"));
    setSelectedDates([]);
  }, [onMonthChange]);

  const handleDateClick = useCallback(
    (date: string) => {
      setOverrideDate(date);
    },
    [],
  );

  const handleSelectionChange = useCallback((dates: string[]) => {
    setSelectedDates(dates);
  }, []);

  const handleBulkStopSell = useCallback(() => {
    if (!selectedPlan || selectedDates.length === 0) return;
    bulkOverride.mutate({
      id: selectedPlan.id,
      input: {
        startDate: selectedDates[0],
        endDate: selectedDates[selectedDates.length - 1],
        stopSell: true,
        reason: "Bulk stop sell",
      },
    });
    setSelectedDates([]);
  }, [selectedPlan, selectedDates, bulkOverride]);

  const handleClearOverrides = useCallback(() => {
    if (!selectedPlan || selectedDates.length === 0) return;
    selectedDates.forEach((date) => {
      deleteOverride.mutate({ id: selectedPlan.id, date });
    });
    setSelectedDates([]);
  }, [selectedPlan, selectedDates, deleteOverride]);

  const handleClearAllOverrides = useCallback(() => {
    if (!selectedPlan || !calendar) return;
    calendar.dates
      .filter((d) => d.overrideRate !== null)
      .forEach((d) => {
        deleteOverride.mutate({ id: selectedPlan.id, date: d.date });
      });
  }, [selectedPlan, calendar, deleteOverride]);

  if (!selectedPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-8">
        <Calendar className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-sm font-medium">Select a rate plan to view its calendar</p>
        <p className="text-xs mt-1">
          Choose a plan from the sidebar to see nightly rates and overrides.
        </p>
        {canCreate && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onCreateNew}>
            New Rate Plan
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        plan={selectedPlan}
        calendar={calendar}
        monthStr={monthStr}
        canUpdate={canUpdate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onEdit={onEdit}
        onClone={onClone}
        onBulkOverride={() => setBulkOpen(true)}
        onClearAllOverrides={handleClearAllOverrides}
      />

      <CalendarGrid
        calendar={calendar}
        monthStr={monthStr}
        selectedDates={selectedDates}
        currencyCode={currencyCode}
        onDateClick={handleDateClick}
        onSelectionChange={handleSelectionChange}
      />

      <BulkSelectionBar
        selectedCount={selectedDates.length}
        onClear={() => setSelectedDates([])}
        onSetOverride={() => setBulkOpen(true)}
        onSetStopSell={handleBulkStopSell}
        onClearOverrides={handleClearOverrides}
      />

      {overrideDate && selectedPlan && (
        <DateOverridePopover
          ratePlanId={selectedPlan.id}
          date={overrideDate}
          calendar={calendar}
          currencyCode={currencyCode}
          canUpdate={canUpdate}
          onClose={() => setOverrideDate(null)}
          onSave={(input) =>
            updateOverride.mutate({ id: selectedPlan.id, input })
          }
          onClear={(date) =>
            deleteOverride.mutate({ id: selectedPlan.id, date })
          }
        />
      )}

      {bulkOpen && selectedPlan && (
        <BulkOverrideDialog
          ratePlanId={selectedPlan.id}
          selectedDates={selectedDates}
          monthStr={monthStr}
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onApply={(input) => {
            bulkOverride.mutate({ id: selectedPlan.id, input });
            setBulkOpen(false);
            setSelectedDates([]);
          }}
        />
      )}
    </div>
  );
}
