import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PricingType = "DAILY" | "PACKAGE" | "DERIVED" | "NEGOTIATED";
export type MealPlan =
  | "ROOM_ONLY"
  | "BREAKFAST"
  | "HALF_BOARD"
  | "FULL_BOARD"
  | "ALL_INCLUSIVE";
export type CancellationPolicy =
  | "FLEXIBLE"
  | "MODERATE"
  | "STRICT"
  | "NON_REFUNDABLE";

export interface RatePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  roomTypeId: string;
  pricing: {
    type: PricingType;
    baseRate: number;
    currencyCode: string;
    calculatedRate?: number;
  };
  restrictions: {
    minAdvanceDays: number | null;
    maxAdvanceDays: number | null;
    minStay: number;
    maxStay: number | null;
    isRefundable: boolean;
    cancellationPolicy: CancellationPolicy;
  };
  distribution: { isPublic: boolean; channelCodes: string[] };
  inclusions: { mealPlan: MealPlan; includedAmenities: string[] };
  dynamicPricing: { rules: unknown[]; isActive: boolean };
  validity: {
    isActive: boolean;
    validFrom: string | null;
    validUntil: string | null;
    isCurrentlyValid: boolean;
  };
  stats?: { bookingsCount: number; totalRevenue: number; averageRate: number };
  createdAt: string;
  updatedAt: string;
}

export interface RatePlanListItem {
  id: string;
  code: string;
  name: string;
  roomType: { id: string; code: string; name: string };
  baseRate: number;
  currencyCode: string;
  isActive: boolean;
  isPublic: boolean;
  validFrom: string | null;
  validUntil: string | null;
}

export interface RatePlanListResponse {
  ratePlans: RatePlanListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RateCalendarDay {
  date: string;
  baseRate: number;
  overrideRate: number | null;
  finalRate: number;
  stopSell: boolean;
  minStay: number | null;
  isValid: boolean;
}

export interface RateCalendarResponse {
  ratePlanId: string;
  ratePlanCode: string;
  ratePlanName: string;
  roomTypeId: string;
  roomTypeCode: string;
  currencyCode: string;
  dates: RateCalendarDay[];
}

export interface NightlyRate {
  date: string;
  baseRate: number;
  adjustments: Array<{ ruleType: string; description: string; amount: number }>;
  finalRate: number;
}

export interface CalculatedRatePlan {
  ratePlanId: string;
  ratePlanCode: string;
  ratePlanName: string;
  nightlyRates: NightlyRate[];
  totalNights: number;
  subtotal: number;
  taxes: number;
  total: number;
  currencyCode: string;
  restrictions: {
    minStayMet: boolean;
    maxStayMet: boolean;
    advanceBookingMet: boolean;
    cancellationPolicy: CancellationPolicy;
  };
  inclusions: { mealPlan: MealPlan; amenities: string[] };
}

export interface RateCalculationResult {
  roomTypeId: string;
  roomTypeName: string;
  availableRatePlans: CalculatedRatePlan[];
  bestAvailableRate: number | null;
}

export interface RateCalculationInput {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  channelCode?: string;
}

export interface RateOverrideInput {
  date: string;
  rate: number;
  stopSell?: boolean;
  minStay?: number | null;
  reason?: string;
}

export interface BulkRateOverrideInput {
  startDate: string;
  endDate: string;
  rate?: number;
  stopSell?: boolean;
  minStay?: number | null;
  reason?: string;
  daysOfWeek?: number[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const RATE_PLAN_KEYS = {
  lists: (hotelId: string) => ["ratePlans", "list", hotelId] as const,
  list: (hotelId: string, params?: Record<string, unknown>) =>
    ["ratePlans", "list", hotelId, params] as const,
  detail: (id: string) => ["ratePlans", "detail", id] as const,
  calendar: (id: string, start: string, end: string) =>
    ["ratePlans", "calendar", id, start, end] as const,
  calculate: (hotelId: string, input: RateCalculationInput) =>
    ["ratePlans", "calculate", hotelId, input] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const ratePlanApi = {
  list: (orgId: string, hotelId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<{
        data: RatePlanListResponse;
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans`, { params })
      .then((r) => r.data.data),

  getById: (orgId: string, hotelId: string, id: string, withStats = false) =>
    apiClient
      .get<{
        data: { ratePlan: RatePlan };
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}`, { params: { stats: withStats } })
      .then((r) => r.data.data.ratePlan),

  getCalendar: (
    orgId: string,
    hotelId: string,
    id: string,
    startDate: string,
    endDate: string,
  ) =>
    apiClient
      .get<{
        data: { calendar: RateCalendarResponse };
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}/calendar`, { params: { startDate, endDate } })
      .then((r) => r.data.data.calendar),

  calculate: (orgId: string, hotelId: string, input: RateCalculationInput) =>
    apiClient
      .post<{
        data: RateCalculationResult;
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/calculate`, input)
      .then((r) => r.data.data),

  updateOverride: (
    orgId: string,
    hotelId: string,
    id: string,
    input: RateOverrideInput,
  ) =>
    apiClient
      .put<{
        data: { override: unknown };
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}/overrides`, input)
      .then((r) => r.data.data),

  bulkOverride: (
    orgId: string,
    hotelId: string,
    id: string,
    input: BulkRateOverrideInput,
  ) =>
    apiClient
      .post<{
        data: { updatedCount: number };
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}/overrides/bulk`, input)
      .then((r) => r.data.data),

  deleteOverride: (orgId: string, hotelId: string, id: string, date: string) =>
    apiClient
      .delete(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}/overrides`, {
        data: { date },
      })
      .then((r) => r.data),

  clone: (
    orgId: string,
    hotelId: string,
    id: string,
    input: {
      newCode: string;
      newName: string;
      roomTypeId?: string;
      adjustRateByPercent?: number;
    },
  ) =>
    apiClient
      .post<{
        data: { ratePlan: RatePlan };
      }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}/clone`, input)
      .then((r) => r.data.data.ratePlan),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useRatePlans = (params?: Record<string, unknown>) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: RATE_PLAN_KEYS.list(activeHotel?.id ?? "", params),
    queryFn: () => ratePlanApi.list(organizationId!, activeHotel!.id, params),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useRatePlan = (id: string, withStats = false) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: RATE_PLAN_KEYS.detail(id),
    queryFn: () =>
      ratePlanApi.getById(organizationId!, activeHotel!.id, id, withStats),
    enabled: !!organizationId && !!activeHotel && !!id,
  });
};

export const useRateCalendar = (
  id: string,
  startDate: string,
  endDate: string,
) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: RATE_PLAN_KEYS.calendar(id, startDate, endDate),
    queryFn: () =>
      ratePlanApi.getCalendar(
        organizationId!,
        activeHotel!.id,
        id,
        startDate,
        endDate,
      ),
    enabled:
      !!organizationId && !!activeHotel && !!id && !!startDate && !!endDate,
  });
};

export const useCalculateRates = (
  input: RateCalculationInput,
  enabled = true,
) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: RATE_PLAN_KEYS.calculate(activeHotel?.id ?? "", input),
    queryFn: () =>
      ratePlanApi.calculate(organizationId!, activeHotel!.id, input),
    enabled:
      !!organizationId &&
      !!activeHotel &&
      enabled &&
      !!input.roomTypeId &&
      !!input.checkIn &&
      !!input.checkOut,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useUpdateRateOverride = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RateOverrideInput }) =>
      ratePlanApi.updateOverride(organizationId!, activeHotel!.id, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.detail(id) });
      toast.success("Rate override saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Override failed"),
  });
};

export const useBulkRateOverride = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BulkRateOverrideInput }) =>
      ratePlanApi.bulkOverride(organizationId!, activeHotel!.id, id, input),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.detail(id) });
      toast.success(`Updated ${data.updatedCount} days`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Bulk override failed"),
  });
};

export const useDeleteRateOverride = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      ratePlanApi.deleteOverride(organizationId!, activeHotel!.id, id, date),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.detail(id) });
      toast.success("Override removed");
    },
    onError: (err: Error) => toast.error(err.message ?? "Delete failed"),
  });
};

export interface CreateRatePlanInput {
  code: string;
  name: string;
  description?: string;
  roomTypeId: string;
  pricingType?: PricingType;
  baseRate: number;
  currencyCode?: string;
  minAdvanceDays?: number;
  maxAdvanceDays?: number;
  minStay?: number;
  maxStay?: number;
  isRefundable?: boolean;
  cancellationPolicy?: CancellationPolicy;
  isPublic?: boolean;
  channelCodes?: string[];
  mealPlan?: MealPlan;
  includedAmenities?: string[];
  validFrom?: string | null;
  validUntil?: string | null;
}

const ratePlanMutations = {
  create: (orgId: string, hotelId: string, input: CreateRatePlanInput) =>
    apiClient
      .post<{ data: { ratePlan: RatePlan } }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans`, input)
      .then((r) => r.data.data.ratePlan),

  update: (orgId: string, hotelId: string, id: string, input: Partial<CreateRatePlanInput>) =>
    apiClient
      .put<{ data: { ratePlan: RatePlan } }>(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}`, input)
      .then((r) => r.data.data.ratePlan),

  delete: (orgId: string, hotelId: string, id: string) =>
    apiClient
      .delete(`/organizations/${orgId}/hotels/${hotelId}/rate-plans/${id}`)
      .then((r) => r.data),
};

export const useCreateRatePlan = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateRatePlanInput) =>
      ratePlanMutations.create(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.lists(activeHotel!.id) });
      toast.success("Rate plan created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create rate plan"),
  });
};

export const useUpdateRatePlan = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateRatePlanInput> }) =>
      ratePlanMutations.update(organizationId!, activeHotel!.id, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.lists(activeHotel!.id) });
      toast.success("Rate plan updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update rate plan"),
  });
};

export const useDeleteRatePlan = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) =>
      ratePlanMutations.delete(organizationId!, activeHotel!.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.lists(activeHotel!.id) });
      toast.success("Rate plan deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete rate plan"),
  });
};

export const useCloneRatePlan = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        newCode: string;
        newName: string;
        roomTypeId?: string;
        adjustRateByPercent?: number;
      };
    }) => ratePlanApi.clone(organizationId!, activeHotel!.id, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RATE_PLAN_KEYS.lists(activeHotel!.id) });
      toast.success("Rate plan cloned");
    },
    onError: (err: Error) => toast.error(err.message ?? "Clone failed"),
  });
};
