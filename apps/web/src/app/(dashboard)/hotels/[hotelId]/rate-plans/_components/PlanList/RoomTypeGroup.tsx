"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PlanListItem } from "./PlanListItem";
import type { RatePlanListItem } from "@/lib/hooks/useRatePlans";

interface RoomTypeGroupProps {
  roomTypeName: string;
  plans: RatePlanListItem[];
  selectedPlanId: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  hasActiveBookings: (planId: string) => boolean;
  onSelectPlan: (id: string) => void;
  onEditPlan: (id: string) => void;
  onClonePlan: (id: string) => void;
  onTogglePlanActive: (id: string, current: boolean) => void;
  onDeletePlan: (id: string) => void;
}

export function RoomTypeGroup({
  roomTypeName,
  plans,
  selectedPlanId,
  canUpdate,
  canDelete,
  hasActiveBookings,
  onSelectPlan,
  onEditPlan,
  onClonePlan,
  onTogglePlanActive,
  onDeletePlan,
}: RoomTypeGroupProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
        className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground cursor-pointer hover:bg-gray-100/50 border-b"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="truncate">{roomTypeName}</span>
        <span className="text-[11px] font-normal text-muted-foreground ml-auto shrink-0">
          {plans.length} {plans.length === 1 ? "plan" : "plans"}
        </span>
      </div>

      {expanded && (
        <div>
          {plans.map((plan) => (
            <PlanListItem
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              canUpdate={canUpdate}
              canDelete={canDelete}
              hasActiveBookings={hasActiveBookings(plan.id)}
              onSelect={() => onSelectPlan(plan.id)}
              onEdit={() => onEditPlan(plan.id)}
              onClone={() => onClonePlan(plan.id)}
              onToggleActive={() => onTogglePlanActive(plan.id, plan.isActive)}
              onDelete={() => onDeletePlan(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
