"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  roomNumber: string;
  floor: number | null;
  status: string;
  isOutOfOrder: boolean;
  cleaningPriority: number;
  currentGuest?: string;
  nextArrival?: string;
  roomType: { id: string; code: string; name: string };
}

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isPending: boolean;
  canUpdateStatus: boolean;
  canOoo: boolean;
  canBulkUpdate: boolean;
  onStatusUpdate: (roomId: string, status: string) => void;
  onOpenStatusDialog: (roomId: string) => void;
  onSetOoo: (room: any) => void;
  onRemoveOoo: (room: any) => void;
  onViewDetails: (roomId: string) => void;
  filters: React.ReactNode;
}

const PAGE_SIZE = 50;

const STATUS_BADGE: Record<string, { bg: string; text: string; border?: string }> = {
  VACANT_CLEAN: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  VACANT_DIRTY: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  VACANT_CLEANING: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
  OCCUPIED_CLEAN: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  OCCUPIED_DIRTY: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  OCCUPIED_CLEANING: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  OUT_OF_ORDER: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  RESERVED: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  BLOCKED: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
};

export function RoomList({
  rooms,
  isLoading,
  total,
  page,
  onPageChange,
  selectedIds,
  onSelectionChange,
  isPending,
  canUpdateStatus,
  canOoo,
  canBulkUpdate,
  onStatusUpdate,
  onOpenStatusDialog,
  onSetOoo,
  onRemoveOoo,
  onViewDetails,
  filters,
}: RoomListProps) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const pageIndex = page - 1;
  const displayedRooms = useMemo(
    () => rooms.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE),
    [rooms, pageIndex],
  );

  const columns: ColumnDef<Room, any>[] = useMemo(() => {
    const cols: ColumnDef<Room, any>[] = [];

    if (canBulkUpdate) {
      cols.push({
        id: "select",
        header: () => (
          <Checkbox
            checked={
              displayedRooms.length > 0 &&
              displayedRooms.every((r) => selectedSet.has(r.id))
            }
            onCheckedChange={(checked: boolean | "indeterminate") => {
              if (checked) {
                const next = new Set(selectedSet);
                displayedRooms.forEach((r) => next.add(r.id));
                onSelectionChange(Array.from(next));
              } else {
                const next = new Set(selectedSet);
                displayedRooms.forEach((r) => next.delete(r.id));
                onSelectionChange(Array.from(next));
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedSet.has(row.original.id)}
            onCheckedChange={(checked: boolean | "indeterminate") => {
              const next = new Set(selectedSet);
              if (checked) {
                next.add(row.original.id);
              } else {
                next.delete(row.original.id);
              }
              onSelectionChange(Array.from(next));
            }}
          />
        ),
        size: 80,
      });
    }

    cols.push(
      {
        accessorKey: "roomNumber",
        header: "Room",
        size: 100,
        cell: ({ row }) => {
          const room = row.original;
          return (
            <div>
              <span className="font-semibold">{room.roomNumber}</span>
              {room.floor != null && (
                <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
              )}
            </div>
          );
        },
      },
      {
        id: "type",
        header: "Type",
        size: 150,
        cell: ({ row }) => {
          const rt = row.original.roomType;
          return (
            <div>
              <span className="text-sm">{rt.name}</span>
              <p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-auto font-normal text-muted-foreground">
                  {rt.code}
                </Badge>
              </p>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const room = row.original;
          const statusInfo = ROOM_STATUS_MAP[room.status as keyof typeof ROOM_STATUS_MAP];
          const badgeStyle = STATUS_BADGE[room.status] ?? STATUS_BADGE.BLOCKED;
          return (
            <div className="flex items-center gap-1.5">
              <Badge
                className={cn(
                  "font-medium border text-[11px] px-2 py-0.5 h-auto",
                  badgeStyle.bg,
                  badgeStyle.text,
                  badgeStyle.border,
                )}
              >
                {statusInfo?.label ?? room.status}
              </Badge>
              {room.cleaningPriority > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold text-white",
                    room.cleaningPriority === 2 ? "bg-red-500" : "bg-orange-500",
                  )}
                >
                  !
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "guestNotes",
        header: "Guest / Notes",
        cell: ({ row }) => {
          const room = row.original;
          const isOccupied = room.status.startsWith("OCCUPIED");
          const isGuestPresent = !!(room.currentGuest);

          if (isOccupied && isGuestPresent) {
            return <span className="text-sm">{room.currentGuest}</span>;
          }
          if (room.status === "RESERVED" && room.nextArrival) {
            return <span className="text-sm text-muted-foreground">Arriving {room.nextArrival}</span>;
          }
          if (room.status === "OUT_OF_ORDER") {
            return <span className="text-sm italic text-muted-foreground">Out of order</span>;
          }
          return null;
        },
      },
      {
        id: "actions",
        size: 80,
        cell: ({ row }) => {
          const room = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isPending}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-medium">
                  Room {room.roomNumber}
                  <span className="block text-muted-foreground font-normal">
                    {ROOM_STATUS_MAP[room.status as keyof typeof ROOM_STATUS_MAP]?.label ?? room.status}
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

                {/* VACANT / RESERVED / BLOCKED actions */}
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
                      <DropdownMenuItem onClick={() => onStatusUpdate(room.id, "OCCUPIED_CLEANING")}>
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
        },
      },
    );

    return cols;
  }, [
    canBulkUpdate, canUpdateStatus, canOoo, isPending,
    selectedSet, displayedRooms, onSelectionChange,
    onStatusUpdate, onOpenStatusDialog, onSetOoo, onRemoveOoo, onViewDetails,
  ]);

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={displayedRooms}
        isLoading={isLoading}
        pageSize={displayedRooms.length || PAGE_SIZE}
        hidePagination
        onRowClick={(row) => onViewDetails(row.id)}
        toolbar={filters}
        emptyMessage="No rooms found."
      />

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${start}–${end} of ${total}`
            )}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-muted-foreground">
              {page + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.min(pageCount, page + 1))}
              disabled={page >= pageCount || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
