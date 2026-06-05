import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MaintenanceRequestStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VERIFIED"
  | "ON_HOLD"
  | "CANCELLED";

export type MaintenanceRequestType =
  | "PLUMBING"
  | "ELECTRICAL"
  | "HVAC"
  | "FURNITURE"
  | "APPLIANCE"
  | "STRUCTURAL"
  | "CLEANING"
  | "PEST_CONTROL"
  | "SECURITY"
  | "GENERAL";

export type MaintenancePriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT"
  | "EMERGENCY";

export interface MaintenancePart {
  partName: string;
  quantity: number;
  unitCost: number;
}

export interface MaintenanceRequest {
  id: string;
  organizationId: string;
  hotelId: string;
  roomId: string | null;
  reportedBy: string;
  assignedTo: string | null;
  assignedAt: string | null;
  requestType: MaintenanceRequestType;
  priority: MaintenancePriority;
  status: MaintenanceRequestStatus;
  title: string;
  description: string;
  location: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  laborHours: number | null;
  partsUsed: MaintenancePart[];
  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  completionNotes: string | null;
  verificationNotes: string | null;
  createdAt: string;
  updatedAt: string;
  room?: {
    roomNumber: string;
    floor: number | null;
    roomType: { code: string; name: string };
  };
  reporter?: {
    firstName: string;
    lastName: string;
  };
  assignee?: {
    firstName: string;
    lastName: string;
  };
}

export interface MaintenanceListResponse {
  requests: MaintenanceRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StaffWorkloadItem {
  staffId: string;
  staffName: string;
  assigned: number;
  completed: number;
}

export interface MaintenanceDashboard {
  summary: {
    open: number;
    assigned: number;
    inProgress: number;
    completed: number;
    verified: number;
    onHold: number;
  };
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  avgResolutionHours: number;
  openRooms: number;
  staffWorkload: StaffWorkloadItem[];
}

export interface CreateMaintenanceInput {
  roomId?: string;
  title: string;
  description: string;
  requestType: MaintenanceRequestType;
  priority: MaintenancePriority;
  location?: string;
  estimatedCost?: number;
  scheduledFor?: string;
}

export interface CompleteRequestInput {
  actualCost?: number;
  laborHours?: number;
  completionNotes?: string;
  partsUsed?: MaintenancePart[];
}

export interface VerifyRequestInput {
  verificationNotes?: string;
}

export interface PartsInput {
  parts: MaintenancePart[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const MT_KEYS = {
  all: ["maintenance"] as const,
  lists: (hotelId: string) => ["maintenance", "list", hotelId] as const,
  list: (hotelId: string, params?: Record<string, unknown>) =>
    ["maintenance", "list", hotelId, params] as const,
  detail: (id: string) => ["maintenance", "detail", id] as const,
  dashboard: (hotelId: string) =>
    ["maintenance", "dashboard", hotelId] as const,
  pending: (hotelId: string) =>
    ["maintenance", "pending", hotelId] as const,
  urgent: (hotelId: string) =>
    ["maintenance", "urgent", hotelId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const mtApi = {
  list: (orgId: string, hotelId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<{ data: MaintenanceListResponse }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests`,
        { params },
      )
      .then((r) => r.data.data),

  getById: (orgId: string, hotelId: string, id: string) =>
    apiClient
      .get<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}`,
      )
      .then((r) => r.data.data.request),

  dashboard: (orgId: string, hotelId: string) =>
    apiClient
      .get<{ data: { dashboard: MaintenanceDashboard } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/dashboard`,
      )
      .then((r) => r.data.data.dashboard),

  pending: (orgId: string, hotelId: string) =>
    apiClient
      .get<{ data: { requests: MaintenanceRequest[] } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/pending`,
      )
      .then((r) => r.data.data.requests),

  urgent: (orgId: string, hotelId: string) =>
    apiClient
      .get<{ data: { requests: MaintenanceRequest[] } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/urgent`,
      )
      .then((r) => r.data.data.requests),

  create: (orgId: string, hotelId: string, input: CreateMaintenanceInput) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests`,
        input,
      )
      .then((r) => r.data.data.request),

  assign: (orgId: string, hotelId: string, id: string, assignedTo: string) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}/assign`,
        { assignedTo },
      )
      .then((r) => r.data.data.request),

  start: (orgId: string, hotelId: string, id: string) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}/start`,
        {},
      )
      .then((r) => r.data.data.request),

  complete: (
    orgId: string,
    hotelId: string,
    id: string,
    input: CompleteRequestInput,
  ) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}/complete`,
        input,
      )
      .then((r) => r.data.data.request),

  verify: (
    orgId: string,
    hotelId: string,
    id: string,
    input: VerifyRequestInput,
  ) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}/verify`,
        input,
      )
      .then((r) => r.data.data.request),

  addParts: (orgId: string, hotelId: string, id: string, input: PartsInput) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}/parts`,
        input,
      )
      .then((r) => r.data.data.request),

  schedule: (
    orgId: string,
    hotelId: string,
    id: string,
    scheduledFor: string,
  ) =>
    apiClient
      .post<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}/schedule`,
        { scheduledFor },
      )
      .then((r) => r.data.data.request),

  update: (
    orgId: string,
    hotelId: string,
    id: string,
    input: Partial<CreateMaintenanceInput & { status: MaintenanceRequestStatus }>,
  ) =>
    apiClient
      .patch<{ data: { request: MaintenanceRequest } }>(
        `/organizations/${orgId}/hotels/${hotelId}/maintenance/requests/${id}`,
        input,
      )
      .then((r) => r.data.data.request),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useMaintenanceRequests = (params?: Record<string, unknown>) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: MT_KEYS.list(activeHotel?.id ?? "", params),
    queryFn: () => mtApi.list(organizationId!, activeHotel!.id, params),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useMaintenanceRequest = (id: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: MT_KEYS.detail(id),
    queryFn: () => mtApi.getById(organizationId!, activeHotel!.id, id),
    enabled: !!organizationId && !!activeHotel && !!id,
  });
};

export const useMaintenanceDashboard = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: MT_KEYS.dashboard(activeHotel?.id ?? ""),
    queryFn: () => mtApi.dashboard(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
    refetchInterval: 3 * 60 * 1000,
  });
};

export const usePendingMaintenance = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: MT_KEYS.pending(activeHotel?.id ?? ""),
    queryFn: () => mtApi.pending(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useUrgentMaintenance = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: MT_KEYS.urgent(activeHotel?.id ?? ""),
    queryFn: () => mtApi.urgent(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
    refetchInterval: 60 * 1000,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateMaintenanceRequest = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateMaintenanceInput) =>
      mtApi.create(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: MT_KEYS.dashboard(activeHotel!.id) });
      toast.success("Maintenance request created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create request"),
  });
};

export const useAssignMaintenance = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      mtApi.assign(organizationId!, activeHotel!.id, id, assignedTo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: MT_KEYS.dashboard(activeHotel!.id) });
      toast.success("Request assigned");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to assign request"),
  });
};

export const useStartMaintenance = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) =>
      mtApi.start(organizationId!, activeHotel!.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: MT_KEYS.dashboard(activeHotel!.id) });
      toast.success("Work started");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to start work"),
  });
};

export const useCompleteMaintenance = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
    input: CompleteRequestInput;
  }) => mtApi.complete(organizationId!, activeHotel!.id, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: MT_KEYS.dashboard(activeHotel!.id) });
      toast.success("Request completed");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to complete request"),
  });
};

export const useVerifyMaintenance = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
    input: VerifyRequestInput;
  }) => mtApi.verify(organizationId!, activeHotel!.id, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: MT_KEYS.dashboard(activeHotel!.id) });
      toast.success("Request verified");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to verify request"),
  });
};

export const useAddMaintenanceParts = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      parts,
    }: {
      id: string;
      parts: MaintenancePart[];
    }) => mtApi.addParts(organizationId!, activeHotel!.id, id, { parts }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      toast.success("Parts added");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to add parts"),
  });
};

export const useScheduleMaintenance = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      scheduledFor,
    }: {
      id: string;
      scheduledFor: string;
    }) => mtApi.schedule(organizationId!, activeHotel!.id, id, scheduledFor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      toast.success("Request scheduled");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to schedule request"),
  });
};

export const useUpdateMaintenance = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateMaintenanceInput & { status: MaintenanceRequestStatus }>;
    }) => mtApi.update(organizationId!, activeHotel!.id, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MT_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: MT_KEYS.detail(activeHotel!.id) });
      toast.success("Request updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update request"),
  });
};
