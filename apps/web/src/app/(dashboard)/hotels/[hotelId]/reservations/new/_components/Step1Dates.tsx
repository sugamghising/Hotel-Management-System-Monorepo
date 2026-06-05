"use client";

import { useCallback } from "react";
import type { Control, UseFormWatch, UseFormSetValue, FormState } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { formatDate, nightsBetween } from "@/lib/utils/formatters";

import type { ReservationFormData } from "./types";

interface Step1DatesProps {
  control: Control<ReservationFormData>;
  watch: UseFormWatch<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
  formState: FormState<ReservationFormData>;
  onNext: () => void;
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm tabular-nums font-medium">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function Step1Dates({
  control,
  watch,
  setValue,
  formState,
  onNext,
}: Step1DatesProps) {
  const today = new Date().toISOString().split("T")[0];
  const checkIn = watch("step1.checkInDate");
  const checkOut = watch("step1.checkOutDate");
  const adultCount = watch("step1.adultCount");
  const childCount = watch("step1.childCount");
  const infantCount = watch("step1.infantCount");

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const totalGuests = adultCount + childCount + infantCount;

  const checkInMin = today;
  const checkOutMin = checkIn || today;

  const hasErrors = !!formState.errors.step1;
  const allFilled = !!checkIn && !!checkOut;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Stay Dates</h3>
        <FormField
          control={control}
          name="step1.checkInDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-in date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={checkInMin}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="step1.checkOutDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-out date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={checkOutMin}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {nights > 0 && (
          <p className="text-sm text-muted-foreground">
            {nights} night{nights !== 1 ? "s" : ""} ·{" "}
            {checkIn && formatDate(checkIn)} → {checkOut && formatDate(checkOut)}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Guests</h3>
        <div className="space-y-3">
          <Stepper
            label="Adults"
            value={adultCount}
            min={1}
            max={10}
            onChange={(v) => setValue("step1.adultCount", v, { shouldValidate: true })}
          />
          <Stepper
            label="Children"
            value={childCount}
            min={0}
            max={10}
            onChange={(v) => setValue("step1.childCount", v, { shouldValidate: true })}
          />
          <Stepper
            label="Infants"
            value={infantCount}
            min={0}
            max={10}
            onChange={(v) => setValue("step1.infantCount", v, { shouldValidate: true })}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {totalGuests} guest{totalGuests !== 1 ? "s" : ""} (
          {[
            `${adultCount} adult${adultCount !== 1 ? "s" : ""}`,
            childCount > 0 && `${childCount} child${childCount !== 1 ? "ren" : ""}`,
            infantCount > 0 && `${infantCount} infant${infantCount !== 1 ? "s" : ""}`,
          ]
            .filter(Boolean)
            .join(", ")}
          )
        </p>
      </div>

      <div className="md:col-span-2 flex justify-end pt-2">
        <Button onClick={onNext} disabled={!allFilled || hasErrors}>
          Next
        </Button>
      </div>
    </div>
  );
}
