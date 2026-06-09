import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { hotelsApi } from "@/lib/api/modules/hotels";
import { toast } from "sonner";

export interface HotelGeneralInput {
  name?: string;
  legalName?: string | null;
  brand?: string | null;
  starRating?: number | null;
  propertyType?: string;
  email?: string;
  phone?: string;
  fax?: string | null;
  website?: string | null;
}

export interface HotelAddressInput {
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  stateProvince?: string | null;
  postalCode?: string;
  countryCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
}

export interface HotelOperationsInput {
  checkInTime?: string;
  checkOutTime?: string;
  currencyCode?: string;
  defaultLanguage?: string;
}

export interface HotelSettingsInput {
  operational?: Record<string, unknown>;
  policies?: Record<string, unknown>;
  amenities?: string[];
}

export interface HotelStatusInput {
  status?: string;
  closingDate?: string | null;
}

export const HOTEL_SETTINGS_KEYS = {
  detail: (orgId: string, hotelId: string) =>
    ["hotels", "settings", orgId, hotelId] as const,
};

const useCtx = () => {
  const organizationId = useAuthStore((s) => s.organizationId);
  const activeHotel = useAuthStore((s) => s.activeHotel);
  return { orgId: organizationId ?? "", hotelId: activeHotel?.id ?? "" };
};

export const useHotelDetail = (hotelId?: string) => {
  const { organizationId } = useAuthStore();
  const id = hotelId ?? useAuthStore.getState().activeHotel?.id;
  return useQuery({
    queryKey: HOTEL_SETTINGS_KEYS.detail(organizationId ?? "", id ?? ""),
    queryFn: () => hotelsApi.getById(organizationId!, id!),
    enabled: !!organizationId && !!id,
  });
};

export const useUpdateHotelGeneral = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ input }: { input: HotelGeneralInput }) =>
      hotelsApi.update(orgId, hotelId, input as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOTEL_SETTINGS_KEYS.detail(orgId, hotelId) });
      qc.invalidateQueries({ queryKey: ["hotels", orgId] });
      toast.success("Hotel details updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });
};

export const useUpdateHotelAddress = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ input }: { input: HotelAddressInput }) =>
      hotelsApi.update(orgId, hotelId, input as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOTEL_SETTINGS_KEYS.detail(orgId, hotelId) });
      toast.success("Address updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });
};

export const useUpdateHotelOperations = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ input }: { input: HotelOperationsInput }) =>
      hotelsApi.update(orgId, hotelId, input as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOTEL_SETTINGS_KEYS.detail(orgId, hotelId) });
      toast.success("Operational settings updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });
};

export const useUpdateHotelSettings = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ input }: { input: HotelSettingsInput }) =>
      hotelsApi.updateSettings(orgId, hotelId, input as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOTEL_SETTINGS_KEYS.detail(orgId, hotelId) });
      toast.success("Settings updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });
};

export const useUpdateHotelStatus = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ input }: { input: HotelStatusInput }) =>
      hotelsApi.update(orgId, hotelId, input as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOTEL_SETTINGS_KEYS.detail(orgId, hotelId) });
      qc.invalidateQueries({ queryKey: ["hotels", orgId] });
      toast.success("Hotel status updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update status"),
  });
};
