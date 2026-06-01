import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { reservationsApi } from "@/lib/api/modules/reservations";
import { toast } from "sonner";

export const RES_KEYS = {
  list: (hotelId: string, params?: any) =>
    ["reservations", "list", hotelId, params] as const,
  detail: (id: string) => ["reservations", "detail", id] as const,
  arrivals: (hotelId: string) => ["reservations", "arrivals", hotelId] as const,
  departures: (hotelId: string) =>
    ["reservations", "departures", hotelId] as const,
  inHouse: (hotelId: string) => ["reservations", "in-house", hotelId] as const,
};

const useCtx = () => {
  const organizationId = useAuthStore((s) => s.organizationId);
  const activeHotel = useAuthStore((s) => s.activeHotel);
  return { orgId: organizationId ?? "", hotelId: activeHotel?.id ?? "" };
};

export const useReservations = (params?: any) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: RES_KEYS.list(hotelId, params),
    queryFn: () => reservationsApi.list(orgId, hotelId, params),
    enabled: !!orgId && !!hotelId,
    select: (d) => d,
  });
};

export const useReservation = (id: string) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: RES_KEYS.detail(id),
    queryFn: () => reservationsApi.getById(orgId, hotelId, id),
    enabled: !!id && !!orgId && !!hotelId,
  });
};

export const useTodayArrivals = () => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: RES_KEYS.arrivals(hotelId),
    queryFn: () => reservationsApi.todayArrivals(orgId, hotelId),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 2 * 60 * 1000,
  });
};

export const useTodayDepartures = () => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: RES_KEYS.departures(hotelId),
    queryFn: () => reservationsApi.todayDepartures(orgId, hotelId),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 2 * 60 * 1000,
  });
};

export const useInHouseGuests = () => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: RES_KEYS.inHouse(hotelId),
    queryFn: () => reservationsApi.inHouse(orgId, hotelId),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 60 * 1000,
  });
};

export const useCheckIn = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      reservationsApi.checkIn(orgId, hotelId, id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RES_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: RES_KEYS.arrivals(hotelId) });
      qc.invalidateQueries({ queryKey: RES_KEYS.inHouse(hotelId) });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Guest checked in successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Check-in failed");
    },
  });
};

export const useCheckOut = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      reservationsApi.checkOut(orgId, hotelId, id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RES_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: RES_KEYS.departures(hotelId) });
      qc.invalidateQueries({ queryKey: RES_KEYS.inHouse(hotelId) });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Guest checked out successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Check-out failed");
    },
  });
};

export const useCancelReservation = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      reservationsApi.cancel(orgId, hotelId, id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RES_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: ["reservations", "list"] });
      toast.success("Reservation cancelled");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Cancellation failed");
    },
  });
};

export const useAssignRoom = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      reservationsApi.assignRoom(orgId, hotelId, id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RES_KEYS.detail(id) });
      toast.success("Room assigned");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Room assignment failed");
    },
  });
};

export const useMarkNoShow = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      reservationsApi.markNoShow(orgId, hotelId, id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RES_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: ["reservations", "list"] });
      toast.success("Marked as no-show");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to mark as no-show");
    },
  });
};

export const useCreateReservation = () => {
  const { orgId, hotelId } = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      reservationsApi.create(orgId, hotelId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations", "list"] });
      toast.success("Reservation created");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Failed to create reservation",
      );
    },
  });
};
