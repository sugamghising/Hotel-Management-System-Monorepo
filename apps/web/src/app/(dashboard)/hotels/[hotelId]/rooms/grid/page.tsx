"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useRoomGrid,
  useUpdateRoomStatus,
  useBulkUpdateRoomStatus,
} from "@/lib/hooks/useRooms";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronDown } from "lucide-react";
import { usePermission } from "@/lib/hooks/usePermission";

export default function RoomGridPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { data: grid, isLoading, refetch } = useRoomGrid();
  const updateStatus = useUpdateRoomStatus();
  const bulkUpdate = useBulkUpdateRoomStatus();
  const canUpdateStatus = usePermission("ROOM.STATUS_UPDATE");

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const toggleRoom = (id: string) =>
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );

  const clearSelection = () => setSelectedRooms([]);

  // Filter visible rooms
  const filteredFloors = grid?.floors.map((floor) => ({
    ...floor,
    rooms:
      filter === "all"
        ? floor.rooms
        : floor.rooms.filter((r) => r.status === filter),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Room Grid"
        subtitle="Real-time room status board"
        breadcrumb={[
          { label: "Dashboard", href: `/hotels/${hotelId}` },
          { label: "Rooms" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Stats row */}
      {grid && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All", count: grid.stats.total },
            {
              key: "VACANT_CLEAN",
              label: "Vacant Clean",
              count: grid.stats.vacantClean,
            },
            {
              key: "VACANT_DIRTY",
              label: "Vacant Dirty",
              count: grid.stats.vacantDirty,
            },
            {
              key: "OCCUPIED_CLEAN",
              label: "Occupied",
              count: grid.stats.occupied,
            },
            {
              key: "OUT_OF_ORDER",
              label: "Out of Order",
              count: grid.stats.outOfOrder,
            },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key);
                clearSelection();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                filter === key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30",
              )}
            >
              {label}
              <Badge
                variant="secondary"
                className="h-4 min-w-[1.25rem] px-1 text-xs"
              >
                {count}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedRooms.length > 0 && canUpdateStatus && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-sm font-medium text-blue-700">
            {selectedRooms.length} room{selectedRooms.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2 ml-auto">
            {["VACANT_CLEAN", "VACANT_DIRTY", "OUT_OF_ORDER"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  bulkUpdate.mutate(
                    { roomIds: selectedRooms, status: s },
                    { onSuccess: clearSelection },
                  );
                }}
                disabled={bulkUpdate.isPending}
              >
                →{" "}
                {ROOM_STATUS_MAP[s as keyof typeof ROOM_STATUS_MAP]?.short ?? s}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Floor grid */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {(filteredFloors ?? []).map((floor) => {
            if (floor.rooms.length === 0) return null;
            return (
              <div key={floor.floor ?? "unassigned"}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {floor.floor !== null ? `Floor ${floor.floor}` : "No Floor"}
                  <span className="ml-2 font-normal normal-case tracking-normal">
                    ({floor.rooms.length} rooms)
                  </span>
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                  {floor.rooms.map((room) => {
                    const cfg =
                      ROOM_STATUS_MAP[
                        room.status as keyof typeof ROOM_STATUS_MAP
                      ];
                    const isSelected = selectedRooms.includes(room.id);
                    return (
                      <RoomCell
                        key={room.id}
                        room={room}
                        cfg={cfg}
                        isSelected={isSelected}
                        canUpdate={canUpdateStatus}
                        onToggleSelect={toggleRoom}
                        onStatusChange={(roomId, status) =>
                          updateStatus.mutate({ roomId, status })
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(ROOM_STATUS_MAP).map(([key, cfg]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span className={cn("w-2.5 h-2.5 rounded-sm", cfg.bg)} />
            {cfg.short} = {cfg.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomCell({
  room,
  cfg,
  isSelected,
  canUpdate,
  onToggleSelect,
  onStatusChange,
}: {
  room: any;
  cfg: any;
  isSelected: boolean;
  canUpdate: boolean;
  onToggleSelect: (id: string) => void;
  onStatusChange: (roomId: string, status: string) => void;
}) {
  const transitions: Record<string, string[]> = {
    VACANT_CLEAN: ["VACANT_DIRTY", "BLOCKED", "OUT_OF_ORDER"],
    VACANT_DIRTY: ["VACANT_CLEANING", "VACANT_CLEAN"],
    VACANT_CLEANING: ["VACANT_CLEAN", "VACANT_DIRTY"],
    OCCUPIED_CLEAN: ["OCCUPIED_DIRTY"],
    OCCUPIED_DIRTY: ["OCCUPIED_CLEANING", "OCCUPIED_CLEAN"],
    OCCUPIED_CLEANING: ["OCCUPIED_CLEAN", "OCCUPIED_DIRTY"],
    OUT_OF_ORDER: ["VACANT_DIRTY"],
    BLOCKED: ["VACANT_CLEAN", "VACANT_DIRTY"],
  };

  const allowedNext = transitions[room.status] ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!canUpdate}>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          onContextMenu={(e) => e.preventDefault()}
          className={cn(
            "relative group flex flex-col items-center justify-center",
            "w-full aspect-square rounded-lg border-2 text-white transition-all",
            "focus:outline-none",
            cfg?.bg ?? "bg-slate-400",
            isSelected
              ? "border-white ring-2 ring-blue-500 scale-95"
              : "border-transparent hover:border-white/40 hover:scale-105",
            room.isOutOfOrder && "opacity-70",
          )}
          onDoubleClick={() => onToggleSelect(room.id)}
        >
          <span className="text-sm font-bold leading-none">
            {room.roomNumber}
          </span>
          <span className="text-[10px] mt-0.5 opacity-80">
            {cfg?.short ?? "??"}
          </span>
          {room.cleaningPriority > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          )}
          {room.currentGuest && (
            <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] truncate px-0.5 opacity-80">
              {room.currentGuest.split(" ")[0]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-44">
        <DropdownMenuLabel className="text-xs">
          Room {room.roomNumber} — {cfg?.label}
          {room.currentGuest && (
            <span className="block font-normal text-muted-foreground">
              {room.currentGuest}
            </span>
          )}
        </DropdownMenuLabel>
        {allowedNext.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Change status
            </DropdownMenuLabel>
            {allowedNext.map((s) => {
              const c = ROOM_STATUS_MAP[s as keyof typeof ROOM_STATUS_MAP];
              return (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onStatusChange(room.id, s)}
                  className="gap-2"
                >
                  <span
                    className={cn("w-2 h-2 rounded-full shrink-0", c?.bg)}
                  />
                  {c?.label ?? s}
                </DropdownMenuItem>
              );
            })}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleSelect(room.id)}>
          {isSelected ? "Deselect" : "Select for bulk action"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
