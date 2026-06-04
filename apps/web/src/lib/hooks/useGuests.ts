import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GuestType =
  | "TRANSIENT"
  | "CORPORATE"
  | "GROUP"
  | "CONTRACTUAL"
  | "COMP"
  | "STAFF"
  | "FAMILY_FRIENDS";
export type VIPStatus =
  | "NONE"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "BLACK";

export interface Guest {
  id: string;
  organizationId: string;
  hotelId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  languageCode: string;
  idType: string | null;
  idNumber: string | null;
  idExpiryDate: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    stateProvince: string | null;
    postalCode: string | null;
    countryCode: string | null;
  };
  guestType: GuestType;
  vipStatus: VIPStatus;
  vipReason: string | null;
  companyName: string | null;
  companyTaxId: string | null;
  roomPreferences: Record<string, unknown> | null;
  dietaryRequirements: string | null;
  specialNeeds: string | null;
  history: {
    totalStays: number;
    totalNights: number;
    totalRevenue: number;
    lastStayDate: string | null;
    averageRate: number;
  };
  marketing: {
    consent: boolean;
    emailOptIn: boolean;
    smsOptIn: boolean;
  };
  internalNotes: string | null;
  alertNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuestListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  guestType: GuestType;
  vipStatus: VIPStatus;
  totalStays: number;
  totalRevenue?: number;
  lastStayDate: string | null;
  companyName: string | null;
}

export interface GuestListResponse {
  guests: GuestListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateGuestInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: string;
  nationality?: string;
  languageCode?: string;
  idType?: string;
  idNumber?: string;
  idExpiryDate?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  countryCode?: string;
  guestType?: GuestType;
  vipStatus?: VIPStatus;
  companyName?: string;
  companyTaxId?: string;
  marketingConsent?: boolean;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  internalNotes?: string;
  alertNotes?: string;
}

export interface UpdateGuestInput extends Partial<CreateGuestInput> {
  roomPreferences?: Record<string, unknown>;
  dietaryRequirements?: string;
  specialNeeds?: string;
}

export interface GuestStayHistory {
  reservationId: string;
  confirmationNumber: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomType: string;
  totalAmount: number;
  status: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const GUEST_KEYS = {
  all: ["guests"] as const,
  lists: (orgId: string) => ["guests", "list", orgId] as const,
  list: (orgId: string, params?: Record<string, unknown>) =>
    ["guests", "list", orgId, params] as const,
  detail: (id: string) => ["guests", "detail", id] as const,
  history: (id: string) => ["guests", "history", id] as const,
  vip: (hotelId: string) => ["guests", "vip", hotelId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const guestApi = {
  list: (orgId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<{ data: GuestListResponse }>(`/organizations/${orgId}/guests`, { params })
      .then((r) => r.data.data),

  getById: (orgId: string, id: string) =>
    apiClient
      .get<{
        data: { guest: Guest };
      }>(`/organizations/${orgId}/guests/${id}`)
      .then((r) => r.data.data.guest),

  create: (orgId: string, input: CreateGuestInput) =>
    apiClient
      .post<{
        data: { guest: Guest };
      }>(`/organizations/${orgId}/guests`, input)
      .then((r) => r.data.data.guest),

  update: (orgId: string, id: string, input: UpdateGuestInput) =>
    apiClient
      .patch<{
        data: { guest: Guest };
      }>(`/organizations/${orgId}/guests/${id}`, input)
      .then((r) => r.data.data.guest),

  history: (orgId: string, id: string) =>
    apiClient
      .get<{
        data: { history: GuestStayHistory[] };
      }>(`/organizations/${orgId}/guests/${id}/history`)
      .then((r) => r.data.data.history),

  updateVip: (
    orgId: string,
    id: string,
    vipStatus: VIPStatus,
    vipReason?: string,
  ) =>
    apiClient
      .post<{ data: { guest: Guest } }>(
        `/organizations/${orgId}/guests/${id}/vip-status`,
        {
          vipStatus,
          vipReason,
        },
      )
      .then((r) => r.data.data.guest),

  updatePreferences: (
    orgId: string,
    id: string,
    preferences: Partial<UpdateGuestInput>,
  ) =>
    apiClient
      .patch<{
        data: { guest: Guest };
      }>(`/organizations/${orgId}/guests/${id}/preferences`, preferences)
      .then((r) => r.data.data.guest),

  vipList: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: { guests: GuestListItem[] };
      }>(`/organizations/${orgId}/hotels/${hotelId}/guests/vip`)
      .then((r) => r.data.data.guests),

  searchDuplicates: (
    orgId: string,
    params: { firstName?: string; lastName?: string; email?: string },
  ) =>
    apiClient
      .get<{
        data: { guests: GuestListItem[] };
      }>(`/organizations/${orgId}/guests/search/duplicate`, { params })
      .then((r) => r.data.data.guests),

  merge: (orgId: string, id: string, sourceId: string) =>
    apiClient
      .post<{
        data: { guest: Guest };
      }>(`/organizations/${orgId}/guests/${id}/merge`, { sourceId })
      .then((r) => r.data.data.guest),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useGuests = (params?: Record<string, unknown>) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.list(organizationId ?? "", params),
    queryFn: () => guestApi.list(organizationId!, params),
    enabled: !!organizationId,
  });
};

export const useGuest = (id: string) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.detail(id),
    queryFn: () => guestApi.getById(organizationId!, id),
    enabled: !!organizationId && !!id,
  });
};

export const useGuestHistory = (id: string) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.history(id),
    queryFn: () => guestApi.history(organizationId!, id),
    enabled: !!organizationId && !!id,
  });
};

export const useVipGuests = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.vip(activeHotel?.id ?? ""),
    queryFn: () => guestApi.vipList(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useDuplicateGuests = (params: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) => {
  const { organizationId } = useAuthStore();
  const hasParams = !!(params.firstName || params.lastName || params.email);
  return useQuery({
    queryKey: ["guests", "duplicates", params],
    queryFn: () => guestApi.searchDuplicates(organizationId!, params),
    enabled: !!organizationId && hasParams,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateGuest = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateGuestInput) =>
      guestApi.create(organizationId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GUEST_KEYS.lists(organizationId!) });
      toast.success("Guest profile created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create guest"),
  });
};

export const useUpdateGuest = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGuestInput }) =>
      guestApi.update(organizationId!, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: GUEST_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: GUEST_KEYS.lists(organizationId!) });
      toast.success("Guest profile updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update guest"),
  });
};

export const useUpdateGuestVip = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      vipStatus,
      vipReason,
    }: {
      id: string;
      vipStatus: VIPStatus;
      vipReason?: string;
    }) => guestApi.updateVip(organizationId!, id, vipStatus, vipReason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: GUEST_KEYS.detail(id) });
      toast.success("VIP status updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update VIP status"),
  });
};

export const useUpdateGuestPreferences = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      preferences,
    }: {
      id: string;
      preferences: Partial<UpdateGuestInput>;
    }) => guestApi.updatePreferences(organizationId!, id, preferences),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: GUEST_KEYS.detail(id) });
      toast.success("Preferences updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update preferences"),
  });
};

export const useMergeGuests = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({
      targetId,
      sourceId,
    }: {
      targetId: string;
      sourceId: string;
    }) => guestApi.merge(organizationId!, targetId, sourceId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: GUEST_KEYS.detail(data.id) });
      qc.invalidateQueries({ queryKey: GUEST_KEYS.lists(organizationId!) });
      toast.success("Guest profiles merged");
    },
    onError: (err: Error) => toast.error(err.message ?? "Merge failed"),
  });
};
