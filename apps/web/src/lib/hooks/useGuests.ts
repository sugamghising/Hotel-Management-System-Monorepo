import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { guestsApi } from "@/lib/api/modules/guests";
import { toast } from "sonner";

export const GUEST_KEYS = {
  list: (orgId: string, params?: any) =>
    ["guests", "list", orgId, params] as const,
  detail: (id: string) => ["guests", "detail", id] as const,
  history: (id: string) => ["guests", "history", id] as const,
};

export const useGuests = (params?: any) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.list(organizationId ?? "", params),
    queryFn: () => guestsApi.list(organizationId!, params),
    enabled: !!organizationId,
    select: (d) => d,
  });
};

export const useGuest = (id: string) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.detail(id),
    queryFn: () => guestsApi.getById(organizationId!, id),
    enabled: !!id && !!organizationId,
  });
};

export const useGuestHistory = (id: string) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: GUEST_KEYS.history(id),
    queryFn: () => guestsApi.getHistory(organizationId!, id),
    enabled: !!id && !!organizationId,
  });
};

export const useCreateGuest = () => {
  const { organizationId } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => guestsApi.create(organizationId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guests", "list"] });
      toast.success("Guest profile created");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to create guest");
    },
  });
};
