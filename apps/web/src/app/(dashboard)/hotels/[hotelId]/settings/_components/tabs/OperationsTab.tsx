"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useUpdateHotelOperations,
  useUpdateHotelSettings,
} from "@/lib/hooks/useHotelSettings";
import { currencyOptions, languageOptions } from "@/lib/constants/hotels";
import { Loader2, Check } from "lucide-react";
import type { Hotel } from "@/lib/api/modules/hotels";

interface OperationsTabProps {
  hotel: Hotel;
  canEdit: boolean;
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const label = `${String(h).padStart(2, "0")}:${m}`;
  const display = new Date(2000, 0, 1, h, Number(m)).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { value: label, display: `${display} (${label})` };
});

export function OperationsTab({ hotel, canEdit }: OperationsTabProps) {
  const { mutate: saveOps, isPending: opsPending } = useUpdateHotelOperations();
  const { mutate: saveSettings, isPending: settingsPending } = useUpdateHotelSettings();

  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [earlyCheckInFee, setEarlyCheckInFee] = useState("");
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [lateCheckOutFee, setLateCheckOutFee] = useState("");
  const [expressCheckout, setExpressCheckout] = useState(false);
  const [saved, setSaved] = useState(false);

  const h = hotel as any;

  useEffect(() => {
    setCheckInTime(hotel.operations?.checkInTime ?? "15:00");
    setCheckOutTime(hotel.operations?.checkOutTime ?? "11:00");
    setCurrencyCode(hotel.operations?.currencyCode ?? "USD");
    setDefaultLanguage((hotel.operations as any)?.defaultLanguage ?? "en");
    const ops = h.configuration?.operationalSettings ?? {};
    setEarlyCheckIn(!!ops.earlyCheckInAllowed);
    setEarlyCheckInFee(ops.earlyCheckInFee ? String(ops.earlyCheckInFee) : "");
    setLateCheckOut(!!ops.lateCheckOutAllowed);
    setLateCheckOutFee(ops.lateCheckOutFee ? String(ops.lateCheckOutFee) : "");
    setExpressCheckout(!!ops.expressCheckout);
  }, [hotel, h]);

  const handleSave = () => {
    saveOps(
      { input: { checkInTime, checkOutTime, currencyCode, defaultLanguage } },
      {
        onSuccess: () => {
          saveSettings(
            {
              input: {
                operational: {
                  earlyCheckInAllowed: earlyCheckIn,
                  earlyCheckInFee: earlyCheckInFee ? Number(earlyCheckInFee) : undefined,
                  lateCheckOutAllowed: lateCheckOut,
                  lateCheckOutFee: lateCheckOutFee ? Number(lateCheckOutFee) : undefined,
                  expressCheckout,
                },
              },
            },
            { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); } },
          );
        },
      },
    );
  };

  const timeConflict = checkInTime === checkOutTime;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Check-in / Check-out</h3>
        <p className="text-sm text-muted-foreground">Default times for guest arrivals and departures.</p>
        <Separator className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Check-in time *</Label>
            <Select value={checkInTime} onValueChange={canEdit ? setCheckInTime : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>{slot.display}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Check-out time *</Label>
            <Select value={checkOutTime} onValueChange={canEdit ? setCheckOutTime : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>{slot.display}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {timeConflict && (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertDescription className="text-xs">
              Check-in and check-out times are the same. This may cause scheduling conflicts.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold">Currency & Language</h3>
        <p className="text-sm text-muted-foreground">Default currency and language for this hotel.</p>
        <Separator className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Currency *</Label>
            <Select value={currencyCode} onValueChange={canEdit ? setCurrencyCode : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Default language *</Label>
            <Select value={defaultLanguage} onValueChange={canEdit ? setDefaultLanguage : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold">Early / Late Policies</h3>
        <p className="text-sm text-muted-foreground">Flexibility options for guest arrivals and departures.</p>
        <Separator className="my-3" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium cursor-pointer">Early check-in allowed</Label>
              <p className="text-[10px] text-muted-foreground">Allow guests to check in before the standard time</p>
            </div>
            <Switch checked={earlyCheckIn} onCheckedChange={canEdit ? setEarlyCheckIn : () => {}} disabled={!canEdit} />
          </div>
          {earlyCheckIn && (
            <div className="ml-6">
              <Label className="text-xs font-medium">Early check-in fee ({currencyCode})</Label>
              <Input type="number" min="0" step="0.01" value={earlyCheckInFee} onChange={(e) => setEarlyCheckInFee(e.target.value)} className="mt-1 h-8 text-sm w-40" disabled={!canEdit} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium cursor-pointer">Late check-out allowed</Label>
              <p className="text-[10px] text-muted-foreground">Allow guests to check out after the standard time</p>
            </div>
            <Switch checked={lateCheckOut} onCheckedChange={canEdit ? setLateCheckOut : () => {}} disabled={!canEdit} />
          </div>
          {lateCheckOut && (
            <div className="ml-6">
              <Label className="text-xs font-medium">Late check-out fee ({currencyCode})</Label>
              <Input type="number" min="0" step="0.01" value={lateCheckOutFee} onChange={(e) => setLateCheckOutFee(e.target.value)} className="mt-1 h-8 text-sm w-40" disabled={!canEdit} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium cursor-pointer">Express checkout</Label>
              <p className="text-[10px] text-muted-foreground">Allow guests to check out without visiting the front desk</p>
            </div>
            <Switch checked={expressCheckout} onCheckedChange={canEdit ? setExpressCheckout : () => {}} disabled={!canEdit} />
          </div>
        </div>
      </div>

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          You have view-only access to these settings.
        </p>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button size="sm" disabled={opsPending || settingsPending} onClick={handleSave}>
            {opsPending || settingsPending ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</>
            ) : saved ? (
              <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</>
            ) : (
              "Save Operations"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
