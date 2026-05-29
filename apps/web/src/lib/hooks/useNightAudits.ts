import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NightAuditStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "ROLLED_BACK";

export interface NightAuditPreCheck {
  businessDate: string;
  canProceed: boolean;
  checks: {
    unbalancedFolios: number;
    uncheckedOutReservations: number;
    pendingCharges: number;
    roomDiscrepancies: number;
  };
  warnings: string[];
  errors: string[];
}

export interface NightAuditStatus_ {
  id: string;
  hotelId: string;
  businessDate: string;
  status: NightAuditStatus;
  startedAt: string | null;
  completedAt: string | null;
  performedBy: string | null;
  unbalancedFolios: number;
  uncheckedOutRes: number;
  pendingCharges: number;
  roomDiscrepancies: number;
  roomRevenue: number;
  otherRevenue: number;
  paymentsReceived: number;
  autoPostedCharges: number;
  noShowsMarked: number;
  errors: unknown[] | null;
  notes: string | null;
}

export interface NightAuditRunInput {
  businessDate: string;
  autoPostRoomCharges?: boolean;
  autoMarkNoShows?: boolean;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const NIGHT_AUDIT_KEYS = {
  status: (hotelId: string) => ["nightAudit", "status", hotelId] as const,
  preCheck: (hotelId: string) => ["nightAudit", "preCheck", hotelId] as const,
  history: (hotelId: string) => ["nightAudit", "history", hotelId] as const,
  detail: (hotelId: string, auditId: string) =>
    ["nightAudit", "detail", hotelId, auditId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const nightAuditApi = {
  status: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: { audit: NightAuditStatus_ };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/status`)
      .then((r) => r.data.data.audit),

  preCheck: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: NightAuditPreCheck;
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/pre-check`)
      .then((r) => r.data.data),

  history: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: { audits: NightAuditStatus_[] };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/history`)
      .then((r) => r.data.data.audits),

  detail: (orgId: string, hotelId: string, auditId: string) =>
    apiClient
      .get<{
        data: { audit: NightAuditStatus_ };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/${auditId}/details`)
      .then((r) => r.data.data.audit),

  start: (orgId: string, hotelId: string, input: NightAuditRunInput) =>
    apiClient
      .post<{
        data: { audit: NightAuditStatus_ };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/start`, input)
      .then((r) => r.data.data.audit),

  rollback: (orgId: string, hotelId: string, reason: string) =>
    apiClient
      .post<{
        data: unknown;
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/rollback`, { reason })
      .then((r) => r.data),

  autoPost: (orgId: string, hotelId: string) =>
    apiClient
      .post<{
        data: { posted: number };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/auto-post`, {})
      .then((r) => r.data.data),

  markNoShows: (orgId: string, hotelId: string) =>
    apiClient
      .post<{
        data: { marked: number };
      }>(`/api/v1/organizations/${orgId}/hotels/${hotelId}/night-audit/mark-no-shows`, {})
      .then((r) => r.data.data),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useNightAuditStatus = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: NIGHT_AUDIT_KEYS.status(activeHotel?.id ?? ""),
    queryFn: () => nightAuditApi.status(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useNightAuditPreCheck = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: NIGHT_AUDIT_KEYS.preCheck(activeHotel?.id ?? ""),
    queryFn: () => nightAuditApi.preCheck(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useNightAuditHistory = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: NIGHT_AUDIT_KEYS.history(activeHotel?.id ?? ""),
    queryFn: () => nightAuditApi.history(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useNightAuditDetail = (auditId: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: NIGHT_AUDIT_KEYS.detail(activeHotel?.id ?? "", auditId),
    queryFn: () =>
      nightAuditApi.detail(organizationId!, activeHotel!.id, auditId),
    enabled: !!organizationId && !!activeHotel && !!auditId,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useRunNightAudit = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: NightAuditRunInput) =>
      nightAuditApi.start(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: NIGHT_AUDIT_KEYS.status(activeHotel!.id),
      });
      qc.invalidateQueries({
        queryKey: NIGHT_AUDIT_KEYS.history(activeHotel!.id),
      });
      toast.success("Night audit completed");
    },
    onError: (err: Error) => toast.error(err.message ?? "Night audit failed"),
  });
};

export const useRollbackNightAudit = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (reason: string) =>
      nightAuditApi.rollback(organizationId!, activeHotel!.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: NIGHT_AUDIT_KEYS.status(activeHotel!.id),
      });
      toast.warning("Night audit rolled back");
    },
    onError: (err: Error) => toast.error(err.message ?? "Rollback failed"),
  });
};

export const useAutoPostCharges = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: () => nightAuditApi.autoPost(organizationId!, activeHotel!.id),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: NIGHT_AUDIT_KEYS.status(activeHotel!.id),
      });
      toast.success(`Auto-posted ${data.posted} charges`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Auto-post failed"),
  });
};

export const useMarkNoShows = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: () =>
      nightAuditApi.markNoShows(organizationId!, activeHotel!.id),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: NIGHT_AUDIT_KEYS.status(activeHotel!.id),
      });
      toast.info(`Marked ${data.marked} no-shows`);
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "No-show marking failed"),
  });
};
