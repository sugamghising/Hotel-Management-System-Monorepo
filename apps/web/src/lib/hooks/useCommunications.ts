import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommunicationType =
  | "RESERVATION_CONFIRMATION"
  | "CHECKIN_REMINDER"
  | "CHECKOUT_REMINDER"
  | "MODIFICATION"
  | "CANCELLATION"
  | "WELCOME"
  | "SURVEY"
  | "MARKETING"
  | "ALERT"
  | "CUSTOM";

export type CommunicationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";

export type CommunicationStatus =
  | "PENDING"
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "FAILED"
  | "BOUNCED";

export type CommunicationDirection = "INBOUND" | "OUTBOUND";

export interface Communication {
  id: string;
  organizationId: string;
  hotelId: string | null;
  guestId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  reservationId: string | null;
  confirmationNumber: string | null;
  type: CommunicationType;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject: string | null;
  content: string;
  templateId: string | null;
  templateName: string | null;
  status: CommunicationStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  externalId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CommunicationTemplate {
  id: string;
  organizationId: string;
  name: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  subject: string | null;
  body: string;
  variables: string[];
  isActive: boolean;
  isSystem: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationStats {
  totalSent: number;
  delivered: number;
  opened: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  byChannel: Record<CommunicationChannel, number>;
  byType: Record<CommunicationType, number>;
}

export interface SendCommunicationInput {
  guestId: string;
  reservationId?: string;
  channel: CommunicationChannel;
  type: CommunicationType;
  templateId?: string;
  subject?: string;
  content?: string;
  scheduleAt?: string;
  variables?: Record<string, string>;
}

export interface BulkSendInput {
  guestIds: string[];
  channel: CommunicationChannel;
  type: CommunicationType;
  templateId: string;
  subject?: string;
  variables?: Record<string, string>;
  scheduleAt?: string;
}

export interface CreateTemplateInput {
  name: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
  language?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  subject?: string;
  body?: string;
  language?: string;
  isActive?: boolean;
}

export interface CommunicationLogFilters {
  channel?: CommunicationChannel;
  type?: CommunicationType;
  status?: CommunicationStatus;
  direction?: CommunicationDirection;
  guestId?: string;
  reservationId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CommunicationLogResponse {
  communications: Communication[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TemplatesResponse {
  templates: CommunicationTemplate[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const COMMS_KEYS = {
  log: (orgId: string, hotelId: string, filters: CommunicationLogFilters) =>
    ["comms", "log", orgId, hotelId, filters] as const,
  detail: (orgId: string, id: string) =>
    ["comms", "detail", orgId, id] as const,
  guest: (orgId: string, guestId: string) =>
    ["comms", "guest", orgId, guestId] as const,
  templates: (orgId: string) =>
    ["comms", "templates", orgId] as const,
  template: (orgId: string, templateId: string) =>
    ["comms", "template", orgId, templateId] as const,
  stats: (orgId: string, hotelId: string, dateFrom: string, dateTo: string) =>
    ["comms", "stats", orgId, hotelId, dateFrom, dateTo] as const,
};

// ─── Context ───────────────────────────────────────────────────────────────────

const useCtx = () => {
  const organizationId = useAuthStore((s) => s.organizationId);
  return { orgId: organizationId ?? "" };
};

// ─── Queries ───────────────────────────────────────────────────────────────────

export const useCommunicationLog = (
  hotelId: string | null,
  filters: CommunicationLogFilters,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: COMMS_KEYS.log(orgId, hotelId ?? "", filters),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/hotels/${hotelId}/communications`, { params: filters })
        .then((r) => r.data.data as CommunicationLogResponse),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 60_000,
  });
};

export const useCommunication = (
  hotelId: string | null,
  communicationId: string | null,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: COMMS_KEYS.detail(orgId, communicationId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/communications/${communicationId}`)
        .then((r) => r.data.data as Communication),
    enabled: !!orgId && !!communicationId,
  });
};

export const useGuestCommunications = (
  guestId: string | null,
  hotelId: string | null,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: COMMS_KEYS.guest(orgId, guestId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/guests/${guestId}/communications`)
        .then((r) => r.data.data as CommunicationLogResponse),
    enabled: !!orgId && !!guestId,
  });
};

export const useCommunicationTemplates = (organizationId: string | null) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: COMMS_KEYS.templates(orgId),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/communications/templates`)
        .then((r) => r.data.data as TemplatesResponse),
    enabled: !!orgId,
  });
};

export const useCommunicationTemplate = (
  organizationId: string | null,
  templateId: string | null,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: COMMS_KEYS.template(orgId, templateId ?? ""),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/communications/templates/${templateId}`)
        .then((r) => r.data.data as CommunicationTemplate),
    enabled: !!orgId && !!templateId,
  });
};

export const useCommunicationStats = (
  hotelId: string | null,
  dateFrom: string,
  dateTo: string,
) => {
  const { orgId } = useCtx();
  return useQuery({
    queryKey: COMMS_KEYS.stats(orgId, hotelId ?? "", dateFrom, dateTo),
    queryFn: () =>
      apiClient
        .get(`/${orgId}/communications/analytics`, {
          params: { hotelId, dateFrom, dateTo },
        })
        .then((r) => r.data.data as CommunicationStats),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 300_000,
  });
};

// ─── Mutations ─────────────────────────────────────────────────────────────────

const guardOrg = (orgId: string) => {
  if (!orgId) throw new Error("Organization not configured");
};

export const useSendCommunication = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: (input: SendCommunicationInput) => {
      guardOrg(orgId);
      return apiClient
        .post(`/${orgId}/communications/send`, input)
        .then((r) => r.data.data as Communication);
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ["comms", "log"] });
      if (input.guestId) {
        qc.invalidateQueries({ queryKey: ["comms", "guest", orgId, input.guestId] });
      }
      qc.invalidateQueries({ queryKey: ["comms", "stats"] });
      toast.success("Message sent");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to send message"),
  });
};

export const useBulkSend = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: (input: BulkSendInput) => {
      guardOrg(orgId);
      return apiClient
        .post(`/${orgId}/communications/send/bulk`, input)
        .then((r) => r.data.data as { count: number });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["comms", "log"] });
      qc.invalidateQueries({ queryKey: ["comms", "stats"] });
      toast.success(`Sending to ${data.count} guests`);
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Bulk send failed"),
  });
};

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: (input: CreateTemplateInput) => {
      guardOrg(orgId);
      return apiClient
        .post(`/${orgId}/communications/templates`, input)
        .then((r) => r.data.data as CommunicationTemplate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comms", "templates"] });
      toast.success("Template created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create template"),
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: UpdateTemplateInput;
    }) => {
      guardOrg(orgId);
      return apiClient
        .patch(`/${orgId}/communications/templates/${templateId}`, input)
        .then((r) => r.data.data as CommunicationTemplate);
    },
    onSuccess: (_data, { templateId }) => {
      qc.invalidateQueries({ queryKey: ["comms", "templates"] });
      qc.invalidateQueries({
        queryKey: ["comms", "template", orgId, templateId],
      });
      toast.success("Template saved");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to save template"),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({ templateId }: { templateId: string }) => {
      guardOrg(orgId);
      return apiClient.delete(`/${orgId}/communications/templates/${templateId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comms", "templates"] });
      toast.success("Template deleted");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to delete template"),
  });
};

export const useResendCommunication = () => {
  const qc = useQueryClient();
  const { orgId } = useCtx();
  return useMutation({
    mutationFn: ({ communicationId }: { communicationId: string }) => {
      guardOrg(orgId);
      return apiClient.post(`/${orgId}/communications/${communicationId}/resend`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comms", "log"] });
      toast.success("Message resent");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to resend message"),
  });
};
