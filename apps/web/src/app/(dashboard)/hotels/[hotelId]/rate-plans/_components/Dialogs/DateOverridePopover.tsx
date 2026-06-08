"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parse } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "./Toggle";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/formatters";
import type { RateCalendarResponse, RateOverrideInput } from "@/lib/hooks/useRatePlans";

interface DateOverridePopoverProps {
  ratePlanId: string;
  date: string;
  calendar: RateCalendarResponse | undefined;
  currencyCode: string;
  canUpdate: boolean;
  onClose: () => void;
  onSave: (input: RateOverrideInput) => void;
  onClear: (date: string) => void;
}

export function DateOverridePopover({
  ratePlanId,
  date,
  calendar,
  currencyCode,
  canUpdate,
  onClose,
  onSave,
  onClear,
}: DateOverridePopoverProps) {
  const day = calendar?.dates.find((d) => d.date === date);
  const [overrideRate, setOverrideRate] = useState<string>(
    day?.overrideRate ? String(day.overrideRate) : "",
  );
  const [stopSell, setStopSell] = useState(day?.stopSell ?? false);
  const [minStay, setMinStay] = useState<string>(
    day?.minStay ? String(day.minStay) : "",
  );
  const [reason, setReason] = useState("");

  const formattedDate = useMemo(() => {
    try {
      return format(parse(date, "yyyy-MM-dd", new Date()), "EEEE, MMM d, yyyy");
    } catch {
      return date;
    }
  }, [date]);

  const handleSave = () => {
    onSave({
      date,
      rate: overrideRate ? Number(overrideRate) : day?.baseRate ?? 0,
      stopSell,
      minStay: minStay ? Number(minStay) : null,
      reason: reason || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    onClear(date);
    onClose();
  };

  const hasOverride = day?.overrideRate !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="relative bg-white rounded-lg border shadow-lg w-[280px] p-4 space-y-3">
        <div className="text-sm font-medium">{formattedDate}</div>
        <div className="text-xs text-muted-foreground">
          Current rate: {formatCurrency(day?.finalRate ?? 0, currencyCode)}
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Override Rate</Label>
            <div className="relative mt-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder={String(day?.baseRate ?? 0)}
                value={overrideRate}
                onChange={(e) => setOverrideRate(e.target.value)}
                disabled={stopSell || !canUpdate}
                className="pl-6 h-8 text-sm"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Leave blank to use base rate
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs cursor-pointer" onClick={() => canUpdate && setStopSell(!stopSell)}>
              Stop Sell
            </Label>
            <Toggle
              checked={stopSell}
              onCheckedChange={(v) => canUpdate && setStopSell(v)}
              disabled={!canUpdate}
            />
          </div>

          <div>
            <Label className="text-xs">Min Stay</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={minStay}
              onChange={(e) => setMinStay(e.target.value)}
              disabled={!canUpdate}
              className="mt-1 h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Reason (optional)</Label>
            <Input
              type="text"
              maxLength={100}
              placeholder="e.g. Holiday pricing"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!canUpdate}
              className="mt-1 h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-2">
          {canUpdate && hasOverride && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 h-7 px-2"
              onClick={handleClear}
            >
              Clear Override
            </Button>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>
              Cancel
            </Button>
            {canUpdate && (
              <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
                Save
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
