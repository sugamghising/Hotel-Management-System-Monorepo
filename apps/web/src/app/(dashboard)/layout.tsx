"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Sidebar } from "@/components/layout/Sidebar";
import { HotelContextBar } from "@/components/layout/HotelContextBar";
import { MobileTopBar, MobileBottomNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, organizationId, _hydrated } = useAuthStore();

  useEffect(() => {
    if (_hydrated && !isAuthenticated && !organizationId) {
      router.replace("/login");
    }
  }, [_hydrated, isAuthenticated, organizationId, router]);

  if (!_hydrated) return null;

  if (!isAuthenticated && !organizationId) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <MobileTopBar />
        <HotelContextBar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
