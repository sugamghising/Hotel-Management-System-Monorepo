"use client";

import { useAuthStore } from "@/stores/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  BedDouble,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

export default function HotelDashboardPage() {
  const { activeHotel } = useAuthStore();

  if (!activeHotel) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader
        title={activeHotel.name}
        subtitle={`Today's overview — ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
      />

      {/* Stat cards placeholder — real data comes in Week 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Arrivals Today",
            icon: ArrowDownToLine,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Departures Today",
            icon: ArrowUpFromLine,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "In House",
            icon: BedDouble,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Reservations",
            icon: CalendarCheck,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div
                  className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">Loading...</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-12 text-center text-muted-foreground">
        <BedDouble className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Dashboard data loads in Week 2</p>
        <p className="text-sm mt-1">The shell is working correctly.</p>
      </div>
    </div>
  );
}
