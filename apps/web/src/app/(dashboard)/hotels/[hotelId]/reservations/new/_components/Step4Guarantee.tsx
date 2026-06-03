"use client";

import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const CARD_BRANDS = [
  { value: "VISA", label: "Visa" },
  { value: "MASTERCARD", label: "Mastercard" },
  { value: "AMEX", label: "Amex" },
  { value: "OTHER", label: "Other" },
];

const EXPIRY_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, "0");
  return { value: m, label: m };
});

import type { ReservationFormData } from "./types";

interface Step4GuaranteeProps {
  control: Control<ReservationFormData>;
  watch: UseFormWatch<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Guarantee({
  control,
  watch,
  setValue,
  onNext,
  onBack,
}: Step4GuaranteeProps) {
  const guaranteeType = watch("step4.guaranteeType");
  const currentYear = new Date().getFullYear();
  const expiryYears = Array.from({ length: 11 }, (_, i) => String(currentYear + i));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Guarantee Method</h3>
        <FormField
          control={control}
          name="step4.guaranteeType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {[
                    { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
                    { value: "DEPOSIT", label: "Deposit", icon: "💰" },
                    { value: "COMPANY_BILL", label: "Company Bill", icon: "🏢" },
                    { value: "NONE", label: "No Guarantee", icon: "⚠️" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                        field.value === option.value
                          ? "border-2 border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground",
                      )}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {guaranteeType === "CREDIT_CARD" && (
          <div className="rounded-lg border p-4 space-y-4 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Card brand</Label>
                <Select
                  value={watch("step4.cardBrand") || ""}
                  onValueChange={(v) =>
                    setValue("step4.cardBrand", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_BRANDS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Last 4 digits</Label>
                <FormField
                  control={control}
                  name="step4.cardLastFour"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="1234"
                          maxLength={4}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry month</Label>
                <FormField
                  control={control}
                  name="step4.cardExpiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value || ""}
                        onValueChange={(v) =>
                          setValue("step4.cardExpiryMonth", v, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPIRY_MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry year</Label>
                <FormField
                  control={control}
                  name="step4.cardExpiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value || ""}
                        onValueChange={(v) =>
                          setValue("step4.cardExpiryYear", v, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expiryYears.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Full card number is not stored. Token is handled by payment
                gateway.
              </span>
            </div>
          </div>
        )}

        {guaranteeType === "COMPANY_BILL" && (
          <div className="mt-3">
            <FormField
              control={control}
              name="step4.corporateCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name / account code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name or account code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {guaranteeType === "DEPOSIT" && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 mt-3">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Deposit amount will be calculated at checkout.
            </span>
          </div>
        )}

        {guaranteeType === "NONE" && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mt-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Reservation is not guaranteed and may be cancelled.
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Notes</h3>
        <FormField
          control={control}
          name="step4.guestNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Visible to guest..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="step4.specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special requests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests from the guest..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="step4.internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">
                Internal notes (staff only)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Internal notes for hotel staff..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
