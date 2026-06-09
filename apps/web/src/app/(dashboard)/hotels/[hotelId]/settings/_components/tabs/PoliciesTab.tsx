"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUpdateHotelSettings } from "@/lib/hooks/useHotelSettings";
import { smokingPolicyOptions, petPolicyOptions } from "@/lib/constants/hotels";
import { Loader2, Check } from "lucide-react";
import type { Hotel } from "@/lib/api/modules/hotels";

interface PoliciesTabProps {
  hotel: Hotel;
  canEdit: boolean;
}

export function PoliciesTab({ hotel, canEdit }: PoliciesTabProps) {
  const { mutate: save, isPending } = useUpdateHotelSettings();

  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [depositPolicy, setDepositPolicy] = useState("");
  const [childPolicy, setChildPolicy] = useState("");
  const [groupPolicy, setGroupPolicy] = useState("");
  const [smokingPolicy, setSmokingPolicy] = useState("NOT_ALLOWED");
  const [petPolicy, setPetPolicy] = useState("NOT_ALLOWED");
  const [petFee, setPetFee] = useState("");
  const [minCheckInAge, setMinCheckInAge] = useState("18");
  const [saved, setSaved] = useState(false);

  const policies = hotel.configuration?.policies ?? {};
  const ops = hotel.configuration?.operationalSettings ?? {};

  useEffect(() => {
    setCancellationPolicy((policies.cancellation as string) ?? "");
    setDepositPolicy((policies.deposit as string) ?? "");
    setChildPolicy((policies.child as string) ?? "");
    setGroupPolicy((policies.groupBooking as string) ?? "");
    setSmokingPolicy((ops.smokingPolicy as string) ?? "NOT_ALLOWED");
    setPetPolicy((ops.petPolicy as string) ?? "NOT_ALLOWED");
    setPetFee(ops.petFee ? String(ops.petFee) : "");
    setMinCheckInAge(String(ops.minCheckInAge ?? "18"));
  }, [hotel]);

  const isPristine =
    cancellationPolicy === ((policies.cancellation as string) ?? "") &&
    depositPolicy === ((policies.deposit as string) ?? "") &&
    childPolicy === ((policies.child as string) ?? "") &&
    groupPolicy === ((policies.groupBooking as string) ?? "") &&
    smokingPolicy === ((ops.smokingPolicy as string) ?? "NOT_ALLOWED") &&
    petPolicy === ((ops.petPolicy as string) ?? "NOT_ALLOWED") &&
    petFee === (ops.petFee ? String(ops.petFee) : "") &&
    minCheckInAge === String(ops.minCheckInAge ?? "18");

  const handleSave = () => {
    save(
      {
        input: {
          policies: {
            cancellation: cancellationPolicy || undefined,
            deposit: depositPolicy || undefined,
            child: childPolicy || undefined,
            groupBooking: groupPolicy || undefined,
          },
          operational: {
            smokingPolicy,
            petPolicy,
            petFee: petFee ? Number(petFee) : undefined,
            minCheckInAge: minCheckInAge ? Number(minCheckInAge) : undefined,
          },
        },
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); } },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Guest Policies</h3>
        <p className="text-sm text-muted-foreground">Default policies applied to guest bookings.</p>
        <Separator className="my-3" />
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Cancellation Policy</Label>
            <Textarea value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} className="mt-1 h-16 text-sm resize-none" disabled={!canEdit} placeholder="Describe your default cancellation policy..." />
          </div>
          <div>
            <Label className="text-xs font-medium">Deposit Policy</Label>
            <Textarea value={depositPolicy} onChange={(e) => setDepositPolicy(e.target.value)} className="mt-1 h-14 text-sm resize-none" disabled={!canEdit} placeholder="Describe deposit requirements..." />
          </div>
          <div>
            <Label className="text-xs font-medium">Child Policy</Label>
            <Textarea value={childPolicy} onChange={(e) => setChildPolicy(e.target.value)} className="mt-1 h-14 text-sm resize-none" disabled={!canEdit} placeholder="Age limits, extra bed policy, charges..." />
          </div>
          <div>
            <Label className="text-xs font-medium">Group Booking Policy</Label>
            <Textarea value={groupPolicy} onChange={(e) => setGroupPolicy(e.target.value)} className="mt-1 h-14 text-sm resize-none" disabled={!canEdit} placeholder="Minimum rooms, deposit requirements..." />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold">House Rules</h3>
        <p className="text-sm text-muted-foreground">Property-specific rules and restrictions.</p>
        <Separator className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Smoking Policy</Label>
            <Select value={smokingPolicy} onValueChange={canEdit ? setSmokingPolicy : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {smokingPolicyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Pet Policy</Label>
            <Select value={petPolicy} onValueChange={canEdit ? setPetPolicy : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {petPolicyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {petPolicy === "ALLOWED_FEE" && (
            <div>
              <Label className="text-xs font-medium">Pet fee</Label>
              <Input type="number" min="0" step="0.01" value={petFee} onChange={(e) => setPetFee(e.target.value)} className="mt-1 h-8 text-sm w-40" disabled={!canEdit} />
            </div>
          )}
          <div>
            <Label className="text-xs font-medium">Minimum check-in age</Label>
            <Input type="number" min="0" value={minCheckInAge} onChange={(e) => setMinCheckInAge(e.target.value)} className="mt-1 h-8 text-sm w-40" disabled={!canEdit} placeholder="18" />
            <p className="text-[10px] text-muted-foreground mt-0.5">Minimum age to check in without adult</p>
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
          <Button size="sm" disabled={isPristine || isPending} onClick={handleSave}>
            {isPending ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</>
            ) : saved ? (
              <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</>
            ) : (
              "Save Policies"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
