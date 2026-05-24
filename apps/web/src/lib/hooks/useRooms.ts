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
  const { organizationId, activeHotel } = useAuthStore();
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
    refetchInterval: 60 * 1000,
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
    mutationFn: ({ roomId, status }: { roomId: string; status: string }) =>
      roomsApi.updateStatus(orgId, hotelId, roomId, status),
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
    mutationFn: ({ roomIds, status }: { roomIds: string[]; status: string }) =>
      roomsApi.bulkUpdateStatus(orgId, hotelId, roomIds, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOM_KEYS.grid(hotelId) });
      toast.success("Rooms updated");
    },
  });
};
