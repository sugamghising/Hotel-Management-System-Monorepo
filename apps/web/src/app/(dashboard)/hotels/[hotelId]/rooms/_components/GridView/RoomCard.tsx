"use client";

import { cn } from "@/lib/utils";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Wrench, Loader2 } from "lucide-react";

interface RoomCardRoom {
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

interface RoomCardProps {
  room: RoomCardRoom;
  isPending: boolean;
  canUpdateStatus: boolean;
  canOoo: boolean;
  onStatusUpdate: (roomId: string, status: string) => void;
  onOpenStatusDialog: (roomId: string) => void;
  onSetOoo: (room: RoomCardRoom) => void;
  onRemoveOoo: (room: RoomCardRoom) => void;
  onViewDetails: (roomId: string) => void;
}

// Status color map for RoomCard backgrounds/borders
const STATUS_STYLES: Record<string, { bg: string; border: string; dashed?: boolean }> = {
  VACANT_CLEAN: { bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700" },
  VACANT_DIRTY: { bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-300 dark:border-yellow-700" },
  VACANT_CLEANING: { bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700", dashed: true },
  OCCUPIED_CLEAN: { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700" },
  OCCUPIED_DIRTY: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-orange-300 dark:border-orange-700" },
  OCCUPIED_CLEANING: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-orange-200 dark:border-orange-700", dashed: true },
  OUT_OF_ORDER: { bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-400 dark:border-red-700" },
  RESERVED: { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700" },
  BLOCKED: { bg: "bg-gray-200 dark:bg-gray-800", border: "border-gray-400 dark:border-gray-600" },
};

const STATUS_LABELS: Record<string, string> = {
  OCCUPIED_CLEAN: "Occupied Clean",
  OCCUPIED_DIRTY: "Occupied Dirty",
  OCCUPIED_CLEANING: "Occ. Cleaning",
  VACANT_CLEAN: "Vacant Clean",
  VACANT_DIRTY: "Vacant Dirty",
  VACANT_CLEANING: "Being Cleaned",
  RESERVED: "Reserved",
  BLOCKED: "Blocked",
  OUT_OF_ORDER: "Out of Order",
};

export function RoomCard({
  room,
  isPending,
  canUpdateStatus,
  canOoo,
  onStatusUpdate,
  onOpenStatusDialog,
  onSetOoo,
  onRemoveOoo,
  onViewDetails,
}: RoomCardProps) {
  const style = STATUS_STYLES[room.status] ?? STATUS_STYLES.BLOCKED;

  const isOccupied = room.status.startsWith("OCCUPIED");
  const isVacant = room.status.startsWith("VACANT");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <button
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5",
            "w-full aspect-square rounded-lg border-2 transition-all select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            style.bg,
            style.border,
            style.dashed && "border-dashed",
            !isPending && "cursor-pointer hover:scale-105 hover:shadow-md",
            isPending && "opacity-60 pointer-events-none",
          )}
        >
          {/* Priority indicators */}
          {room.cleaningPriority === 1 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
          )}
          {room.cleaningPriority === 2 && (
            <span className="absolute top-1 right-1 flex items-center justify-center h-3 w-3 rounded-full bg-red-500 text-[8px] font-bold text-white">
              !
            </span>
          )}

          {/* Room number */}
          <span className="text-lg font-bold leading-tight">{room.roomNumber}</span>

          {/* Type code */}
          <span className="text-[10px] text-muted-foreground leading-tight">{room.roomTypeCode}</span>

          {/* Status indicator */}
          {isOccupied && room.currentGuest && (
            <span className="text-[9px] text-muted-foreground truncate max-w-[90%] leading-tight">
              {room.currentGuest.length > 12 ? room.currentGuest.slice(0, 12) + "…" : room.currentGuest}
            </span>
          )}
          {room.status === "RESERVED" && room.nextArrival && (
            <span className="text-[9px] text-muted-foreground leading-tight">
              → {room.nextArrival}
            </span>
          )}
          {room.status === "OUT_OF_ORDER" && (
            <Wrench className="h-3 w-3 text-muted-foreground" />
          )}

          {/* Pending spinner overlay */}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="w-48">
        <DropdownMenuLabel className="text-xs font-medium">
          Room {room.roomNumber}
          <span className="block text-muted-foreground font-normal">
            {STATUS_LABELS[room.status] ?? room.status}
            {room.currentGuest && ` — ${room.currentGuest}`}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onViewDetails(room.id)}>
          View Details
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onOpenStatusDialog(room.id)}>
          Change Status…
        </DropdownMenuItem>

        {/* VACANT actions */}
        {(room.status === "VACANT_CLEAN" || room.status === "VACANT_DIRTY" || room.status === "RESERVED" || room.status === "BLOCKED") && (
          <>
            <DropdownMenuSeparator />
            {room.status === "VACANT_CLEAN" && canUpdateStatus && (
              <DropdownMenuItem onClick={() => onStatusUpdate(room.id, "VACANT_DIRTY")}>
                Mark Dirty
              </DropdownMenuItem>
            )}
            {room.status === "VACANT_DIRTY" && canUpdateStatus && (
              <DropdownMenuItem onClick={() => onStatusUpdate(room.id, "VACANT_CLEAN")}>
                Mark Clean
              </DropdownMenuItem>
            )}
            {canOoo && (
              <DropdownMenuItem onClick={() => onSetOoo(room)}>
                Set Out of Order
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* OCCUPIED actions */}
        {(room.status === "OCCUPIED_CLEAN" || room.status === "OCCUPIED_DIRTY") && (
          <>
            <DropdownMenuSeparator />
            {room.status === "OCCUPIED_CLEAN" && canUpdateStatus && (
              <DropdownMenuItem onClick={() => onStatusUpdate(room.id, "OCCUPIED_DIRTY")}>
                Mark Dirty
              </DropdownMenuItem>
            )}
            {room.status === "OCCUPIED_DIRTY" && canUpdateStatus && (
              <DropdownMenuItem onClick={() => onStatusUpdate(room.id, "OCCUPIED_CLEAN")}>
                Mark Clean
              </DropdownMenuItem>
            )}
            {canUpdateStatus && (
              <DropdownMenuItem onClick={() => onStatusUpdate(room.id, room.status === "OCCUPIED_CLEAN" ? "OCCUPIED_CLEANING" : "OCCUPIED_CLEANING")}>
                Cleaning Started
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* OUT_OF_ORDER actions */}
        {room.status === "OUT_OF_ORDER" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRemoveOoo(room)}>
              Return to Service
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
