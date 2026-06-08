import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export interface UserRole {
  id: string;
  roleCode: string;
  roleName: string;
  hotelId: string | null;
  hotelName: string | null;
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  emailVerified: boolean;
  employmentType: string | null;
  department: string | null;
  jobTitle: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  roles: UserRole[];
}

export interface UserDetail extends UserListItem {
  phone: string | null;
  middleName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  employeeId: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  managerId: string | null;
  isSuperAdmin: boolean;
  languageCode: string;
  timezone: string;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
}

export interface UserListParams {
  search?: string;
  status?: string;
  department?: string;
  hotelId?: string;
  roleCode?: string;
  page?: number;
  limit?: number;
}

export interface InviteUserInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employmentType?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  initialRoleId?: string;
  initialHotelId?: string | null;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  employmentType?: string;
  languageCode?: string;
  timezone?: string;
}

export interface AssignRoleInput {
  roleId: string;
  hotelId?: string | null;
}

const USER_KEYS = {
  list: (orgId: string, params?: Record<string, unknown>) =>
    ["users", "list", orgId, params] as const,
  detail: (orgId: string, userId: string) =>
    ["users", "detail", orgId, userId] as const,
  permissions: (orgId: string, userId: string) =>
    ["users", "permissions", orgId, userId] as const,
};

const usersApi = {
  list: (orgId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<{ data: { users: UserListItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>(
        `/organizations/${orgId}/users`,
        { params },
      )
      .then((r) => r.data.data),

  getById: (orgId: string, userId: string) =>
    apiClient
      .get<{ data: UserDetail }>(`/organizations/${orgId}/users/${userId}`)
      .then((r) => r.data.data),

  getPermissions: (orgId: string, userId: string) =>
    apiClient
      .get<{ data: { permissions: string[]; roles: UserRole[] } }>(
        `/organizations/${orgId}/users/${userId}/permissions`,
      )
      .then((r) => r.data.data),

  invite: (orgId: string, input: InviteUserInput) =>
    apiClient
      .post<{ data: UserDetail }>(`/organizations/${orgId}/users`, input)
      .then((r) => r.data.data),

  update: (orgId: string, id: string, input: UpdateUserInput) =>
    apiClient
      .patch<{ data: UserDetail }>(`/organizations/${orgId}/users/${id}`, input)
      .then((r) => r.data.data),

  deactivate: (orgId: string, id: string) =>
    apiClient
      .delete(`/organizations/${orgId}/users/${id}`)
      .then((r) => r.data),

  activate: (orgId: string, id: string) =>
    apiClient
      .post(`/organizations/${orgId}/users/${id}/activate`)
      .then((r) => r.data),

  resetPassword: (orgId: string, id: string) =>
    apiClient
      .post(`/organizations/${orgId}/users/${id}/reset-password`)
      .then((r) => r.data),

  assignRole: (orgId: string, id: string, input: AssignRoleInput) =>
    apiClient
      .post(`/organizations/${orgId}/users/${id}/roles`, input)
      .then((r) => r.data),

  removeRole: (orgId: string, userId: string, roleId: string) =>
    apiClient
      .delete(`/organizations/${orgId}/users/${userId}/roles/${roleId}`)
      .then((r) => r.data),
};

export const useUsers = (params?: UserListParams) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: USER_KEYS.list(organizationId ?? "", params as Record<string, unknown>),
    queryFn: () => usersApi.list(organizationId!, params as Record<string, unknown>),
    enabled: !!organizationId,
  });
};

export const useUser = (userId: string | null) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: USER_KEYS.detail(organizationId ?? "", userId ?? ""),
    queryFn: () => usersApi.getById(organizationId!, userId!),
    enabled: !!organizationId && !!userId,
  });
};

export const useUserPermissions = (userId: string | null) => {
  const { organizationId } = useAuthStore();
  return useQuery({
    queryKey: USER_KEYS.permissions(organizationId ?? "", userId ?? ""),
    queryFn: () => usersApi.getPermissions(organizationId!, userId!),
    enabled: !!organizationId && !!userId,
  });
};

export const useInviteUser = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: (input: InviteUserInput) =>
      usersApi.invite(organizationId!, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.list(organizationId!) });
      toast.success(`Invitation sent to ${data.email}`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to invite user"),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.update(organizationId!, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(organizationId!, id) });
      qc.invalidateQueries({ queryKey: USER_KEYS.list(organizationId!) });
      toast.success("User updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update user"),
  });
};

export const useDeactivateUser = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(organizationId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.list(organizationId!) });
      toast.success("User deactivated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to deactivate user"),
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) => usersApi.activate(organizationId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.list(organizationId!) });
      toast.success("User reactivated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to reactivate user"),
  });
};

export const useResetUserPassword = () => {
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) => usersApi.resetPassword(organizationId!, id),
    onSuccess: () => {
      toast.success("Password reset email sent");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to send reset email"),
  });
};

export const useAssignUserRole = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssignRoleInput }) =>
      usersApi.assignRole(organizationId!, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(organizationId!, id) });
      qc.invalidateQueries({ queryKey: USER_KEYS.list(organizationId!) });
      toast.success("Role assigned");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to assign role"),
  });
};

export const useRemoveUserRole = () => {
  const qc = useQueryClient();
  const { organizationId } = useAuthStore();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      usersApi.removeRole(organizationId!, userId, roleId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(organizationId!, userId) });
      qc.invalidateQueries({ queryKey: USER_KEYS.list(organizationId!) });
      toast.success("Role removed");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to remove role"),
  });
};
