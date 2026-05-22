"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { hotelsApi, type Hotel } from "@/lib/api/modules/hotels";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, BedDouble, MapPin, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HotelsPage() {
  const router = useRouter();
  const { organizationId, setActiveHotel } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["hotels", organizationId],
    queryFn: () => hotelsApi.list(organizationId!),
    enabled: !!organizationId,
  });

  const handleSelect = (hotel: Hotel) => {
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
    <div>
      <PageHeader title="Select Hotel" subtitle="Choose a property to manage" />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.hotels ?? []).map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function HotelCard({
  hotel,
  onSelect,
}: {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
}) {
  return (
    <Card
      className="cursor-pointer group hover:shadow-md transition-all duration-200
                 hover:border-blue-300 hover:-translate-y-0.5"
      onClick={() => onSelect(hotel)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100
                         flex items-center justify-center group-hover:bg-blue-100
                         transition-colors"
          >
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              hotel.status === "ACTIVE"
                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                : "border-slate-200 text-slate-500",
            )}
          >
            {hotel.status}
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold mt-3">
          {hotel.name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {hotel.city}, {hotel.countryCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="h-3.5 w-3.5 shrink-0" />
            <span>{hotel.totalRooms} rooms</span>
          </div>
          {hotel.starRating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.floor(hotel.starRating) }).map(
                (_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ),
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="text-xs font-mono text-muted-foreground">
            {hotel.code}
          </span>
          <span
            className="text-xs font-medium text-blue-600 group-hover:gap-2
                           flex items-center gap-1 transition-all"
          >
            Manage
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
