"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useHotel } from "@/lib/hooks/useHotels";
import {
  useTodayArrivals,
  useTodayDepartures,
  useInHouseGuests,
} from "@/lib/hooks/useReservations";
import { useRoomGrid } from "@/lib/hooks/useRooms";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import {
  ReservationBadge,
  RoomStatusDot,
} from "@/components/status/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDate,
  formatCurrency,
  formatNights,
} from "@/lib/utils/formatters";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BedDouble,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function HotelDashboardPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const router = useRouter();
  const { activeHotel } = useAuthStore();

  const { data: hotel } = useHotel(hotelId);
  const {
    data: arrivals = [],
    isLoading: arrivalsLoading,
    refetch: refetchArrivals,
  } = useTodayArrivals();
  const { data: departures = [], isLoading: deptLoading } =
    useTodayDepartures();
  const { data: inHouse = [], isLoading: inHouseLoading } = useInHouseGuests();
  const { data: grid, isLoading: gridLoading } = useRoomGrid();

  const isLoading = arrivalsLoading || deptLoading || inHouseLoading;

  // Calculate occupancy from grid
  const occupancyPercent =
    grid && grid.stats.total > 0
      ? Math.round((grid.stats.occupied / grid.stats.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={activeHotel?.name ?? "Dashboard"}
          subtitle={formatDate(new Date(), "EEEE, MMMM d, yyyy")}
          className="mb-0"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchArrivals()}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Arrivals Today"
          value={isLoading ? "—" : arrivals.length}
          subtitle={`${arrivals.filter((r: any) => r.status.reservation === "CHECKED_IN").length} already checked in`}
          icon={<ArrowDownToLine className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
          isLoading={arrivalsLoading}
          onClick={() =>
            router.push(`/hotels/${hotelId}/reservations?status=CONFIRMED`)
          }
        />
        <StatCard
          title="Departures Today"
          value={isLoading ? "—" : departures.length}
          subtitle={`${departures.filter((r: any) => r.status.reservation === "CHECKED_OUT").length} checked out`}
          icon={<ArrowUpFromLine className="h-4 w-4 text-amber-600" />}
          iconBg="bg-amber-50"
          isLoading={deptLoading}
          onClick={() =>
            router.push(`/hotels/${hotelId}/reservations?status=CHECKED_IN`)
          }
        />
        <StatCard
          title="In House"
          value={isLoading ? "—" : inHouse.length}
          subtitle={`of ${activeHotel?.totalRooms ?? "—"} rooms`}
          icon={<BedDouble className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          isLoading={inHouseLoading}
          onClick={() =>
            router.push(`/hotels/${hotelId}/reservations?status=CHECKED_IN`)
          }
        />
        <StatCard
          title="Occupancy"
          value={isLoading ? "—" : `${occupancyPercent}%`}
          subtitle={`${grid?.stats.vacantClean ?? 0} rooms available`}
          icon={<Users className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
          isLoading={gridLoading}
          onClick={() => router.push(`/hotels/${hotelId}/rooms/grid`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            {gridLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : grid ? (
              <div className="space-y-2.5">
                {Object.entries(ROOM_STATUS_MAP).map(([key, cfg]) => {
                  const count =
                    key === "VACANT_CLEAN"
                      ? grid.stats.vacantClean
                      : key === "VACANT_DIRTY"
                        ? grid.stats.vacantDirty
                        : key === "OCCUPIED_CLEAN"
                          ? Math.round(grid.stats.occupied * 0.5)
                          : key === "OCCUPIED_DIRTY"
                            ? Math.round(grid.stats.occupied * 0.5)
                            : key === "OUT_OF_ORDER"
                              ? grid.stats.outOfOrder
                              : 0;
                  if (count === 0) return null;
                  const total = grid.stats.total;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <RoomStatusDot status={key as any} />
                        <span className="font-medium tabular-nums">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", cfg.bg)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Today's arrivals list */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Arriving Today ({arrivals.length})
            </CardTitle>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() =>
                router.push(`/hotels/${hotelId}/reservations?status=CONFIRMED`)
              }
            >
              View all →
            </Button>
          </CardHeader>
          <CardContent>
            {arrivalsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : arrivals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No arrivals today
              </div>
            ) : (
              <div className="space-y-2">
                {arrivals.slice(0, 8).map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-lg
                               hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/hotels/${hotelId}/reservations/${r.id}`)
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {r.guests.primaryGuestName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.confirmationNumber} · {formatNights(r.dates.nights)}
                        {r.rooms?.[0]?.roomNumber &&
                          ` · Room ${r.rooms[0].roomNumber}`}
                      </p>
                    </div>
                    <ReservationBadge status={r.status.reservation} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* In-house guests */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            In House ({inHouse.length})
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() =>
              router.push(`/hotels/${hotelId}/reservations?status=CHECKED_IN`)
            }
          >
            View all →
          </Button>
        </CardHeader>
        <CardContent>
          {inHouseLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : inHouse.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No guests currently in house
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {inHouse.slice(0, 12).map((g: any) => (
                <div
                  key={g.reservationId}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-card
                             hover:bg-muted/50 cursor-pointer transition-colors text-sm"
                  onClick={() =>
                    router.push(
                      `/hotels/${hotelId}/reservations/${g.reservationId}`,
                    )
                  }
                >
                  <div
                    className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700
                               flex items-center justify-center text-xs font-semibold shrink-0"
                  >
                    {g.guestName?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{g.guestName}</p>
                    <p className="text-xs text-muted-foreground">
                      Room {g.roomNumber} ·{" "}
                      {formatCurrency(g.balance, g.currencyCode)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
