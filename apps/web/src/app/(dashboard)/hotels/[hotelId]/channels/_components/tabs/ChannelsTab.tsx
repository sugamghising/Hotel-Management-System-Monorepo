"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useChannels } from "@/lib/hooks/useChannelManager";
import { ChannelCard } from "../ChannelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";

const SUPPORTED_CHANNELS = [
  { code: "BOOKING_COM", name: "Booking.com", icon: "B", color: "bg-blue-100 text-blue-800" },
  { code: "EXPEDIA", name: "Expedia", icon: "★", color: "bg-yellow-100 text-yellow-800" },
  { code: "AIRBNB", name: "Airbnb", icon: "⌂", color: "bg-pink-100 text-pink-800" },
  { code: "AGODA", name: "Agoda", icon: "A", color: "bg-red-100 text-red-800" },
  { code: "HOTELS_COM", name: "Hotels.com", icon: "H", color: "bg-green-100 text-green-800" },
  { code: "TRIPADVISOR", name: "TripAdvisor", icon: "T", color: "bg-teal-100 text-teal-800" },
  { code: "GDS", name: "GDS", icon: "⊙", color: "bg-purple-100 text-purple-800" },
  { code: "OTHER", name: "Other / Custom", icon: "●", color: "bg-gray-100 text-gray-800" },
] as const;

export function ChannelsTab() {
  const { activeHotel } = useAuthStore();
  const { data: channels, isLoading } = useChannels(activeHotel?.id ?? null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SUPPORTED_CHANNELS.map((supported) => {
        const channel = (channels ?? []).find(
          (c) => c.channelCode === supported.code,
        );
        return (
          <ChannelCard
            key={supported.code}
            supported={supported}
            channel={channel ?? null}
          />
        );
      })}
    </div>
  );
}
