import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";

export interface Role {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  level: number;
  createdAt: string;
}

export interface RoleListParams {
  search?: string;
  isSystem?: boolean;
}

const ROLES_KEYS = {
  list: (orgId: string, params?: Record<string, unknown>) =>
    ["roles", "list", orgId, params] as const,
  detail: (orgId: string, id: string) =>
    ["roles", "detail", orgId, id] as const,
};

const rolesApi = {
  list: (orgId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<{ data: { roles: Role[] } }>(`/organizations/${orgId}/roles`, { params })
      .then((r) => r.data.data),

  getById: (orgId: string, id: string) =>
    apiClient
      .get<{ data: Role & { permissions: string[] } }>(`/organizations/${orgId}/roles/${id}`)
      .then((r) => r.data.data),
};

export const useRoles = (params?: RoleListParams) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: ROLES_KEYS.list(organizationId ?? "", params as Record<string, unknown>),
    queryFn: () => rolesApi.list(organizationId!, params as Record<string, unknown>),
    enabled: !!organizationId,
  });
};

export const useRole = (id: string | null) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: ROLES_KEYS.detail(organizationId ?? "", id ?? ""),
    queryFn: () => rolesApi.getById(organizationId!, id!),
    enabled: !!organizationId && !!id,
  });
};
