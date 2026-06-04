"use client";

import { useState, useEffect } from "react";
import { FloorSection } from "./FloorSection";
import { Skeleton } from "@/components/ui/skeleton";

interface GridRoom {
  id: string;
  roomNumber: string;
  status: string;
  roomTypeCode: string;
  roomTypeName: string;
  isOutOfOrder: boolean;
  cleaningPriority: number;
  currentGuest?: string;
  nextArrival?: string;
}

interface GridFloor {
  floor: number | null;
  rooms: GridRoom[];
}

interface RoomGridProps {
  floors: GridFloor[];
  isLoading: boolean;
  isFetching: boolean;
  activeStatus: string | null;
  isPending: boolean;
  canUpdateStatus: boolean;
  canOoo: boolean;
  onStatusUpdate: (roomId: string, status: string) => void;
  onOpenStatusDialog: (roomId: string) => void;
  onSetOoo: (room: GridRoom) => void;
  onRemoveOoo: (room: GridRoom) => void;
  onViewDetails: (roomId: string) => void;
}

export function RoomGrid({
  floors,
  isLoading,
  isFetching,
  activeStatus,
  isPending,
  canUpdateStatus,
  canOoo,
  onStatusUpdate,
  onOpenStatusDialog,
  onSetOoo,
  onRemoveOoo,
  onViewDetails,
}: RoomGridProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!isLoading && floors.length > 0) {
      setLastUpdated(new Date());
    }
  }, [floors, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Filter rooms by active status
  const filteredFloors = activeStatus
    ? floors
        .map((floor) => ({
          ...floor,
          rooms: floor.rooms.filter((r) => r.status === activeStatus),
        }))
        .filter((floor) => floor.rooms.length > 0)
    : floors;

  // Sort floors: null last, rest ascending
  const sortedFloors = [...filteredFloors].sort((a, b) => {
    if (a.floor === null && b.floor === null) return 0;
    if (a.floor === null) return 1;
    if (b.floor === null) return -1;
    return a.floor - b.floor;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedFloors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No rooms match this status</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {isFetching && (
          <span className="flex items-center gap-1 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Refreshing…
          </span>
        )}
        <span>
          Updated {secondsAgo}s ago
        </span>
      </div>

      {sortedFloors.map((floor) => (
        <FloorSection
          key={floor.floor ?? "unassigned"}
          floor={floor.floor}
          rooms={floor.rooms}
          isPending={isPending}
          canUpdateStatus={canUpdateStatus}
          canOoo={canOoo}
          onStatusUpdate={onStatusUpdate}
          onOpenStatusDialog={onOpenStatusDialog}
          onSetOoo={onSetOoo}
          onRemoveOoo={onRemoveOoo}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
