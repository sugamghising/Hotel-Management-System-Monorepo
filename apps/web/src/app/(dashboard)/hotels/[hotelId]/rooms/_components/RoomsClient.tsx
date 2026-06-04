"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  useRoomGrid,
  useRooms,
  useUpdateRoomStatus,
  useSetRoomOoo,
  useRemoveRoomOoo,
  useBulkRoomStatus,
} from "@/lib/hooks/useRooms";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { RoomsStatsBar } from "./RoomsStatsBar";
import { ViewToggle } from "./ViewToggle";
import { RoomGrid } from "./GridView/RoomGrid";
import { RoomList } from "./ListView/RoomList";
import { RoomListFilters } from "./ListView/RoomListFilters";
import { UpdateStatusDialog } from "./Dialogs/UpdateStatusDialog";
import { SetOooDialog } from "./Dialogs/SetOooDialog";
import { RemoveOooDialog } from "./Dialogs/RemoveOooDialog";
import { BulkStatusDialog } from "./Dialogs/BulkStatusDialog";

export default function RoomsClient() {
  const router = useRouter();
  const { hotelId } = useParams<{ hotelId: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeHotel = useAuthStore((s) => s.activeHotel);

  // Hooks
  const { data: grid, isLoading: gridLoading, isFetching: gridFetching } = useRoomGrid();
  const updateStatus = useUpdateRoomStatus();
  const setOoo = useSetRoomOoo();
  const removeOoo = useRemoveRoomOoo();
  const bulkStatus = useBulkRoomStatus();

  // Permissions
  const canUpdateStatus = usePermission("ROOM.STATUS_UPDATE");
  const canOoo = usePermission("ROOM.OOO_MANAGE");
  const canBulkUpdate = usePermission("ROOM.BULK_UPDATE");
  const canCreate = usePermission("ROOM.CREATE");

  // URL-synced state
  const view = searchParams.get("view") ?? "grid";
  const activeStatus = searchParams.get("status") ?? null;
  const search = searchParams.get("search") ?? "";
  const floor = searchParams.get("floor") ?? "";
  const roomTypeId = searchParams.get("roomTypeId") ?? "";
  const isOooOnly = searchParams.get("oooOnly") === "true";
  const page = Number(searchParams.get("page")) || 1;

  // Bulk selection (local state only)
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  // Dialog state
  const [statusDialogRoom, setStatusDialogRoom] = useState<any>(null);
  const [oooDialogRoom, setOooDialogRoom] = useState<any>(null);
  const [removeOooDialogRoom, setRemoveOooDialogRoom] = useState<any>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // List view data
  const roomListParams = useMemo(() => {
    if (view !== "list") return null;
    const params: Record<string, any> = {};
    if (activeStatus) params.status = activeStatus;
    if (search) params.search = search;
    if (floor) params.floor = Number(floor);
    if (roomTypeId) params.roomTypeId = roomTypeId;
    if (isOooOnly) params.isOutOfOrder = true;
    params.page = page;
    params.limit = 50;
    return params;
  }, [view, activeStatus, search, floor, roomTypeId, isOooOnly, page]);

  const { data: roomListData, isLoading: listLoading } = useRooms(roomListParams);

  // List view rooms from hook — map API Room type to component Room type
  const listRooms = useMemo(
    () =>
      (roomListData?.rooms ?? []).map((r: any) => ({
        id: r.id,
        roomNumber: r.identification?.roomNumber ?? r.roomNumber ?? "",
        floor: r.identification?.floor ?? r.floor ?? null,
        status: r.status?.current ?? r.status ?? "",
        isOutOfOrder: r.status?.isOutOfOrder ?? r.isOutOfOrder ?? false,
        cleaningPriority: r.status?.cleaningPriority ?? r.cleaningPriority ?? 0,
        currentGuest: r.currentReservation?.guestName ?? r.currentGuest ?? undefined,
        roomType: r.type ?? r.roomType ?? { id: "", code: "", name: "" },
      })),
    [roomListData?.rooms],
  );
  const totalRooms = roomListData?.pagination?.total ?? listRooms.length;

  // Compute pending state from all mutations
  const isPending = updateStatus.isPending || setOoo.isPending || removeOoo.isPending || bulkStatus.isPending;

  // Build URL helper
  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "" || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  // Navigate with URL update
  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.replace(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  // Stats bar click handler
  const handleStatsClick = useCallback(
    (status: string | null) => {
      const updates: Record<string, string | null> = { status };
      if (status !== null && view === "grid") {
        updates.view = "list";
      }
      if (page !== 1) updates.page = null;
      navigate(updates);
    },
    [navigate, view, page],
  );

  // View toggle handler
  const handleViewChange = useCallback(
    (newView: "grid" | "list") => {
      navigate({ view: newView });
    },
    [navigate],
  );

  // Dialog room helpers
  const gridRooms = useMemo(() => {
    if (!grid?.floors) return [];
    return grid.floors.flatMap((f) => f.rooms);
  }, [grid]);

  const findGridRoom = useCallback(
    (id: string) => gridRooms.find((r) => r.id === id),
    [gridRooms],
  );

  // Quick toggle status update (direct mutation)
  const handleStatusUpdate = useCallback(
    (roomId: string, status: string) => {
      updateStatus.mutate({ roomId, status });
    },
    [updateStatus],
  );

  // Open status dialog for full transition picker
  const handleOpenStatusDialog = useCallback(
    (roomId: string) => {
      const room =
        gridRooms.find((r) => r.id === roomId) ??
        listRooms.find((r) => r.id === roomId);
      if (room) {
        setStatusDialogRoom({
          id: room.id,
          roomNumber: room.roomNumber ?? room.id.slice(0, 6),
          status: room.status,
        });
      }
    },
    [gridRooms, listRooms],
  );

  // View details
  const handleViewDetails = useCallback(
    (roomId: string) => {
      router.push(`/hotels/${hotelId}/rooms/${roomId}`);
    },
    [router, hotelId],
  );

  // Stats
  const stats = grid?.stats;

  // Unique values for list filters
  const uniqueFloors = useMemo(() => {
    if (!grid?.floors) return [];
    const floors = new Set<number>();
    grid.floors.forEach((f) => {
      if (f.floor !== null) floors.add(f.floor);
    });
    return Array.from(floors).sort((a, b) => a - b);
  }, [grid]);

  const uniqueRoomTypes = useMemo(() => {
    if (!grid?.floors) return [];
    const map = new Map<string, { id: string; code: string; name: string }>();
    grid.floors.forEach((f) =>
      f.rooms.forEach((r) => {
        if (!map.has(r.roomTypeCode)) {
          map.set(r.roomTypeCode, {
            id: r.roomTypeCode,
            code: r.roomTypeCode,
            name: r.roomTypeName,
          });
        }
      }),
    );
    return Array.from(map.values());
  }, [grid]);

  const hasActiveFilters = !!(activeStatus || search || floor || roomTypeId || isOooOnly);

  // Determine rooms for bulk selection
  const selectedRoomObjects = useMemo(
    () => listRooms.filter((r) => selectedRoomIds.includes(r.id)),
    [listRooms, selectedRoomIds],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rooms"
        subtitle={stats ? `${stats.total} rooms` : "Loading..."}
        breadcrumb={[
          { label: "Dashboard", href: `/hotels/${hotelId}` },
          { label: "Rooms" },
        ]}
        actions={
          <>
            <ViewToggle view={view as "grid" | "list"} onViewChange={handleViewChange} />
            {canCreate && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast.info("Coming soon")}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Room
              </Button>
            )}
          </>
        }
      />

      <RoomsStatsBar
        stats={stats}
        isLoading={gridLoading}
        activeStatus={activeStatus}
        onStatusClick={handleStatsClick}
      />

      {view === "grid" ? (
        <div className="w-full">
          <RoomGrid
            floors={grid?.floors ?? []}
            isLoading={gridLoading}
            isFetching={gridFetching}
            activeStatus={activeStatus}
            isPending={isPending}
            canUpdateStatus={canUpdateStatus}
            canOoo={canOoo}
            onStatusUpdate={handleStatusUpdate}
            onOpenStatusDialog={handleOpenStatusDialog}
            onSetOoo={setOooDialogRoom}
            onRemoveOoo={setRemoveOooDialogRoom}
            onViewDetails={handleViewDetails}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Bulk action bar */}
          {selectedRoomIds.length > 0 && canBulkUpdate && (
            <div className="flex items-center gap-3 p-3 mb-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedRoomIds.length} room{selectedRoomIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs"
                  onClick={() => setBulkDialogOpen(true)}
                  disabled={isPending}
                >
                  Update Status
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => setSelectedRoomIds([])}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          )}

          <RoomList
            rooms={listRooms}
            isLoading={listLoading}
            total={totalRooms}
            page={page}
            onPageChange={(p) => navigate({ page: String(p) })}
            selectedIds={selectedRoomIds}
            onSelectionChange={setSelectedRoomIds}
            isPending={isPending}
            canUpdateStatus={canUpdateStatus}
            canOoo={canOoo}
            canBulkUpdate={canBulkUpdate}
            onStatusUpdate={handleStatusUpdate}
            onOpenStatusDialog={handleOpenStatusDialog}
            onSetOoo={setOooDialogRoom}
            onRemoveOoo={setRemoveOooDialogRoom}
            onViewDetails={handleViewDetails}
            filters={
              <RoomListFilters
                search={search}
                onSearchChange={(v) => navigate({ search: v || null, page: null })}
                status={activeStatus ?? ""}
                onStatusChange={(v) => navigate({ status: v || null, page: null })}
                floor={floor}
                onFloorChange={(v) => navigate({ floor: v || null, page: null })}
                roomTypeId={roomTypeId}
                onRoomTypeChange={(v) => navigate({ roomTypeId: v || null, page: null })}
                isOooOnly={isOooOnly}
                onOooOnlyChange={(v) => navigate({ oooOnly: v ? "true" : null, page: null })}
                uniqueFloors={uniqueFloors}
                uniqueRoomTypes={uniqueRoomTypes}
                hasActiveFilters={hasActiveFilters}
                onClear={() =>
                  navigate({
                    status: null,
                    search: null,
                    floor: null,
                    roomTypeId: null,
                    oooOnly: null,
                    page: null,
                  })
                }
              />
            }
          />
        </div>
      )}

      {/* Dialogs */}
      <UpdateStatusDialog
        room={statusDialogRoom}
        open={!!statusDialogRoom}
        onClose={() => setStatusDialogRoom(null)}
      />

      <SetOooDialog
        room={oooDialogRoom}
        open={!!oooDialogRoom}
        onClose={() => setOooDialogRoom(null)}
      />

      <RemoveOooDialog
        room={removeOooDialogRoom}
        open={!!removeOooDialogRoom}
        onClose={() => setRemoveOooDialogRoom(null)}
      />

      <BulkStatusDialog
        selectedRooms={selectedRoomObjects}
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />
    </div>
  );
}
