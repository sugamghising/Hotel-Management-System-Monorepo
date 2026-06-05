"use client";

import { useAuthStore } from "@/stores/auth.store";
import {
  useTodayArrivals,
  useTodayDepartures,
  useInHouseGuests,
} from "@/lib/hooks/useReservations";
import { useRoomGrid } from "@/lib/hooks/useRooms";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { RoomStatusDot } from "@/components/status/StatusBadge";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LogIn,
  LogOut,
  Users,
  BedDouble,
  RefreshCw,
  Building2,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { AlertBanners } from "./AlertBanners";
import { ArrivalsTable } from "./ArrivalsTable";
import { RoomStatusBreakdown } from "./RoomStatusBreakdown";

interface DashboardClientProps {
  hotelId: string;
}

export function DashboardClient({ hotelId }: DashboardClientProps) {
  const { activeHotel } = useAuthStore();

  const {
    data: arrivals = [],
    isLoading: arrivalsLoading,
    isError: arrivalsError,
    refetch: refetchArrivals,
  } = useTodayArrivals();
  const {
    data: departures = [],
    isLoading: deptLoading,
    isError: deptError,
    refetch: refetchDepartures,
  } = useTodayDepartures();
  const {
    data: inHouse = [],
    isLoading: inHouseLoading,
    isError: inHouseError,
    refetch: refetchInHouse,
  } = useInHouseGuests();
  const {
    data: grid,
    isLoading: gridLoading,
    isError: gridError,
    refetch: refetchGrid,
  } = useRoomGrid();

  const canCreateReservation = usePermission("RESERVATION.CREATE");

  if (!activeHotel) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Building2 className="h-12 w-12 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Select a Hotel
        </h2>
        <p className="text-sm">
          Choose a hotel from the sidebar to view its dashboard.
        </p>
      </div>
    );
  }

  const currencyCode = activeHotel.currencyCode;

  const checkedInCount = arrivals.filter(
    (r: any) => r.status?.reservation === "CHECKED_IN",
  ).length;
  const checkedOutCount = departures.filter(
    (r: any) => r.status?.reservation === "CHECKED_OUT",
  ).length;

  const occupancyPct =
    grid && grid.stats.total > 0
      ? Math.round((grid.stats.occupied / grid.stats.total) * 100)
      : 0;

  const occupancyColor =
    occupancyPct >= 70
      ? "text-emerald-600"
      : occupancyPct >= 40
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeHotel.name}
        subtitle={formatDate(new Date(), "EEEE, d MMMM yyyy")}
        actions={
          canCreateReservation && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.info("Coming soon")}
              >
                Walk-in
              </Button>
              <Button
                size="sm"
                onClick={() => toast.info("Coming soon")}
              >
                New Reservation
              </Button>
            </div>
          )
        }
      />

      <AlertBanners
        outOfOrder={grid?.stats.outOfOrder}
        vacantDirty={grid?.stats.vacantDirty}
        isLoading={gridLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {arrivalsError ? (
          <ErrorCard
            label="Arrivals Today"
            onRetry={() => refetchArrivals()}
          />
        ) : (
          <StatCard
            icon={<LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            label="Arrivals Today"
            value={arrivals.length}
            description={`${checkedInCount} checked in so far`}
            isLoading={arrivalsLoading}
          />
        )}

        {deptError ? (
          <ErrorCard
            label="Departures Today"
            onRetry={() => refetchDepartures()}
          />
        ) : (
          <StatCard
            icon={
              <LogOut className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            }
            label="Departures Today"
            value={departures.length}
            description={`${checkedOutCount} checked out so far`}
            isLoading={deptLoading}
          />
        )}

        {inHouseError ? (
          <ErrorCard
            label="In House"
            onRetry={() => refetchInHouse()}
          />
        ) : (
          <StatCard
            icon={
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            }
            label="In House"
            value={inHouse.length}
            description="guests currently staying"
            isLoading={inHouseLoading}
          />
        )}

        {gridError ? (
          <ErrorCard label="Occupancy" onRetry={() => refetchGrid()} />
        ) : (
          <StatCard
            icon={
              <BedDouble className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            }
            label="Occupancy"
            value={`${occupancyPct}%`}
            description={
              grid
                ? `${grid.stats.occupied} of ${grid.stats.total} rooms`
                : "—"
            }
            isLoading={gridLoading}
            valueClassName={occupancyColor}
          />
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {gridLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-8" />
                </CardContent>
              </Card>
            ))
          : grid && (
              <>
                <RoomMiniCard
                  label={ROOM_STATUS_MAP.VACANT_CLEAN.label}
                  count={grid.stats.vacantClean}
                  dotColor={ROOM_STATUS_MAP.VACANT_CLEAN.bg}
                />
                <RoomMiniCard
                  label={ROOM_STATUS_MAP.VACANT_DIRTY.label}
                  count={grid.stats.vacantDirty}
                  dotColor={ROOM_STATUS_MAP.VACANT_DIRTY.bg}
                />
                <RoomMiniCard
                  label="Occupied"
                  count={grid.stats.occupied}
                  dotColor="bg-blue-500"
                />
                <RoomMiniCard
                  label={ROOM_STATUS_MAP.OUT_OF_ORDER.label}
                  count={grid.stats.outOfOrder}
                  dotColor={ROOM_STATUS_MAP.OUT_OF_ORDER.bg}
                />
                <RoomMiniCard
                  label="Total"
                  count={grid.stats.total}
                  dotColor="bg-slate-400"
                />
              </>
            )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ArrivalsTable
          arrivals={arrivals}
          isLoading={arrivalsLoading}
          hotelId={hotelId}
          currencyCode={currencyCode}
        />

        <RoomStatusBreakdown
          grid={grid}
          isLoading={gridLoading}
          hotelId={hotelId}
        />
      </div>
    </div>
  );
}

function RoomMiniCard({
  label,
  count,
  dotColor,
}: {
  label: string;
  count: number;
  dotColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dotColor)} />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-bold tabular-nums">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorCard({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Failed to load {label.toLowerCase()}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
