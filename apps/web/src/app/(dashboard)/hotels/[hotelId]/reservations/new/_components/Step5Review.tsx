"use client";

import { useMemo } from "react";
import type { UseFormWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDate,
  formatCurrency,
} from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store";
import { useCalculateRates } from "@/lib/hooks/useRatePlans";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

const CANCEL_POLICY_LABELS: Record<string, string> = {
  FLEXIBLE: "Flexible",
  MODERATE: "Moderate",
  STRICT: "Strict",
  NON_REFUNDABLE: "Non-refundable",
};

const CANCEL_POLICY_COLORS: Record<string, string> = {
  FLEXIBLE: "bg-emerald-100 text-emerald-700",
  MODERATE: "bg-yellow-100 text-yellow-700",
  STRICT: "bg-orange-100 text-orange-700",
  NON_REFUNDABLE: "bg-red-100 text-red-700",
};

const SOURCE_LABELS: Record<string, string> = {
  DIRECT_WEB: "Direct Web",
  DIRECT_PHONE: "Phone",
  DIRECT_WALKIN: "Walk-in",
  BOOKING_COM: "Booking.com",
  EXPEDIA: "Expedia",
  AIRBNB: "Airbnb",
  CORPORATE: "Corporate",
  TRAVEL_AGENT: "Travel Agent",
};

const GUARANTEE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  DEPOSIT: "Deposit",
  COMPANY_BILL: "Company Bill",
  NONE: "No Guarantee",
};

import type { ReservationFormData } from "./types";

interface Step5ReviewProps {
  watch: UseFormWatch<ReservationFormData>;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
  guestName?: string;
  roomTypeName?: string;
}

export function Step5Review({
  watch,
  onBack,
  onSubmit,
  isPending,
  guestName,
  roomTypeName,
}: Step5ReviewProps) {
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  const step1 = watch("step1");
  const step2 = watch("step2");
  const step3 = watch("step3");
  const step4 = watch("step4");
  const nights =
    step1.checkInDate && step1.checkOutDate
      ? Math.max(
          0,
          Math.floor(
            (new Date(step1.checkOutDate).getTime() -
              new Date(step1.checkInDate).getTime()) /
              86400000,
          ),
        )
      : 0;

  const { data: rateData } = useCalculateRates(
    {
      roomTypeId: step2.roomTypeId,
      checkIn: step1.checkInDate,
      checkOut: step1.checkOutDate,
      adults: step1.adultCount,
      children: step1.childCount,
    },
    !!step2.roomTypeId && !!step1.checkInDate && !!step1.checkOutDate,
  );

  const selectedPlan = useMemo(() => {
    if (!rateData?.availableRatePlans) return null;
    return rateData.availableRatePlans.find(
      (p: any) => p.ratePlanId === step2.ratePlanId,
    ) ?? null;
  }, [rateData, step2.ratePlanId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dates
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Check-in</p>
              <p className="font-medium">
                {formatDate(step1.checkInDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Check-out</p>
              <p className="font-medium">
                {formatDate(step1.checkOutDate)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">Duration</p>
              <p className="font-medium">
                {nights} night{nights !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Room &amp; Rate
          </h4>
          <div className="text-sm space-y-1">
            <p className="font-medium">{roomTypeName || "—"}</p>
            {step2.roomId && (
              <p className="text-muted-foreground text-xs">
                Selected room assigned at check-in
              </p>
            )}
            {selectedPlan && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm">{selectedPlan.ratePlanName}</span>
                {selectedPlan.inclusions?.mealPlan &&
                  MEAL_PLAN_LABELS[selectedPlan.inclusions.mealPlan] && (
                    <Badge
                      className={cn(
                        "text-[10px] h-4 px-1",
                        MEAL_PLAN_COLORS[
                          selectedPlan.inclusions.mealPlan
                        ] ?? "",
                      )}
                    >
                      {MEAL_PLAN_LABELS[selectedPlan.inclusions.mealPlan]}
                    </Badge>
                  )}
                <Badge
                  className={cn(
                    "text-[10px] h-4 px-1",
                    CANCEL_POLICY_COLORS[
                      selectedPlan.restrictions?.cancellationPolicy
                    ] ?? "",
                  )}
                >
                  {CANCEL_POLICY_LABELS[
                    selectedPlan.restrictions?.cancellationPolicy
                  ] ?? "—"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Guests
          </h4>
          <div className="text-sm space-y-1">
            <p className="font-medium">{guestName || "—"}</p>
            <p className="text-muted-foreground">
              {step1.adultCount} adult{step1.adultCount !== 1 ? "s" : ""}
              {step1.childCount > 0 &&
                `, ${step1.childCount} child${step1.childCount !== 1 ? "ren" : ""}`}
              {step1.infantCount > 0 &&
                `, ${step1.infantCount} infant${step1.infantCount !== 1 ? "s" : ""}`}
            </p>
            <p className="text-muted-foreground">
              {SOURCE_LABELS[step3.source] ?? step3.source}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Guarantee
          </h4>
          <div className="text-sm">
            <p className="font-medium">
              {GUARANTEE_LABELS[step4.guaranteeType] ?? step4.guaranteeType}
            </p>
            {step4.guaranteeType === "CREDIT_CARD" && step4.cardLastFour && (
              <p className="text-muted-foreground">
                Card ending in {step4.cardLastFour}
              </p>
            )}
          </div>
        </div>

        {(step4.guestNotes || step4.specialRequests || step4.internalNotes) && (
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </h4>
            <div className="text-sm space-y-2">
              {step4.guestNotes && (
                <div>
                  <p className="text-muted-foreground text-xs">Guest notes</p>
                  <p>{step4.guestNotes}</p>
                </div>
              )}
              {step4.specialRequests && (
                <div>
                  <p className="text-muted-foreground text-xs">
                    Special requests
                  </p>
                  <p>{step4.specialRequests}</p>
                </div>
              )}
              {step4.internalNotes && (
                <div>
                  <p className="text-muted-foreground text-xs">
                    Internal notes
                  </p>
                  <p className="text-muted-foreground">{step4.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-lg border p-4 space-y-4 sticky top-6">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Price Breakdown
          </h4>

          {selectedPlan ? (
            <div className="space-y-3">
              <div className="text-sm space-y-1.5">
                {selectedPlan.nightlyRates?.map((rate: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between tabular-nums"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(rate.date)}
                    </span>
                    <span>
                      {formatCurrency(rate.finalRate, currencyCode)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm tabular-nums">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {formatCurrency(selectedPlan.subtotal, currencyCode)}
                </span>
              </div>
              <div className="flex justify-between text-sm tabular-nums">
                <span className="text-muted-foreground">Tax</span>
                <span>
                  {formatCurrency(selectedPlan.taxes, currencyCode)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold tabular-nums">
                <span>Total</span>
                <span>
                  {formatCurrency(selectedPlan.total, currencyCode)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          <Separator />

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={onSubmit}
            disabled={isPending || !selectedPlan}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Creating..." : "Confirm Reservation"}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
