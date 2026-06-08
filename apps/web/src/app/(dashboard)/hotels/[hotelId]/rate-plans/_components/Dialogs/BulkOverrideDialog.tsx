"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  parse,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "./Toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BulkRateOverrideInput } from "@/lib/hooks/useRatePlans";

interface BulkOverrideDialogProps {
  ratePlanId: string;
  selectedDates: string[];
  monthStr: string;
  open: boolean;
  onClose: () => void;
  onApply: (input: BulkRateOverrideInput) => void;
}

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export function BulkOverrideDialog({
  ratePlanId,
  selectedDates,
  monthStr,
  open,
  onClose,
  onApply,
}: BulkOverrideDialogProps) {
  const [overrideRate, setOverrideRate] = useState("");
  const [stopSell, setStopSell] = useState(false);
  const [minStay, setMinStay] = useState("");
  const [reason, setReason] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [allDays, setAllDays] = useState(true);

  const startDate = selectedDates[0] ?? format(startOfMonth(parse(monthStr, "yyyy-MM", new Date())), "yyyy-MM-dd");
  const endDate = selectedDates[selectedDates.length - 1] ?? format(endOfMonth(parse(monthStr, "yyyy-MM", new Date())), "yyyy-MM-dd");

  const totalDates = useMemo(() => {
    try {
      const days = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
      });
      if (allDays) return days.length;
      return days.filter((d) => daysOfWeek.includes(getDay(d))).length;
    } catch {
      return 0;
    }
  }, [startDate, endDate, allDays, daysOfWeek]);

  const handleApply = () => {
    onApply({
      startDate,
      endDate,
      rate: overrideRate ? Number(overrideRate) : undefined,
      stopSell: stopSell || undefined,
      minStay: minStay ? Number(minStay) : null,
      reason: reason || undefined,
      daysOfWeek: !allDays && daysOfWeek.length > 0 ? daysOfWeek : undefined,
    });
  };

  const toggleDay = (d: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Rate Override</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Date Range</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="date"
                value={startDate}
                readOnly
                className="h-8 text-xs flex-1"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                readOnly
                className="h-8 text-xs flex-1"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Selected: {totalDates} {totalDates === 1 ? "night" : "nights"}
            </p>
          </div>

          <div>
            <Label className="text-xs">Days of Week</Label>
            <div className="flex gap-1 mt-1">
              <Button
                variant={allDays ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => { setAllDays(true); setDaysOfWeek([]); }}
              >
                All days
              </Button>
              {DAYS_OF_WEEK.map((l, i) => (
                <Button
                  key={i}
                  variant={
                    !allDays && daysOfWeek.includes(i) ? "secondary" : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 text-xs",
                    !allDays && daysOfWeek.includes(i) && "bg-muted font-medium",
                  )}
                  onClick={() => {
                    setAllDays(false);
                    toggleDay(i);
                  }}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Override Rate</Label>
            <div className="relative mt-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                value={overrideRate}
                onChange={(e) => setOverrideRate(e.target.value)}
                disabled={stopSell}
                className="pl-6 h-8 text-sm"
                placeholder="Leave blank to keep current rate"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs cursor-pointer" onClick={() => setStopSell(!stopSell)}>
              Stop Sell
            </Label>
            <Toggle
              checked={stopSell}
              onCheckedChange={setStopSell}
            />
          </div>

          <div>
            <Label className="text-xs">Min Stay (optional)</Label>
            <Input
              type="number"
              min="0"
              value={minStay}
              onChange={(e) => setMinStay(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Reason (optional)</Label>
            <Textarea
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 h-16 text-sm resize-none"
              placeholder="e.g. Holiday weekend pricing"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {reason.length}/200
            </p>
          </div>

          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground">
              This will update{" "}
              <strong className="text-foreground">{totalDates}</strong>{" "}
              {totalDates === 1 ? "date" : "dates"}
              {!allDays && daysOfWeek.length > 0 && (
                <span>
                  {" "}({daysOfWeek.map((d) => DAYS_OF_WEEK[d]).join(", ")})
                </span>
              )}
              .
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
