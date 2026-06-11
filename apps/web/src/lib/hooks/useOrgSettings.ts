import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export interface OrgDetailsInput {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string | null;
  website?: string | null;
  taxId?: string | null;
}

export interface OrgSettingsInput {
  settings?: Record<string, unknown>;
}

export interface OrgLimits {
  hotels: { used: number; max: number; canAdd: boolean };
  users: { used: number; max: number; canAdd: boolean };
  rooms: { used: number; max: number; canAdd: boolean };
  trialEnd?: string | null;
}

export interface OrgSubscription {
  tier: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  maxHotels: number;
  maxRooms: number;
  maxUsers: number;
  enabledFeatures: string[];
}

export const ORG_KEYS = {
  detail: (orgId: string) => ["org", "detail", orgId] as const,
  limits: (orgId: string) => ["org", "limits", orgId] as const,
};

export const useOrganization = (orgId: string | null) => {
  return useQuery({
    queryKey: ORG_KEYS.detail(orgId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/organizations/${orgId}`)
        .then((r) => r.data.data),
    enabled: !!orgId,
  });
};

export const useOrgLimits = (orgId: string | null) => {
  return useQuery({
    queryKey: ORG_KEYS.limits(orgId ?? ""),
    queryFn: () =>
      apiClient
        .get<{ data: OrgLimits }>(`/organizations/${orgId}/limits`)
        .then((r) => r.data.data ?? null),
    enabled: !!orgId,
  });
};

export const useUpdateOrgDetails = () => {
  const qc = useQueryClient();
  const organizationId = useAuthStore((s) => s.organizationId);
  return useMutation({
    mutationFn: ({ input }: { input: OrgDetailsInput }) =>
      apiClient.patch(`/organizations/${organizationId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.detail(organizationId!) });
      toast.success("Organization details updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });
};

export const useUpdateOrgSettings = () => {
  const qc = useQueryClient();
  const organizationId = useAuthStore((s) => s.organizationId);
  return useMutation({
    mutationFn: ({ input }: { input: OrgSettingsInput }) =>
      apiClient.patch(`/organizations/${organizationId}/settings`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.detail(organizationId!) });
      toast.success("Settings saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });
};
