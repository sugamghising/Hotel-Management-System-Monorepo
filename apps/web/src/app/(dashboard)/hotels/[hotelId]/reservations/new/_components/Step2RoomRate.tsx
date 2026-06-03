"use client";

import { useMemo, useState } from "react";
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRatePlans, useCalculateRates } from "@/lib/hooks/useRatePlans";
import { useAvailableRooms } from "@/lib/hooks/useRooms";
import { useAuthStore } from "@/stores/auth.store";
import { Check, Loader2 } from "lucide-react";
import { RatePlanCard } from "./RatePlanCard";

import type { ReservationFormData } from "./types";

interface Step2RoomRateProps {
  control: Control<ReservationFormData>;
  watch: UseFormWatch<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
  onNext: () => void;
  onBack: () => void;
  onRoomTypeChange?: (name: string) => void;
}

export function Step2RoomRate({
  control,
  watch,
  setValue,
  onNext,
  onBack,
  onRoomTypeChange,
}: Step2RoomRateProps) {
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  const step1 = watch("step1");
  const roomTypeId = watch("step2.roomTypeId");
  const ratePlanId = watch("step2.ratePlanId");
  const roomId = watch("step2.roomId");

  const { data: ratePlansData, isLoading: plansLoading } = useRatePlans({
    isActive: true,
  });

  const uniqueRoomTypes = useMemo(() => {
    const plans = ratePlansData?.ratePlans ?? [];
    const map = new Map<string, { id: string; code: string; name: string }>();
    plans.forEach((rp: any) => {
      if (rp.roomType && !map.has(rp.roomType.id)) {
        map.set(rp.roomType.id, rp.roomType);
      }
    });
    return Array.from(map.values());
  }, [ratePlansData]);

  const canCalculate =
    !!roomTypeId && !!step1.checkInDate && !!step1.checkOutDate;

  const { data: rateData, isFetching: ratesLoading } = useCalculateRates(
    {
      roomTypeId: roomTypeId || "",
      checkIn: step1.checkInDate,
      checkOut: step1.checkOutDate,
      adults: step1.adultCount,
      children: step1.childCount,
    },
    canCalculate,
  );

  const ratePlans = rateData?.availableRatePlans ?? [];

  const { data: roomsData } = useAvailableRooms(
    canCalculate && showRoomSelector
      ? { checkIn: step1.checkInDate, checkOut: step1.checkOutDate, roomTypeId }
      : null,
  );

  const availableRooms = roomsData ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Room Type</h3>
        {plansLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {uniqueRoomTypes.map((rt) => (
              <button
                key={rt.id}
                type="button"
                onClick={() => {
                  setValue("step2.roomTypeId", rt.id, { shouldValidate: true });
                  setValue("step2.ratePlanId", "", { shouldValidate: true });
                  onRoomTypeChange?.(rt.name);
                }}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-all",
                  roomTypeId === rt.id
                    ? "border-2 border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{rt.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      {rt.code}
                    </span>
                  </div>
                  {roomTypeId === rt.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowRoomSelector(!showRoomSelector)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRoomSelector
              ? "Hide specific room selection"
              : "Choose specific room (optional)"}
          </button>
          {showRoomSelector && roomTypeId && (
            <div className="mt-2">
              <FormField
                control={control}
                name="step2.roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Room</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(v) => {
                        setValue("step2.roomId", v || "", { shouldValidate: true });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.roomNumber}
                            {room.floor ? ` · Floor ${room.floor}` : ""}
                          </SelectItem>
                        ))}
                        {availableRooms.length === 0 && (
                          <SelectItem value="" disabled>
                            No available rooms
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Rate Plan</h3>
        {!roomTypeId ? (
          <div className="flex items-center justify-center h-32 rounded-lg border border-dashed text-sm text-muted-foreground">
            Select a room type first
          </div>
        ) : ratesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ratePlans.length === 0 ? (
          <div className="flex items-center justify-center h-32 rounded-lg border border-dashed text-sm text-muted-foreground">
            No rates available for selected dates
          </div>
        ) : (
          <div className="space-y-3">
            {ratePlans.map((plan: any) => {
              const rest = plan.restrictions;
              const restrictionsMet =
                rest.minStayMet && rest.maxStayMet && rest.advanceBookingMet;
              const disabledReasons: string[] = [];
              if (!rest.minStayMet) disabledReasons.push("Minimum stay not met");
              if (!rest.maxStayMet) disabledReasons.push("Maximum stay exceeded");
              if (!rest.advanceBookingMet) disabledReasons.push("Advance booking window not met");

              return (
                <RatePlanCard
                  key={plan.ratePlanId}
                  plan={plan}
                  currencyCode={plan.currencyCode || currencyCode}
                  selected={ratePlanId === plan.ratePlanId}
                  disabled={!restrictionsMet}
                  disabledReason={disabledReasons.join(". ")}
                  onSelect={() => {
                    setValue("step2.ratePlanId", plan.ratePlanId, {
                      shouldValidate: true,
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="md:col-span-2 flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!roomTypeId || !ratePlanId}>
          Next
        </Button>
      </div>
    </div>
  );
}
