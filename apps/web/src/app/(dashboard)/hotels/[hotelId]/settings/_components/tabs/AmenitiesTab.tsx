"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUpdateHotelSettings } from "@/lib/hooks/useHotelSettings";
import { Loader2, Check } from "lucide-react";
import type { Hotel } from "@/lib/api/modules/hotels";

interface AmenitiesTabProps {
  hotel: Hotel;
  canEdit: boolean;
}

const AMENITY_GROUPS = [
  {
    label: "Room Amenities",
    items: [
      "WiFi", "TV", "Cable TV", "Minibar", "Safe",
      "Air Conditioning", "Heating", "Balcony", "Kitchenette",
      "Coffee Machine", "Hair Dryer", "Iron & Board",
    ],
  },
  {
    label: "Property Amenities",
    items: [
      "Swimming Pool", "Gym / Fitness Center", "Spa",
      "Restaurant", "Bar / Lounge", "Room Service",
      "Business Center", "Conference Rooms", "Concierge",
      "Parking", "Valet Parking", "Airport Shuttle",
      "Laundry Service", "Dry Cleaning", "Kids Club",
    ],
  },
  {
    label: "Accessibility",
    items: [
      "Wheelchair Accessible", "Accessible Parking",
      "Accessible Bathroom", "Elevator", "Ground Floor Rooms",
    ],
  },
];

export function AmenitiesTab({ hotel, canEdit }: AmenitiesTabProps) {
  const { mutate: save, isPending } = useUpdateHotelSettings();
  const existing = ((hotel as any).configuration?.amenities ?? []) as string[];
  const [checked, setChecked] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setChecked(existing);
  }, [existing]);

  const allItems = useMemo(() => AMENITY_GROUPS.flatMap((g) => g.items), []);

  const handleToggle = (item: string) => {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item],
    );
  };

  const handleSelectAll = () => setChecked([...allItems]);
  const handleClearAll = () => setChecked([]);

  const isPristine =
    checked.length === existing.length && checked.every((c) => existing.includes(c));

  const handleSave = () => {
    save(
      { input: { amenities: checked } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); } },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Amenities</h3>
        <p className="text-sm text-muted-foreground">
          Select the amenities available at your property. These are displayed to guests during booking.
        </p>
      </div>
      <Separator />

      {canEdit && (
        <div className="flex items-center gap-3 text-xs">
          <button onClick={handleSelectAll} className="text-primary hover:underline">Select All</button>
          <span className="text-muted-foreground">|</span>
          <button onClick={handleClearAll} className="text-muted-foreground hover:underline">Clear All</button>
        </div>
      )}

      {AMENITY_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {group.label}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {group.items.map((item) => (
              <label
                key={item}
                className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer ${!canEdit ? "opacity-70" : ""}`}
              >
                <Checkbox
                  checked={checked.includes(item)}
                  onCheckedChange={() => canEdit && handleToggle(item)}
                  disabled={!canEdit}
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

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
              "Save Amenities"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
