import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FolioItemType =
  | "ROOM_CHARGE"
  | "TAX"
  | "SERVICE_CHARGE"
  | "POS_CHARGE"
  | "MINIBAR"
  | "LAUNDRY"
  | "SPA"
  | "TRANSPORT"
  | "PHONE"
  | "ADJUSTMENT"
  | "DISCOUNT"
  | "PAYMENT"
  | "REFUND"
  | "NO_SHOW_FEE";

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "CHECK"
  | "MOBILE_PAYMENT"
  | "GIFT_CARD"
  | "LOYALTY_POINTS"
  | "DIRECT_BILL"
  | "DEPOSIT";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED"
  | "VOIDED";
export type InvoiceStatus =
  | "DRAFT"
  | "OPEN"
  | "PAID"
  | "OVERDUE"
  | "VOID"
  | "CREDIT_NOTE";

export interface FolioItem {
  id: string;
  itemType: FolioItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxAmount: number;
  total: number;
  postedAt: string;
  postedBy: string;
  isVoided: boolean;
  voidedAt: string | null;
  voidedBy: string | null;
  voidReason: string | null;
  source: string | null;
  sourceRef: string | null;
  businessDate: string;
  revenueCode: string;
  department: string;
}

export interface FolioPayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  currencyCode: string;
  status: PaymentStatus;
  cardLastFour: string | null;
  cardBrand: string | null;
  transactionId: string | null;
  authCode: string | null;
  processedAt: string | null;
  isRefund: boolean;
  notes: string | null;
  createdAt: string;
  createdBy: string;
}

export interface FolioInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  billToName: string;
  documentUrl: string | null;
  sentAt: string | null;
  paidAt: string | null;
}

export interface FolioResponse {
  reservationId: string;
  guestName: string;
  roomNumber: string | null;
  summary: {
    currencyCode: string;
    totalCharges: number;
    totalPayments: number;
    totalTaxes: number;
    balance: number;
    deposits: number;
    credits: number;
  };
  items: FolioItem[];
  payments: FolioPayment[];
  invoices: FolioInvoice[];
}

export interface PostChargeInput {
  itemType: FolioItemType;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  taxAmount?: number;
  revenueCode?: string;
  department?: string;
  source?: string;
  sourceRef?: string;
}

export interface PostPaymentInput {
  amount: number;
  method: PaymentMethod;
  cardToken?: string;
  cardLastFour?: string;
  cardBrand?: string;
  notes?: string;
}

export interface RefundInput {
  amount: number;
  reason: string;
  method?: PaymentMethod;
}

export interface CreateInvoiceInput {
  dueDate?: string;
  billToName?: string;
  billToAddress?: Record<string, unknown>;
  itemIds?: string[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const FOLIO_KEYS = {
  folio: (reservationId: string) => ["folio", reservationId] as const,
  payments: (reservationId: string) =>
    ["folio", "payments", reservationId] as const,
  invoices: (reservationId: string) =>
    ["folio", "invoices", reservationId] as const,
  invoice: (reservationId: string, invoiceId: string) =>
    ["folio", "invoice", reservationId, invoiceId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const folioApi = {
  getFolio: (orgId: string, hotelId: string, reservationId: string) =>
    apiClient
      .get<{
        data: FolioResponse;
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/folio`,
      )
      .then((r) => r.data.data),

  postCharge: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    input: PostChargeInput,
  ) =>
    apiClient
      .post<{
        data: { item: FolioItem };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/folio/items`,
        input,
      )
      .then((r) => r.data.data.item),

  batchPostCharges: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    items: PostChargeInput[],
  ) =>
    apiClient
      .post<{
        data: { posted: number; failed: number };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/folio/items/bulk`,
        { items },
      )
      .then((r) => r.data.data),

  voidItem: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    itemId: string,
    reason: string,
  ) =>
    apiClient
      .post<{
        data: { item: FolioItem };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/folio/items/${itemId}/void`,
        { reason },
      )
      .then((r) => r.data.data.item),

  postPayment: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    input: PostPaymentInput,
  ) =>
    apiClient
      .post<{
        data: { payment: FolioPayment; newBalance: number };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/payments`,
        input,
      )
      .then((r) => r.data.data),

  refund: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    paymentId: string,
    input: RefundInput,
  ) =>
    apiClient
      .post<{
        data: { payment: FolioPayment };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/payments/${paymentId}/refund`,
        input,
      )
      .then((r) => r.data.data.payment),

  voidPayment: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    paymentId: string,
  ) =>
    apiClient
      .post<{
        data: { payment: FolioPayment };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/payments/${paymentId}/void`,
        {},
      )
      .then((r) => r.data.data.payment),

  createInvoice: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    input: CreateInvoiceInput,
  ) =>
    apiClient
      .post<{
        data: { invoice: FolioInvoice };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/invoices`,
        input,
      )
      .then((r) => r.data.data.invoice),

  getInvoice: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    invoiceId: string,
  ) =>
    apiClient
      .get<{
        data: { invoice: FolioInvoice };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/invoices/${invoiceId}`,
      )
      .then((r) => r.data.data.invoice),

  sendInvoice: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    invoiceId: string,
  ) =>
    apiClient
      .post<{
        data: unknown;
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/invoices/${invoiceId}/send`,
        {},
      )
      .then((r) => r.data),

  voidInvoice: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    invoiceId: string,
  ) =>
    apiClient
      .post<{
        data: { invoice: FolioInvoice };
      }>(
        `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/invoices/${invoiceId}/void`,
        {},
      )
      .then((r) => r.data.data.invoice),

  getInvoicePdfUrl: (
    orgId: string,
    hotelId: string,
    reservationId: string,
    invoiceId: string,
  ) =>
    `/api/v1/organizations/${orgId}/hotels/${hotelId}/reservations/${reservationId}/invoices/${invoiceId}/pdf`,
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useFolio = (reservationId: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: FOLIO_KEYS.folio(reservationId),
    queryFn: () =>
      folioApi.getFolio(organizationId!, activeHotel!.id, reservationId),
    enabled: !!organizationId && !!activeHotel && !!reservationId,
  });
};

export const useInvoice = (reservationId: string, invoiceId: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: FOLIO_KEYS.invoice(reservationId, invoiceId),
    queryFn: () =>
      folioApi.getInvoice(
        organizationId!,
        activeHotel!.id,
        reservationId,
        invoiceId,
      ),
    enabled:
      !!organizationId && !!activeHotel && !!reservationId && !!invoiceId,
  });
};

export const useInvoicePdfUrl = (reservationId: string, invoiceId: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  if (!organizationId || !activeHotel) return null;
  return folioApi.getInvoicePdfUrl(
    organizationId,
    activeHotel.id,
    reservationId,
    invoiceId,
  );
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const usePostCharge = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: PostChargeInput) =>
      folioApi.postCharge(
        organizationId!,
        activeHotel!.id,
        reservationId,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success("Charge posted");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to post charge"),
  });
};

export const useBatchPostCharges = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (items: PostChargeInput[]) =>
      folioApi.batchPostCharges(
        organizationId!,
        activeHotel!.id,
        reservationId,
        items,
      ),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success(`Posted ${data.posted} charges`);
      if (data.failed > 0) toast.warning(`${data.failed} charges failed`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Batch post failed"),
  });
};

export const useVoidFolioItem = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) =>
      folioApi.voidItem(
        organizationId!,
        activeHotel!.id,
        reservationId,
        itemId,
        reason,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success("Charge voided");
    },
    onError: (err: Error) => toast.error(err.message ?? "Void failed"),
  });
};

export const usePostPayment = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: PostPaymentInput) =>
      folioApi.postPayment(
        organizationId!,
        activeHotel!.id,
        reservationId,
        input,
      ),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success(
        `Payment of ${data.newBalance === 0 ? "full balance" : data.newBalance} processed`,
      );
    },
    onError: (err: Error) => toast.error(err.message ?? "Payment failed"),
  });
};

export const useRefundPayment = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({
      paymentId,
      input,
    }: {
      paymentId: string;
      input: RefundInput;
    }) =>
      folioApi.refund(
        organizationId!,
        activeHotel!.id,
        reservationId,
        paymentId,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success("Refund processed");
    },
    onError: (err: Error) => toast.error(err.message ?? "Refund failed"),
  });
};

export const useVoidPayment = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (paymentId: string) =>
      folioApi.voidPayment(
        organizationId!,
        activeHotel!.id,
        reservationId,
        paymentId,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success("Payment voided");
    },
    onError: (err: Error) => toast.error(err.message ?? "Void payment failed"),
  });
};

export const useCreateInvoice = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) =>
      folioApi.createInvoice(
        organizationId!,
        activeHotel!.id,
        reservationId,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success("Invoice created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create invoice"),
  });
};

export const useSendInvoice = (reservationId: string) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (invoiceId: string) =>
      folioApi.sendInvoice(
        organizationId!,
        activeHotel!.id,
        reservationId,
        invoiceId,
      ),
    onSuccess: () => toast.success("Invoice sent"),
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to send invoice"),
  });
};

export const useVoidInvoice = (reservationId: string) => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (invoiceId: string) =>
      folioApi.voidInvoice(
        organizationId!,
        activeHotel!.id,
        reservationId,
        invoiceId,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FOLIO_KEYS.folio(reservationId) });
      toast.success("Invoice voided");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to void invoice"),
  });
};
