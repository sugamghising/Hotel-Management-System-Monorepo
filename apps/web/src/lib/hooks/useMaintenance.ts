import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HousekeepingType =
  | "CLEANING_DEPARTURE"
  | "CLEANING_STAYOVER"
  | "CLEANING_TOUCHUP"
  | "DEEP_CLEAN"
  | "TURNDOWN_SERVICE"
  | "INSPECTION"
  | "SPECIAL_REQUEST";

export type HousekeepingStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VERIFIED"
  | "ISSUES_REPORTED"
  | "CANCELLED";

export interface HousekeepingTask {
  id: string;
  organizationId: string;
  hotelId: string;
  roomId: string;
  taskType: HousekeepingType;
  status: HousekeepingStatus;
  priority: number;
  assignedTo: string | null;
  assignedAt: string | null;
  scheduledFor: string;
  estimatedMinutes: number;
  startedAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  inspectionScore: number | null;
  issuesFound: string | null;
  notes: string | null;
  guestRequests: string | null;
  createdAt: string;
  createdBy: string;
  room?: {
    roomNumber: string;
    floor: number | null;
    roomType: { code: string; name: string };
  };
  assignee?: {
    firstName: string;
    lastName: string;
  };
}

export interface HousekeepingTaskListResponse {
  tasks: HousekeepingTask[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HousekeepingDashboard {
  summary: {
    pending: number;
    inProgress: number;
    completed: number;
    verified: number;
    issuesReported: number;
  };
  byPriority: { normal: number; high: number; urgent: number };
  staffWorkload: Array<{
    staffId: string;
    staffName: string;
    assigned: number;
    completed: number;
  }>;
  roomsNeedingCleaning: number;
  overdueTask: number;
}

export interface CreateHousekeepingTaskInput {
  roomId: string;
  taskType: HousekeepingType;
  priority?: number;
  assignedTo?: string;
  scheduledFor: string;
  estimatedMinutes?: number;
  notes?: string;
  guestRequests?: string;
}

export interface BulkAssignInput {
  taskIds: string[];
  assignedTo: string;
}

export interface CompleteTaskInput {
  inspectionScore?: number;
  issuesFound?: string;
  notes?: string;
}

export interface VerifyTaskInput {
  inspectionScore: number;
  issuesFound?: string;
  notes?: string;
}

export interface ReportIssueInput {
  issuesFound: string;
  notes?: string;
  requiresMaintenance?: boolean;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const HK_KEYS = {
  all: ["housekeeping"] as const,
  lists: (hotelId: string) => ["housekeeping", "list", hotelId] as const,
  list: (hotelId: string, params?: Record<string, unknown>) =>
    ["housekeeping", "list", hotelId, params] as const,
  detail: (id: string) => ["housekeeping", "detail", id] as const,
  dashboard: (hotelId: string) =>
    ["housekeeping", "dashboard", hotelId] as const,
  staffTasks: (hotelId: string, staffId: string) =>
    ["housekeeping", "staff", hotelId, staffId] as const,
  inspections: (hotelId: string) =>
    ["housekeeping", "inspections", hotelId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const hkApi = {
  list: (orgId: string, hotelId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<{
        data: HousekeepingTaskListResponse;
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks`, { params })
      .then((r) => r.data.data),

  getById: (orgId: string, hotelId: string, id: string) =>
    apiClient
      .get<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/${id}`)
      .then((r) => r.data.data.task),

  dashboard: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: { dashboard: HousekeepingDashboard };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/dashboard`)
      .then((r) => r.data.data.dashboard),

  create: (
    orgId: string,
    hotelId: string,
    input: CreateHousekeepingTaskInput,
  ) =>
    apiClient
      .post<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks`, input)
      .then((r) => r.data.data.task),

  autoGenerate: (orgId: string, hotelId: string) =>
    apiClient
      .post<{
        data: { generated: number };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/auto-generate`, {})
      .then((r) => r.data.data),

  bulkAssign: (orgId: string, hotelId: string, input: BulkAssignInput) =>
    apiClient
      .post<{
        data: { assigned: number };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/bulk-assign`, input)
      .then((r) => r.data.data),

  start: (orgId: string, hotelId: string, id: string) =>
    apiClient
      .post<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/${id}/start`, {})
      .then((r) => r.data.data.task),

  complete: (
    orgId: string,
    hotelId: string,
    id: string,
    input: CompleteTaskInput,
  ) =>
    apiClient
      .post<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/${id}/complete`, input)
      .then((r) => r.data.data.task),

  verify: (
    orgId: string,
    hotelId: string,
    id: string,
    input: VerifyTaskInput,
  ) =>
    apiClient
      .post<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/${id}/verify`, input)
      .then((r) => r.data.data.task),

  reportIssues: (
    orgId: string,
    hotelId: string,
    id: string,
    input: ReportIssueInput,
  ) =>
    apiClient
      .post<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/tasks/${id}/issues`, input)
      .then((r) => r.data.data.task),

  staffTasks: (orgId: string, hotelId: string, staffId: string) =>
    apiClient
      .get<{
        data: { tasks: HousekeepingTask[] };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/staff/${staffId}/tasks`)
      .then((r) => r.data.data.tasks),

  inspections: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: { inspections: HousekeepingTask[] };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/inspections`)
      .then((r) => r.data.data.inspections),

  requestTurndown: (orgId: string, hotelId: string, roomId: string) =>
    apiClient
      .post<{
        data: { task: HousekeepingTask };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/housekeeping/rooms/${roomId}/turndown`, {})
      .then((r) => r.data.data.task),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useHousekeepingTasks = (params?: Record<string, unknown>) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: HK_KEYS.list(activeHotel?.id ?? "", params),
    queryFn: () => hkApi.list(organizationId!, activeHotel!.id, params),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useHousekeepingTask = (id: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: HK_KEYS.detail(id),
    queryFn: () => hkApi.getById(organizationId!, activeHotel!.id, id),
    enabled: !!organizationId && !!activeHotel && !!id,
  });
};

export const useHousekeepingDashboard = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: HK_KEYS.dashboard(activeHotel?.id ?? ""),
    queryFn: () => hkApi.dashboard(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
    refetchInterval: 3 * 60 * 1000, // refresh every 3 min
  });
};

export const useStaffTasks = (staffId: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: HK_KEYS.staffTasks(activeHotel?.id ?? "", staffId),
    queryFn: () => hkApi.staffTasks(organizationId!, activeHotel!.id, staffId),
    enabled: !!organizationId && !!activeHotel && !!staffId,
  });
};

export const useHousekeepingInspections = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: HK_KEYS.inspections(activeHotel?.id ?? ""),
    queryFn: () => hkApi.inspections(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateHousekeepingTask = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateHousekeepingTaskInput) =>
      hkApi.create(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.dashboard(activeHotel!.id) });
      toast.success("Task created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create task"),
  });
};

export const useAutoGenerateTasks = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: () => hkApi.autoGenerate(organizationId!, activeHotel!.id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.dashboard(activeHotel!.id) });
      toast.success(`Generated ${data.generated} tasks`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Auto-generate failed"),
  });
};

export const useBulkAssignTasks = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: BulkAssignInput) =>
      hkApi.bulkAssign(organizationId!, activeHotel!.id, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      toast.success(`Assigned ${data.assigned} tasks`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Bulk assign failed"),
  });
};

export const useStartTask = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) =>
      hkApi.start(organizationId!, activeHotel!.id, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.dashboard(activeHotel!.id) });
      toast.success("Task started");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to start task"),
  });
};

export const useCompleteTask = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompleteTaskInput }) =>
      hkApi.complete(organizationId!, activeHotel!.id, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.dashboard(activeHotel!.id) });
      toast.success("Task completed");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to complete task"),
  });
};

export const useVerifyTask = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VerifyTaskInput }) =>
      hkApi.verify(organizationId!, activeHotel!.id, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.dashboard(activeHotel!.id) });
      toast.success("Task verified");
    },
    onError: (err: Error) => toast.error(err.message ?? "Verification failed"),
  });
};

export const useReportTaskIssues = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReportIssueInput }) =>
      hkApi.reportIssues(organizationId!, activeHotel!.id, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      toast.warning("Issues reported");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to report issues"),
  });
};

export const useRequestTurndown = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (roomId: string) =>
      hkApi.requestTurndown(organizationId!, activeHotel!.id, roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HK_KEYS.lists(activeHotel!.id) });
      toast.success("Turndown service requested");
    },
    onError: (err: Error) => toast.error(err.message ?? "Request failed"),
  });
};
