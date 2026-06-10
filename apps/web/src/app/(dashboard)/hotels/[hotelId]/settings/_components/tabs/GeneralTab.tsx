"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUpdateHotelGeneral } from "@/lib/hooks/useHotelSettings";
import { propertyTypeOptions } from "@/lib/constants/hotels";
import { Loader2, Check, Lock } from "lucide-react";
import type { Hotel } from "@/lib/api/modules/hotels";

interface GeneralTabProps {
  hotel: Hotel;
  canEdit: boolean;
}

export function GeneralTab({ hotel, canEdit }: GeneralTabProps) {
  const { mutate: save, isPending } = useUpdateHotelGeneral();
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [brand, setBrand] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [starRating, setStarRating] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(hotel.name ?? "");
    setLegalName(hotel.legalName ?? "");
    setBrand(hotel.brand ?? "");
    setPropertyType(hotel.propertyType ?? "");
    setStarRating(hotel.starRating ? String(hotel.starRating) : "");
  }, [hotel]);

  const isPristine =
    name === (hotel.name ?? "") &&
    legalName === (hotel.legalName ?? "") &&
    brand === (hotel.brand ?? "") &&
    propertyType === (hotel.propertyType ?? "") &&
    starRating === (hotel.starRating ? String(hotel.starRating) : "");

  const handleSave = () => {
    save(
      {
        input: {
          name: name || undefined,
          legalName: legalName || null,
          brand: brand || null,
          propertyType: propertyType || undefined,
          starRating: starRating ? Number(starRating) : null,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">General Information</h3>
        <p className="text-sm text-muted-foreground">
          Basic identity and branding details for this property.
        </p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium">Hotel name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Legal name</Label>
          <Input
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
            placeholder="Registered legal entity name"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Brand</Label>
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
            placeholder="e.g. Marriott, IHG"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Property type</Label>
          <Select
            value={propertyType}
            onValueChange={canEdit ? setPropertyType : undefined}
          >
            <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium">Star rating</Label>
        <div className="flex items-center gap-1 mt-1.5">
          {["", "1", "2", "3", "4", "5"].map((val) => (
            <button
              key={val}
              type="button"
              disabled={!canEdit}
              onClick={() => canEdit && setStarRating(val)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                starRating === val
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              } disabled:opacity-60`}
            >
              {val === "" ? "Unrated" : `${"★".repeat(Number(val))}${"☆".repeat(5 - Number(val))}`}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-medium">Hotel code</Label>
        <div className="relative mt-1">
          <Input
            value={hotel.code}
            readOnly
            className="h-8 text-sm font-mono bg-muted pr-8"
          />
          <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Used in channel integrations. Cannot be changed.
        </p>
      </div>

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          You have view-only access to these settings.
        </p>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isPristine || isPending}
            onClick={handleSave}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                Saved
              </>
            ) : (
              "Save General Info"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
