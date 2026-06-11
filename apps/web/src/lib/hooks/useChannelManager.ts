import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export type ChannelCode =
  | "BOOKING_COM"
  | "EXPEDIA"
  | "AIRBNB"
  | "AGODA"
  | "HOTELS_COM"
  | "DIRECT"
  | "TRIPADVISOR"
  | "GDS"
  | "OTHER";

export type ChannelStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR"
  | "PENDING"
  | "RATE_LIMITED";

export interface Channel {
  id: string;
  hotelId: string;
  channelCode: ChannelCode;
  channelName: string;
  status: ChannelStatus;
  isActive: boolean;
  credentials: Record<string, any>;
  settings: {
    syncFrequencyMinutes: number;
    pushAvailability: boolean;
    pushRates: boolean;
    minAdvanceDays: number;
    maxAdvanceDays: number;
  };
  lastSyncAt: string | null;
  lastSyncStatus: "SUCCESS" | "FAILED" | "PARTIAL" | null;
  lastSyncError: string | null;
  totalBookings: number;
  createdAt: string;
}

export interface ChannelMapping {
  id: string;
  channelId: string;
  roomTypeId: string;
  roomTypeName: string;
  channelRoomTypeCode: string;
  channelRoomTypeName: string;
  ratePlanId: string | null;
  ratePlanName: string | null;
  channelRatePlanCode: string | null;
  isActive: boolean;
}

export interface ChannelBooking {
  id: string;
  channelId: string;
  channelCode: ChannelCode;
  channelName: string;
  channelBookingRef: string;
  reservationId: string | null;
  guestName: string;
  guestEmail: string | null;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  currencyCode: string;
  status: "CONFIRMED" | "CANCELLED" | "MODIFIED" | "NO_SHOW";
  receivedAt: string;
  processedAt: string | null;
}

export interface ChannelSyncLog {
  id: string;
  channelId: string;
  channelName: string;
  syncType: "AVAILABILITY" | "RATES" | "BOOKINGS" | "FULL";
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  recordsPushed: number;
  recordsFailed: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

export interface ConnectChannelInput {
  channelCode: ChannelCode;
  credentials: Record<string, string>;
  settings?: Partial<Channel["settings"]>;
}

export interface UpdateChannelInput {
  credentials?: Record<string, string>;
  settings?: Partial<Channel["settings"]>;
  isActive?: boolean;
}

export interface UpdateMappingsInput {
  mappings: Array<{
    roomTypeId: string;
    channelRoomTypeCode: string;
    channelRoomTypeName: string;
    ratePlanId?: string | null;
    channelRatePlanCode?: string | null;
    isActive: boolean;
  }>;
}

export interface PushAvailabilityInput {
  dateFrom: string;
  dateTo: string;
  channelIds?: string[];
  roomTypeIds?: string[];
}

export interface ChannelBookingsFilter {
  channelId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface BookingsResponse {
  bookings: ChannelBooking[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SyncLogsResponse {
  logs: ChannelSyncLog[];
}

export const CHANNEL_KEYS = {
  list: (orgId: string, hotelId: string) =>
    ["channels", "list", orgId, hotelId] as const,
  detail: (orgId: string, hotelId: string, channelId: string) =>
    ["channels", "detail", orgId, hotelId, channelId] as const,
  mappings: (orgId: string, hotelId: string, channelId: string) =>
    ["channels", "mappings", orgId, hotelId, channelId] as const,
  bookings: (orgId: string, hotelId: string, filters: ChannelBookingsFilter) =>
    ["channels", "bookings", orgId, hotelId, filters] as const,
  syncLogs: (orgId: string, hotelId: string, channelId?: string) =>
    ["channels", "sync-logs", orgId, hotelId, channelId] as const,
};

const useCtx = () => {
  const organizationId = useAuthStore((s) => s.organizationId);
  const activeHotel = useAuthStore((s) => s.activeHotel);
  return { orgId: organizationId ?? "", hotelId: activeHotel?.id ?? "" };
};

export const useChannels = (hotelId: string | null) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: CHANNEL_KEYS.list(orgId, hotelId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/hotels/${hotelId}/channels`)
        .then((r) => r.data.data as Channel[]),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 120_000,
    select: (data) =>
      [...data].sort((a, b) => {
        if (a.status === "CONNECTED" && b.status !== "CONNECTED") return -1;
        if (a.status !== "CONNECTED" && b.status === "CONNECTED") return 1;
        return a.channelName.localeCompare(b.channelName);
      }),
  });
};

export const useChannel = (hotelId: string | null, channelId: string | null) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: CHANNEL_KEYS.detail(orgId, hotelId ?? "", channelId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/hotels/${hotelId}/channels/${channelId}`)
        .then((r) => r.data.data as Channel),
    enabled: !!orgId && !!hotelId && !!channelId,
  });
};

export const useChannelMappings = (hotelId: string | null, channelId: string | null) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: CHANNEL_KEYS.mappings(orgId, hotelId ?? "", channelId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/hotels/${hotelId}/channels/${channelId}/mappings`)
        .then((r) => r.data.data as ChannelMapping[]),
    enabled: !!orgId && !!hotelId && !!channelId,
  });
};

export const useChannelBookings = (
  hotelId: string | null,
  filters: ChannelBookingsFilter,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: CHANNEL_KEYS.bookings(orgId, hotelId ?? "", filters),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/hotels/${hotelId}/channels/bookings`, { params: filters })
        .then((r) => r.data.data as BookingsResponse),
    enabled: !!orgId && !!hotelId,
  });
};

export const useChannelSyncLogs = (
  hotelId: string | null,
  channelId?: string,
  enabled?: boolean,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: CHANNEL_KEYS.syncLogs(orgId, hotelId ?? "", channelId),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/hotels/${hotelId}/channels/sync-logs`, {
          params: channelId ? { channelId } : undefined,
        })
        .then((r) => r.data.data as SyncLogsResponse),
    enabled: (enabled ?? true) && !!orgId && !!hotelId,
    refetchInterval: enabled ? 30_000 : undefined,
  });
};

export const useConnectChannel = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      input,
    }: {
      hotelId: string;
      input: ConnectChannelInput;
    }) =>
      apiClient
        .post(`/${orgId}/hotels/${hotelId}/channels`, input)
        .then((r) => r.data.data as Channel),
    onSuccess: (data, { hotelId }) => {
      qc.invalidateQueries({ queryKey: ["channels", "list", orgId, hotelId] });
      toast.success(`${data.channelName} connected successfully`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to connect channel"),
  });
};

export const useUpdateChannel = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      channelId,
      input,
    }: {
      hotelId: string;
      channelId: string;
      input: UpdateChannelInput;
    }) =>
      apiClient.patch(`/${orgId}/hotels/${hotelId}/channels/${channelId}`, input),
    onSuccess: (_data, { hotelId, channelId }) => {
      qc.invalidateQueries({
        queryKey: ["channels", "detail", orgId, hotelId, channelId],
      });
      qc.invalidateQueries({ queryKey: ["channels", "list", orgId, hotelId] });
      toast.success("Channel updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update channel"),
  });
};

export const useDisconnectChannel = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      channelId,
    }: {
      hotelId: string;
      channelId: string;
    }) =>
      apiClient.delete(`/${orgId}/hotels/${hotelId}/channels/${channelId}`),
    onSuccess: (_data, { hotelId }) => {
      qc.invalidateQueries({ queryKey: ["channels", "list", orgId, hotelId] });
      toast.success("Channel disconnected");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to disconnect channel"),
  });
};

export const useToggleChannel = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      channelId,
      isActive,
    }: {
      hotelId: string;
      channelId: string;
      isActive: boolean;
    }) =>
      apiClient.patch(`/${orgId}/hotels/${hotelId}/channels/${channelId}`, {
        isActive,
      }),
    onSuccess: (_data, { hotelId, channelId, isActive }) => {
      qc.invalidateQueries({ queryKey: ["channels", "list", orgId, hotelId] });
      qc.invalidateQueries({
        queryKey: ["channels", "detail", orgId, hotelId, channelId],
      });
      toast.success(isActive ? "Channel activated" : "Channel paused");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to toggle channel"),
  });
};

export const useUpdateMappings = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      channelId,
      input,
    }: {
      hotelId: string;
      channelId: string;
      input: UpdateMappingsInput;
    }) =>
      apiClient.patch(
        `/${orgId}/hotels/${hotelId}/channels/${channelId}/mappings`,
        input,
      ),
    onSuccess: (_data, { hotelId, channelId }) => {
      qc.invalidateQueries({
        queryKey: ["channels", "mappings", orgId, hotelId, channelId],
      });
      toast.success("Mappings saved");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to save mappings"),
  });
};

export const usePushAvailability = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      input,
    }: {
      hotelId: string;
      input: PushAvailabilityInput;
    }) =>
      apiClient.post(`/${orgId}/hotels/${hotelId}/channels/push`, input),
    onSuccess: (_data, { hotelId }) => {
      qc.invalidateQueries({
        queryKey: ["channels", "sync-logs", orgId, hotelId],
      });
      toast.success("Availability push started");
    },
    onError: () =>
      toast.error("Push failed — check sync log for details"),
  });
};

export const useSyncChannel = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      hotelId,
      channelId,
    }: {
      hotelId: string;
      channelId: string;
    }) =>
      apiClient.post(
        `/${orgId}/hotels/${hotelId}/channels/${channelId}/sync`,
      ),
    onSuccess: (_data, { hotelId, channelId }) => {
      qc.invalidateQueries({
        queryKey: ["channels", "detail", orgId, hotelId, channelId],
      });
      qc.invalidateQueries({
        queryKey: ["channels", "sync-logs", orgId, hotelId],
      });
      toast.success("Sync triggered");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to sync channel"),
  });
};
