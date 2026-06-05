"use client";

import { RoomCard } from "./RoomCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FloorRoom {
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

interface FloorSectionProps {
  floor: number | null;
  rooms: FloorRoom[];
  isPending: boolean;
  canUpdateStatus: boolean;
  canOoo: boolean;
  onStatusUpdate: (roomId: string, status: string) => void;
  onOpenStatusDialog: (roomId: string) => void;
  onSetOoo: (room: FloorRoom) => void;
  onRemoveOoo: (room: FloorRoom) => void;
  onViewDetails: (roomId: string) => void;
}

export function FloorSection({
  floor,
  rooms,
  isPending,
  canUpdateStatus,
  canOoo,
  onStatusUpdate,
  onOpenStatusDialog,
  onSetOoo,
  onRemoveOoo,
  onViewDetails,
}: FloorSectionProps) {
  const floorLabel =
    floor === null
      ? "Unassigned Floor"
      : floor === 0
        ? "Ground Floor"
        : `Floor ${floor}`;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 flex items-center gap-2 mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {floorLabel}
        </h3>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          {rooms.length} rooms
        </Badge>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
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
    </div>
  );
}
