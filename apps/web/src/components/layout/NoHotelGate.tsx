"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useHotels } from "@/lib/hooks/useHotels";
import { usePermission } from "@/lib/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Hotel, Building2, MapPin, ArrowRight } from "lucide-react";

export function NoHotelGate() {
  const router = useRouter();
  const { organizationId, setActiveHotel } = useAuthStore();
  const { data, isLoading } = useHotels();
  const canCreate = usePermission("HOTEL.CREATE");
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Hotel className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-1">Select a Hotel to Continue</h2>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
        Choose a hotel from the sidebar to access this page.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : hotels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {hotels.map((hotel) => (
            <button
              key={hotel.id}
              onClick={() => handleSelect(hotel)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left",
                "hover:border-primary hover:shadow-sm transition-all",
                "hover:-translate-y-0.5",
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{hotel.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {hotel.city}, {hotel.countryCode}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                  {hotel.code}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center max-w-sm">
          <p className="text-sm text-muted-foreground mb-4">
            No hotels found in your organization.
          </p>
          {canCreate && (
            <Button variant="outline" size="sm">
              Create your first hotel →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
