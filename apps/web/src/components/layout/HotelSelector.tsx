"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useHotels } from "@/lib/hooks/useHotels";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Building2 } from "lucide-react";

export function HotelSelector() {
  const router = useRouter();
  const { activeHotel, organizationId, setActiveHotel } = useAuthStore();
  const { data, isLoading } = useHotels();
  const hotels = data?.hotels ?? [];

  const handleSelect = (hotel: (typeof hotels)[0]) => {
    setActiveHotel({
      id: hotel.id,
      name: hotel.name,
      code: hotel.code,
      currencyCode: hotel.currencyCode,
      timezone: hotel.timezone ?? "UTC",
      totalRooms: hotel.totalRooms,
    });
    router.push(`/hotels/${hotel.id}`);
  };

  if (!organizationId) return null;

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            No hotels — create one
          </span>
        </div>
      </div>
    );
  }

  if (hotels.length === 1) {
    const h = hotels[0];
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{h.name}</p>
          </div>
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            {h.propertyType ?? "Hotel"}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm",
              "border border-border hover:bg-accent transition-colors",
              "text-left",
            )}
          >
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span className="flex-1 truncate font-medium">
              {activeHotel?.name ?? "Select Hotel"}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="right"
          className="w-56 p-1 max-h-64 overflow-y-auto"
        >
          {hotels.map((hotel) => {
            const isActive = activeHotel?.id === hotel.id;
            return (
              <button
                key={hotel.id}
                onClick={() => handleSelect(hotel)}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                  "hover:bg-accent text-left",
                  isActive && "bg-primary/10 text-primary font-medium",
                )}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{hotel.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {hotel.city}, {hotel.countryCode}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1 shrink-0"
                >
                  {hotel.propertyType ?? "Hotel"}
                </Badge>
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
