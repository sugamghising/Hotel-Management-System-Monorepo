"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { NoHotelGate } from "@/components/layout/NoHotelGate";

export default function DashboardHome() {
  const router = useRouter();
  const { activeHotel } = useAuthStore();

  useEffect(() => {
    if (activeHotel) {
      router.replace(`/hotels/${activeHotel.id}`);
    }
  }, [activeHotel, router]);

  return <NoHotelGate />;
}
