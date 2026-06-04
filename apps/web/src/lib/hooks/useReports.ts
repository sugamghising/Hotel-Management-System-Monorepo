import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OccupancyReport {
  period: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  byRoomType: Array<{
    roomTypeCode: string;
    roomTypeName: string;
    total: number;
    occupied: number;
    occupancyRate: number;
  }>;
  daily: Array<{ date: string; occupied: number; total: number; rate: number }>;
}

export interface RevenueReport {
  period: string;
  currencyCode: string;
  roomRevenue: number;
  fnbRevenue: number;
  otherRevenue: number;
  taxTotal: number;
  totalRevenue: number;
  paymentTotal: number;
  daily: Array<{
    date: string;
    roomRevenue: number;
    fnbRevenue: number;
    otherRevenue: number;
    totalRevenue: number;
  }>;
  byDepartment: Record<string, number>;
}

export interface ADRReport {
  period: string;
  currencyCode: string;
  adr: number;
  revPar: number;
  totalRoomNights: number;
  totalRoomRevenue: number;
  daily: Array<{
    date: string;
    adr: number;
    revPar: number;
    roomNights: number;
  }>;
  byRoomType: Array<{
    roomTypeCode: string;
    roomTypeName: string;
    adr: number;
    revPar: number;
    roomNights: number;
  }>;
}

export interface NightAuditSummary {
  businessDate: string;
  hotelId: string;
  totals: {
    roomRevenue: number;
    otherRevenue: number;
    taxCollected: number;
    paymentsReceived: number;
    adjustments: number;
  };
  byDepartment: Record<string, number>;
  byRevenueCode: Record<string, number>;
  checkIns: number;
  checkOuts: number;
  noShows: number;
  inHouse: number;
  occupancyRate: number;
}

export interface ReportParams {
  startDate: string;
  endDate: string;
  roomTypeId?: string;
  groupBy?: "day" | "week" | "month";
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const REPORT_KEYS = {
  occupancy: (hotelId: string, params: ReportParams) =>
    ["reports", "occupancy", hotelId, params] as const,
  revenue: (hotelId: string, params: ReportParams) =>
    ["reports", "revenue", hotelId, params] as const,
  adr: (hotelId: string, params: ReportParams) =>
    ["reports", "adr", hotelId, params] as const,
  revpar: (hotelId: string, params: ReportParams) =>
    ["reports", "revpar", hotelId, params] as const,
  nightAudit: (hotelId: string, date: string) =>
    ["reports", "nightAudit", hotelId, date] as const,
  nightAuditHistory: (hotelId: string) =>
    ["reports", "nightAuditHistory", hotelId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const reportsApi = {
  occupancy: (orgId: string, hotelId: string, params: ReportParams) =>
    apiClient
      .get<{
        data: OccupancyReport;
      }>(`/organizations/${orgId}/hotels/${hotelId}/reports/occupancy`, { params })
      .then((r) => r.data.data),

  revenue: (orgId: string, hotelId: string, params: ReportParams) =>
    apiClient
      .get<{
        data: RevenueReport;
      }>(`/organizations/${orgId}/hotels/${hotelId}/reports/revenue`, { params })
      .then((r) => r.data.data),

  adr: (orgId: string, hotelId: string, params: ReportParams) =>
    apiClient
      .get<{
        data: ADRReport;
      }>(`/organizations/${orgId}/hotels/${hotelId}/reports/adr`, { params })
      .then((r) => r.data.data),

  revpar: (orgId: string, hotelId: string, params: ReportParams) =>
    apiClient
      .get<{
        data: ADRReport;
      }>(`/organizations/${orgId}/hotels/${hotelId}/reports/revpar`, { params })
      .then((r) => r.data.data),

  nightAuditSummary: (orgId: string, hotelId: string, date: string) =>
    apiClient
      .get<{
        data: NightAuditSummary;
      }>(`/organizations/${orgId}/hotels/${hotelId}/night-audit/reports/summary`, { params: { date } })
      .then((r) => r.data.data),

  nightAuditHistory: (orgId: string, hotelId: string) =>
    apiClient
      .get<{
        data: { audits: NightAuditSummary[] };
      }>(`/organizations/${orgId}/hotels/${hotelId}/night-audit/history`)
      .then((r) => r.data.data.audits),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useOccupancyReport = (params: ReportParams, enabled = true) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: REPORT_KEYS.occupancy(activeHotel?.id ?? "", params),
    queryFn: () =>
      reportsApi.occupancy(organizationId!, activeHotel!.id, params),
    enabled:
      !!organizationId &&
      !!activeHotel &&
      enabled &&
      !!params.startDate &&
      !!params.endDate,
  });
};

export const useRevenueReport = (params: ReportParams, enabled = true) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: REPORT_KEYS.revenue(activeHotel?.id ?? "", params),
    queryFn: () => reportsApi.revenue(organizationId!, activeHotel!.id, params),
    enabled:
      !!organizationId &&
      !!activeHotel &&
      enabled &&
      !!params.startDate &&
      !!params.endDate,
  });
};

export const useADRReport = (params: ReportParams, enabled = true) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: REPORT_KEYS.adr(activeHotel?.id ?? "", params),
    queryFn: () => reportsApi.adr(organizationId!, activeHotel!.id, params),
    enabled:
      !!organizationId &&
      !!activeHotel &&
      enabled &&
      !!params.startDate &&
      !!params.endDate,
  });
};

export const useRevPARReport = (params: ReportParams, enabled = true) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: REPORT_KEYS.revpar(activeHotel?.id ?? "", params),
    queryFn: () => reportsApi.revpar(organizationId!, activeHotel!.id, params),
    enabled:
      !!organizationId &&
      !!activeHotel &&
      enabled &&
      !!params.startDate &&
      !!params.endDate,
  });
};

export const useNightAuditSummary = (date: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: REPORT_KEYS.nightAudit(activeHotel?.id ?? "", date),
    queryFn: () =>
      reportsApi.nightAuditSummary(organizationId!, activeHotel!.id, date),
    enabled: !!organizationId && !!activeHotel && !!date,
  });
};

export const useNightAuditHistory = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: REPORT_KEYS.nightAuditHistory(activeHotel?.id ?? ""),
    queryFn: () =>
      reportsApi.nightAuditHistory(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};
