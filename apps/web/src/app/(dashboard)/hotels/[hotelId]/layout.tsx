"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useHotels } from "@/lib/hooks/useHotels";
import { NoHotelGate } from "@/components/layout/NoHotelGate";
import { Skeleton } from "@/components/ui/skeleton";

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const hotelId = params?.hotelId as string;
  const { activeHotel, setActiveHotel } = useAuthStore();
  const { data, isLoading } = useHotels();
  const hotels = data?.hotels ?? [];

  useEffect(() => {
    if (!hotelId || isLoading) return;
    if (activeHotel?.id === hotelId) return;

    const hotel = hotels.find((h) => h.id === hotelId);
    if (hotel) {
      setActiveHotel({
        id: hotel.id,
        name: hotel.name,
        code: hotel.code,
        currencyCode: hotel.currencyCode,
        timezone: hotel.timezone ?? "UTC",
        totalRooms: hotel.totalRooms,
      });
    }
  }, [hotelId, hotels, activeHotel?.id, isLoading, setActiveHotel]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const hasAccess = hotels.some((h) => h.id === hotelId);
  if (!hasAccess) {
    return <NoHotelGate />;
  }

  return <>{children}</>;
}
