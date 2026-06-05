"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { NightlyRateBreakdown } from "./NightlyRateBreakdown";

const MEAL_PLAN_LABELS: Record<string, string> = {
  ROOM_ONLY: "",
  BREAKFAST: "B&B",
  HALF_BOARD: "HB",
  FULL_BOARD: "FB",
  ALL_INCLUSIVE: "AI",
};

const MEAL_PLAN_COLORS: Record<string, string> = {
  BREAKFAST: "bg-blue-100 text-blue-700",
  HALF_BOARD: "bg-teal-100 text-teal-700",
  FULL_BOARD: "bg-purple-100 text-purple-700",
  ALL_INCLUSIVE: "bg-amber-100 text-amber-700",
};

const CANCEL_POLICY_COLORS: Record<string, string> = {
  FLEXIBLE: "bg-emerald-100 text-emerald-700",
  MODERATE: "bg-yellow-100 text-yellow-700",
  STRICT: "bg-orange-100 text-orange-700",
  NON_REFUNDABLE: "bg-red-100 text-red-700",
};

interface CalculatedRatePlan {
  ratePlanId: string;
  ratePlanCode: string;
  ratePlanName: string;
  nightlyRates: Array<{
    date: string;
    baseRate: number;
    finalRate: number;
    adjustments: Array<{ description: string; amount: number }>;
  }>;
  totalNights: number;
  subtotal: number;
  taxes: number;
  total: number;
  currencyCode: string;
  restrictions: {
    minStayMet: boolean;
    maxStayMet: boolean;
    advanceBookingMet: boolean;
    cancellationPolicy: string;
  };
  inclusions: {
    mealPlan: string;
    amenities: string[];
  };
}

interface RatePlanCardProps {
  plan: CalculatedRatePlan;
  currencyCode: string;
  selected: boolean;
  disabled: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

export function RatePlanCard({
  plan,
  currencyCode,
  selected,
  disabled,
  disabledReason,
  onSelect,
}: RatePlanCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const mealPlan = plan.inclusions.mealPlan;
  const mealPlanLabel = MEAL_PLAN_LABELS[mealPlan];
  const cancelPolicy = plan.restrictions.cancellationPolicy;

  const avgRate = plan.total / plan.totalNights;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-all",
        selected
          ? "border-2 border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && !selected && "cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {plan.ratePlanName}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {plan.ratePlanCode}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {mealPlanLabel && (
              <Badge
                className={cn(
                  "text-xs font-medium",
                  MEAL_PLAN_COLORS[mealPlan] ?? "",
                )}
              >
                {mealPlanLabel}
              </Badge>
            )}
            <Badge
              className={cn(
                "text-xs font-medium",
                CANCEL_POLICY_COLORS[cancelPolicy] ?? "",
              )}
            >
              {cancelPolicy === "FLEXIBLE"
                ? "Flexible"
                : cancelPolicy === "MODERATE"
                  ? "Moderate"
                  : cancelPolicy === "STRICT"
                    ? "Strict"
                    : "Non-refundable"}
            </Badge>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold tabular-nums">
            {formatCurrency(plan.total, currencyCode)}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            avg. {formatCurrency(avgRate, currencyCode)}/night
          </p>
        </div>
        {selected && (
          <div className="shrink-0 mt-1">
            <Check className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
        <span>
          Subtotal {formatCurrency(plan.subtotal, currencyCode)} + Tax{" "}
          {formatCurrency(plan.taxes, currencyCode)} = Total{" "}
          {formatCurrency(plan.total, currencyCode)}
        </span>
      </div>

      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowBreakdown(!showBreakdown);
          }}
          className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          {showBreakdown ? (
            <>
              <ChevronUp className="h-3 w-3" /> Hide rate breakdown
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> View rate breakdown
            </>
          )}
        </Button>
      )}

      {showBreakdown && !disabled && (
        <div className="mt-3 pt-3 border-t">
          <NightlyRateBreakdown
            nightlyRates={plan.nightlyRates}
            currencyCode={plan.currencyCode || currencyCode}
          />
        </div>
      )}

      {disabled && disabledReason && (
        <p className="mt-2 text-xs text-orange-600">{disabledReason}</p>
      )}
    </button>
  );
}
