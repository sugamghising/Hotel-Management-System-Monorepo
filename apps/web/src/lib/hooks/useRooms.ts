import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { roomsApi } from "@/lib/api/modules/rooms";
import { toast } from "sonner";

export const ROOM_KEYS = {
  list: (hotelId: string, params?: any) =>
    ["rooms", "list", hotelId, params] as const,
  grid: (hotelId: string) => ["rooms", "grid", hotelId] as const,
  detail: (roomId: string) => ["rooms", "detail", roomId] as const,
  available: (hotelId: string, params: any) =>
    ["rooms", "available", hotelId, params] as const,
};

const useCtx = () => {
  const organizationId = useAuthStore((s) => s.organizationId);
  const activeHotel = useAuthStore((s) => s.activeHotel);
  return { orgId: organizationId ?? "", hotelId: activeHotel?.id ?? "" };
};

export const useRooms = (params?: any) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: ROOM_KEYS.list(hotelId, params),
    queryFn: () => roomsApi.list(orgId, hotelId, params),
    enabled: !!orgId && !!hotelId,
    select: (d) => d,
  });
};

export const useRoomGrid = () => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: ROOM_KEYS.grid(hotelId),
    queryFn: () => roomsApi.getGrid(orgId, hotelId),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 120 * 1000,
    select: (d) => d.grid,
  });
};

export const useRoom = (roomId: string) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: ROOM_KEYS.detail(roomId),
    queryFn: () => roomsApi.getById(orgId, hotelId, roomId),
    enabled: !!roomId && !!orgId && !!hotelId,
    select: (d) => d.room,
  });
};

export const useAvailableRooms = (
  params: {
    checkIn: string;
    checkOut: string;
    roomTypeId?: string;
  } | null,
) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: ROOM_KEYS.available(hotelId, params),
    queryFn: () => roomsApi.findAvailable(orgId, hotelId, params!),
    enabled: !!params && !!orgId && !!hotelId,
    select: (d) => d.rooms,
  });
};

export const useUpdateRoomStatus = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, status, reason, priority }: { roomId: string; status: string; reason?: string; priority?: number }) =>
      roomsApi.updateStatus(orgId, hotelId, roomId, status, reason, priority),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOM_KEYS.grid(hotelId) });
      qc.invalidateQueries({ queryKey: ["rooms", "list"] });
      toast.success("Room status updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Status update failed");
    },
  });
};

export const useBulkUpdateRoomStatus = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomIds, status, reason }: { roomIds: string[]; status: string; reason?: string }) =>
      roomsApi.bulkUpdateStatus(orgId, hotelId, roomIds, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOM_KEYS.grid(hotelId) });
      qc.invalidateQueries({ queryKey: ["rooms", "list"] });
      toast.success("Rooms updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Bulk status update failed");
    },
  });
};

export const useSetRoomOoo = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { reason: string; from: string; until: string; maintenanceRequired?: boolean } }) =>
      roomsApi.setOoo(orgId, hotelId, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOM_KEYS.grid(hotelId) });
      qc.invalidateQueries({ queryKey: ["rooms", "list"] });
      toast.success("Room set out of order");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to set room out of order");
    },
  });
};

export const useRemoveRoomOoo = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      roomsApi.removeOoo(orgId, hotelId, id, reason ? { reason } : undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOM_KEYS.grid(hotelId) });
      qc.invalidateQueries({ queryKey: ["rooms", "list"] });
      toast.success("Room returned to service");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to return room to service");
    },
  });
};

export const useBulkRoomStatus = useBulkUpdateRoomStatus;
