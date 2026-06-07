"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toggle } from "./Toggle";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { CreateRatePlanInput, MealPlan, CancellationPolicy, PricingType } from "@/lib/hooks/useRatePlans";

interface RoomTypeOption {
  id: string;
  code: string;
  name: string;
}

interface CreateRatePlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateRatePlanInput) => void;
  roomTypes: RoomTypeOption[];
}

const CHANNELS = [
  { value: "DIRECT_WEB", label: "Direct Web" },
  { value: "DIRECT_PHONE", label: "Direct Phone" },
  { value: "DIRECT_WALK_IN", label: "Direct Walk-in" },
  { value: "BOOKING_COM", label: "Booking.com" },
  { value: "EXPEDIA", label: "Expedia" },
  { value: "AIRBNB", label: "Airbnb" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "TRAVEL_AGENT", label: "Travel Agent" },
];

export function CreateRatePlanDialog({
  open,
  onClose,
  onSave,
  roomTypes,
}: CreateRatePlanDialogProps) {
  const { activeHotel } = useAuthStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [pricingType, setPricingType] = useState<PricingType>("DAILY");
  const [baseRate, setBaseRate] = useState("");
  const [minAdvanceDays, setMinAdvanceDays] = useState("");
  const [maxAdvanceDays, setMaxAdvanceDays] = useState("");
  const [minStay, setMinStay] = useState("1");
  const [maxStay, setMaxStay] = useState("");
  const [isRefundable, setIsRefundable] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>("FLEXIBLE");
  const [isPublic, setIsPublic] = useState(true);
  const [channelCodes, setChannelCodes] = useState<string[]>(["DIRECT_WEB", "DIRECT_PHONE"]);
  const [mealPlan, setMealPlan] = useState<MealPlan>("ROOM_ONLY");
  const [includedAmenities, setIncludedAmenities] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""));
  };

  const handleCancellationChange = (v: CancellationPolicy) => {
    setCancellationPolicy(v);
    if (v === "NON_REFUNDABLE") {
      setIsRefundable(false);
    }
  };

  const handleSave = () => {
    if (!code || !name || !roomTypeId || !baseRate) return;
    onSave({
      code,
      name,
      description: description || undefined,
      roomTypeId,
      pricingType,
      baseRate: Number(baseRate),
      currencyCode: activeHotel?.currencyCode,
      minAdvanceDays: minAdvanceDays ? Number(minAdvanceDays) : undefined,
      maxAdvanceDays: maxAdvanceDays ? Number(maxAdvanceDays) : undefined,
      minStay: minStay ? Number(minStay) : undefined,
      maxStay: maxStay ? Number(maxStay) : undefined,
      isRefundable,
      cancellationPolicy,
      isPublic,
      channelCodes: channelCodes.length > 0 ? channelCodes : undefined,
      mealPlan,
      includedAmenities: includedAmenities
        ? includedAmenities.split(",").map((s) => s.trim())
        : undefined,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
    });
  };

  const toggleChannel = (ch: string) => {
    setChannelCodes((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  };

  const isValid = code && name && roomTypeId && baseRate && Number(baseRate) > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Rate Plan</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Plan Code *</Label>
              <Input
                value={code}
                onChange={handleCodeChange}
                className="mt-1 h-8 font-mono text-sm uppercase"
                placeholder="e.g. BAR, PROMO25"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Used in channel mappings
              </p>
            </div>

            <div>
              <Label className="text-xs font-medium">Plan Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="e.g. Best Available Rate"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 h-16 text-sm resize-none"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Room Type *</Label>
              <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name} ({rt.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">Pricing Type</Label>
              <RadioGroup
                value={pricingType}
                onValueChange={(v) => setPricingType(v as PricingType)}
                className="flex gap-3 mt-1"
              >
                {(["DAILY", "PACKAGE", "NEGOTIATED"] as const).map((pt) => (
                  <div key={pt} className="flex items-center gap-1.5">
                    <RadioGroupItem value={pt} id={`pt-${pt}`} />
                    <Label htmlFor={`pt-${pt}`} className="text-xs cursor-pointer">
                      {pt.charAt(0) + pt.slice(1).toLowerCase()}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-xs font-medium">Base Rate *</Label>
              <div className="relative mt-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {activeHotel?.currencyCode ?? "USD"}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  className="pl-14 h-8 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Advance Booking</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="Min days"
                  value={minAdvanceDays}
                  onChange={(e) => setMinAdvanceDays(e.target.value)}
                  className="h-8 text-sm flex-1"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max days"
                  value={maxAdvanceDays}
                  onChange={(e) => setMaxAdvanceDays(e.target.value)}
                  className="h-8 text-sm flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Stay Restrictions</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min="1"
                  placeholder="Min stay"
                  value={minStay}
                  onChange={(e) => setMinStay(e.target.value)}
                  className="h-8 text-sm flex-1"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxStay}
                  onChange={(e) => setMaxStay(e.target.value)}
                  className="h-8 text-sm flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Cancellation Policy</Label>
              <Select
                value={cancellationPolicy}
                onValueChange={(v) => handleCancellationChange(v as CancellationPolicy)}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLEXIBLE">Flexible (24h)</SelectItem>
                  <SelectItem value="MODERATE">Moderate (48h)</SelectItem>
                  <SelectItem value="STRICT">Strict (72h)</SelectItem>
                  <SelectItem value="NON_REFUNDABLE">Non-refundable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs cursor-pointer" onClick={() => cancellationPolicy !== "NON_REFUNDABLE" && setIsRefundable(!isRefundable)}>
                Refundable
              </Label>
              <Toggle
                checked={isRefundable}
                onCheckedChange={(v) => cancellationPolicy !== "NON_REFUNDABLE" && setIsRefundable(v)}
                disabled={cancellationPolicy === "NON_REFUNDABLE"}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                Public (visible to guests)
              </Label>
              <Toggle
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Channels</Label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {CHANNELS.map((ch) => (
                  <div key={ch.value} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`ch-${ch.value}`}
                      checked={channelCodes.includes(ch.value)}
                      onCheckedChange={() => toggleChannel(ch.value)}
                    />
                    <Label
                      htmlFor={`ch-${ch.value}`}
                      className="text-[11px] cursor-pointer"
                    >
                      {ch.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Meal Plan</Label>
              <Select value={mealPlan} onValueChange={(v) => setMealPlan(v as MealPlan)}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROOM_ONLY">Room Only</SelectItem>
                  <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                  <SelectItem value="HALF_BOARD">Half Board</SelectItem>
                  <SelectItem value="FULL_BOARD">Full Board</SelectItem>
                  <SelectItem value="ALL_INCLUSIVE">All Inclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">Included Amenities</Label>
              <Input
                value={includedAmenities}
                onChange={(e) => setIncludedAmenities(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="WiFi, Parking, ..."
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Comma-separated list
              </p>
            </div>

            <div>
              <details className="group">
                <summary className="text-xs font-medium text-muted-foreground cursor-pointer list-none flex items-center gap-1">
                  Validity (optional)
                  <span className="text-[10px] opacity-50">▼</span>
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label className="text-[11px]">Valid From</Label>
                    <Input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="mt-0.5 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Valid Until</Label>
                    <Input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-0.5 h-8 text-sm"
                    />
                    {validUntil && new Date(validUntil) < new Date() && (
                      <p className="text-[10px] text-red-500 mt-0.5">
                        Valid until is in the past
                      </p>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid} onClick={handleSave}>
            Create Rate Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
