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
import { Label } from "@/components/ui/label";
import { Toggle } from "./Toggle";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { RatePlan, CreateRatePlanInput, MealPlan, CancellationPolicy, PricingType } from "@/lib/hooks/useRatePlans";

interface RoomTypeOption {
  id: string;
  code: string;
  name: string;
}

interface EditRatePlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: Partial<CreateRatePlanInput>) => void;
  onDelete: () => void;
  onToggleActive: () => void;
  plan: RatePlan | undefined;
  roomTypes: RoomTypeOption[];
  canDelete: boolean;
  hasActiveBookings: boolean;
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

export function EditRatePlanDialog({
  open,
  onClose,
  onSave,
  onDelete,
  onToggleActive,
  plan,
  roomTypes,
  canDelete,
  hasActiveBookings,
}: EditRatePlanDialogProps) {
  const { activeHotel } = useAuthStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [roomTypeId, setRoomTypeId] = useState(plan?.roomTypeId ?? "");
  const [pricingType, setPricingType] = useState<PricingType>(plan?.pricing.type ?? "DAILY");
  const [baseRate, setBaseRate] = useState(String(plan?.pricing.baseRate ?? ""));
  const [minAdvanceDays, setMinAdvanceDays] = useState(String(plan?.restrictions.minAdvanceDays ?? ""));
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(String(plan?.restrictions.maxAdvanceDays ?? ""));
  const [minStay, setMinStay] = useState(String(plan?.restrictions.minStay ?? "1"));
  const [maxStay, setMaxStay] = useState(String(plan?.restrictions.maxStay ?? ""));
  const [isRefundable, setIsRefundable] = useState(plan?.restrictions.isRefundable ?? true);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>(
    plan?.restrictions.cancellationPolicy ?? "FLEXIBLE",
  );
  const [isPublic, setIsPublic] = useState(plan?.distribution.isPublic ?? true);
  const [channelCodes, setChannelCodes] = useState<string[]>(
    plan?.distribution.channelCodes ?? [],
  );
  const [mealPlan, setMealPlan] = useState<MealPlan>(
    plan?.inclusions.mealPlan ?? "ROOM_ONLY",
  );
  const [includedAmenities, setIncludedAmenities] = useState(
    plan?.inclusions.includedAmenities?.join(", ") ?? "",
  );
  const [validFrom, setValidFrom] = useState(plan?.validity.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(plan?.validity.validUntil ?? "");

  const handleCancellationChange = (v: CancellationPolicy) => {
    setCancellationPolicy(v);
    if (v === "NON_REFUNDABLE") {
      setIsRefundable(false);
    }
  };

  const handleSave = () => {
    onSave({
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
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    onDelete();
  };

  const toggleChannel = (ch: string) => {
    setChannelCodes((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  };

  if (!plan) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Rate Plan — {plan.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Plan Code</Label>
                <Input
                  value={plan.code}
                  readOnly
                  className="mt-1 h-8 text-sm font-mono bg-muted"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Code cannot be changed after creation
                </p>
              </div>

              <div>
                <Label className="text-xs font-medium">Plan Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full h-16 text-sm rounded-md border border-input bg-transparent px-3 py-2 resize-none"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Room Type</Label>
                <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
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
                <div className="flex gap-3 mt-1">
                  {(["DAILY", "PACKAGE", "NEGOTIATED"] as const).map((pt) => (
                    <div key={pt} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        id={`ept-${pt}`}
                        checked={pricingType === pt}
                        onChange={() => setPricingType(pt)}
                        className="h-3.5 w-3.5"
                      />
                      <label htmlFor={`ept-${pt}`} className="text-xs cursor-pointer">
                        {pt.charAt(0) + pt.slice(1).toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Base Rate</Label>
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
                    placeholder="Min"
                    value={minAdvanceDays}
                    onChange={(e) => setMinAdvanceDays(e.target.value)}
                    className="h-8 text-sm flex-1"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max"
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
                    placeholder="Min"
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
                  Public
                </Label>
                <Toggle
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Channels</Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {CHANNELS.slice(0, 4).map((ch) => (
                    <div key={ch.value} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id={`ech-${ch.value}`}
                        checked={channelCodes.includes(ch.value)}
                        onChange={() => toggleChannel(ch.value)}
                        className="h-3.5 w-3.5"
                      />
                      <label htmlFor={`ech-${ch.value}`} className="text-[11px] cursor-pointer">
                        {ch.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {CHANNELS.slice(4).map((ch) => (
                    <div key={ch.value} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id={`ech-${ch.value}`}
                        checked={channelCodes.includes(ch.value)}
                        onChange={() => toggleChannel(ch.value)}
                        className="h-3.5 w-3.5"
                      />
                      <label htmlFor={`ech-${ch.value}`} className="text-[11px] cursor-pointer">
                        {ch.label}
                      </label>
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
              </div>

              <div>
                <details className="group">
                  <summary className="text-xs font-medium text-muted-foreground cursor-pointer list-none flex items-center gap-1">
                    Validity
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
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Status</Label>
              <Toggle
                checked={plan.validity.isActive}
                onCheckedChange={() => {
                  onToggleActive();
                  onClose();
                }}
              />
              <span className="text-xs text-muted-foreground">
                {plan.validity.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {canDelete && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-800">Danger Zone</p>
              <p className="text-[11px] text-red-600 mt-1">
                Deleting a rate plan cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2 h-7 text-xs"
                disabled={hasActiveBookings}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete this rate plan
              </Button>
              {hasActiveBookings && (
                <p className="text-[10px] text-red-500 mt-1">
                  Cannot delete — plan has active bookings
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Rate Plan</DialogTitle>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="h-8 text-sm"
            placeholder='Type "DELETE" to confirm'
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setDeleteConfirmText(""); setShowDeleteConfirm(false); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleteConfirmText !== "DELETE"}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
