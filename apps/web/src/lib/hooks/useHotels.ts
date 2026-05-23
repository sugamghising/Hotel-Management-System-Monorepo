import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { hotelsApi } from "@/lib/api/modules/hotels";

export const HOTEL_KEYS = {
  list: (orgId: string) => ["hotels", orgId] as const,
  detail: (orgId: string, hotelId: string) =>
    ["hotels", orgId, hotelId] as const,
  dashboard: (hotelId: string) => ["hotels", "dashboard", hotelId] as const,
};

export const useHotels = () => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: HOTEL_KEYS.list(organizationId ?? ""),
    queryFn: () => hotelsApi.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useHotel = (hotelId?: string) => {
  const { organizationId } = useAuthStore();
  const id = hotelId ?? useAuthStore.getState().activeHotel?.id;
  return useQuery({
    queryKey: HOTEL_KEYS.detail(organizationId ?? "", id ?? ""),
    queryFn: () => hotelsApi.getById(organizationId!, id!),
    enabled: !!organizationId && !!id,
    select: (d) => d.hotel,
  });
};
