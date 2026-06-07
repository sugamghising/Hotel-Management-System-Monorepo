"use client";

import { format, addMonths, subMonths, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RatePlanListItem, RateCalendarResponse } from "@/lib/hooks/useRatePlans";

interface CalendarHeaderProps {
  plan: RatePlanListItem;
  calendar: RateCalendarResponse | undefined;
  monthStr: string;
  canUpdate: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onEdit: () => void;
  onClone: () => void;
  onBulkOverride: () => void;
  onClearAllOverrides: () => void;
}

export function CalendarHeader({
  plan,
  calendar,
  monthStr,
  canUpdate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onEdit,
  onClone,
  onBulkOverride,
  onClearAllOverrides,
}: CalendarHeaderProps) {
  const currentMonth = parse(monthStr, "yyyy-MM", new Date());

  const hasValidity = plan.validFrom || plan.validUntil;
  const validity = calendar?.dates.filter((d) => !d.isValid) ?? [];

  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate">{plan.name}</span>
          <Badge variant="outline" className="text-[10px] font-mono">
            {plan.code}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {plan.roomType.name}
          </span>
          <Badge variant="secondary" className="text-[11px]">
            {formatCurrency(plan.baseRate, plan.currencyCode)}
            <span className="text-[10px] ml-0.5">/night</span>
          </Badge>
        </div>

        {canUpdate && (
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onClone}>
              Clone
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onBulkOverride}>
                  Bulk Override
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClearAllOverrides}>
                  Clear all overrides
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t">
        <Button variant="ghost" size="sm" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={onToday}>
            Today
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="flex items-center gap-3 px-4 py-1.5 border-t text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Base rate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Override
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Stop Sell
        </span>
        <span className="flex items-center gap-1 line-through">
          Not valid
        </span>
      </div>

      {hasValidity && validity.length > 0 && (
        <Alert variant="default" className="rounded-none border-0 border-t border-yellow-200 bg-yellow-50 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
          <AlertDescription className="text-xs text-yellow-800">
            This plan is valid
            {plan.validFrom ? ` from ${plan.validFrom}` : ""}
            {plan.validUntil ? ` until ${plan.validUntil}` : ""}.
            Dates outside this range are dimmed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
