"use client";

import { cn } from "@/lib/utils";
import { Globe, Lock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import type { RatePlanListItem } from "@/lib/hooks/useRatePlans";

interface PlanListItemProps {
  plan: RatePlanListItem;
  isSelected: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  hasActiveBookings: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onClone: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export function PlanListItem({
  plan,
  isSelected,
  canUpdate,
  canDelete,
  hasActiveBookings,
  onSelect,
  onEdit,
  onClone,
  onToggleActive,
  onDelete,
}: PlanListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "group flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors border-l-2",
        isSelected
          ? "bg-blue-50 border-l-blue-500"
          : "border-l-transparent hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "mt-1.5 w-2 h-2 rounded-full shrink-0",
          plan.isActive ? "bg-emerald-500" : "bg-gray-300",
        )}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{plan.name}</span>
          <span className="text-[11px] font-mono text-muted-foreground shrink-0">
            {plan.code}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatCurrency(plan.baseRate, plan.currencyCode)}
          <span className="text-[10px]"> /night</span>
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {plan.isPublic ? (
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {canUpdate && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                Edit Settings
              </DropdownMenuItem>
            )}
            {canUpdate && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClone(); }}>
                Clone
              </DropdownMenuItem>
            )}
            {canUpdate && <DropdownMenuSeparator />}
            {canUpdate && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(); }}>
                {plan.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            )}
            {canDelete && canUpdate && <DropdownMenuSeparator />}
            {canDelete && (
              <Tooltip
                content={hasActiveBookings ? "Cannot delete — active bookings" : ""}
              >
                <DropdownMenuItem
                  disabled={hasActiveBookings}
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasActiveBookings) onDelete();
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
