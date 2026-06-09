import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { posApi } from "@/lib/api/modules/pos";
import { toast } from "sonner";

export type POSOrderStatus = "OPEN" | "CLOSED" | "PAID" | "VOID" | "COMPED";

export interface POSOrderItem {
  id: string;
  orderId: string;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifications?: string;
  specialInstructions?: string;
  isVoided: boolean;
  voidReason?: string;
}

export interface POSOrder {
  id: string;
  organizationId: string;
  hotelId: string;
  reservationId?: string;
  orderNumber: string;
  outlet: string;
  tableNumber?: string;
  roomNumber?: string;
  status: POSOrderStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  serviceCharge: number;
  total: number;
  paymentMethod?: string;
  paidAmount: number;
  postedToRoom: boolean;
  postedToFolioAt?: string;
  serverId: string;
  createdAt: string;
  closedAt?: string;
  items: POSOrderItem[];
}

export interface POSOrderListItem {
  id: string;
  orderNumber: string;
  outlet: string;
  tableNumber?: string;
  roomNumber?: string;
  status: POSOrderStatus;
  total: number;
  paidAmount: number;
  itemCount: number;
  postedToRoom: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface POSMenuItem {
  id: string;
  name: string;
  code?: string;
  category: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

export interface POSOutlet {
  id: string;
  name: string;
  code: string;
  type: "RESTAURANT" | "BAR" | "CAFE" | "ROOM_SERVICE" | "OTHER";
  isActive: boolean;
}

export interface POSListParams {
  status?: POSOrderStatus | "ALL";
  outlet?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderInput {
  outlet: string;
  tableNumber?: string;
  roomNumber?: string;
  reservationId?: string;
}

export interface AddItemInput {
  orderId: string;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  modifications?: string;
  specialInstructions?: string;
}

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  method: string;
}

export interface PostToRoomInput {
  orderId: string;
  reservationId: string;
}

export const POS_KEYS = {
  orders: (hotelId: string, params?: Record<string, unknown>) =>
    ["pos", "orders", hotelId, params] as const,
  order: (hotelId: string, orderId: string) =>
    ["pos", "order", hotelId, orderId] as const,
  outlets: (hotelId: string) =>
    ["pos", "outlets", hotelId] as const,
  menu: (hotelId: string) =>
    ["pos", "menu", hotelId] as const,
};

const useCtx = () => {
  const organizationId = useAuthStore((s) => s.organizationId);
  const activeHotel = useAuthStore((s) => s.activeHotel);
  return { orgId: organizationId ?? "", hotelId: activeHotel?.id ?? "" };
};

export const usePOSOrders = (params?: POSListParams) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: POS_KEYS.orders(hotelId, params as Record<string, unknown>),
    queryFn: () => posApi.listOrders(orgId, hotelId, params as Record<string, unknown>),
    enabled: !!orgId && !!hotelId,
    refetchInterval: 60_000,
  });
};

export const usePOSOrder = (orderId: string | null) => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: POS_KEYS.order(hotelId, orderId ?? ""),
    queryFn: () => posApi.getOrder(orgId, hotelId, orderId!),
    enabled: !!orgId && !!hotelId && !!orderId,
  });
};

export const usePOSOutlets = () => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: POS_KEYS.outlets(hotelId),
    queryFn: () => posApi.listOutlets(orgId, hotelId),
    enabled: !!orgId && !!hotelId,
  });
};

export const usePOSMenu = () => {
  const { orgId, hotelId } = useCtx();
  return useQuery({
    queryKey: POS_KEYS.menu(hotelId),
    queryFn: () => posApi.listMenu(orgId, hotelId),
    enabled: !!orgId && !!hotelId,
  });
};

export const useCreatePOSOrder = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      posApi.createOrder(orgId, hotelId, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
      toast.success(`Order #${data.orderNumber} opened`);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create order"),
  });
};

export const useAddPOSItem = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: (input: AddItemInput) => {
      const { orderId, ...payload } = input;
      return posApi.addItem(orgId, hotelId, orderId, payload);
    },
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add item"),
  });
};

export const useUpdatePOSItem = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      input,
    }: {
      orderId: string;
      itemId: string;
      input: {
        quantity?: number;
        unitPrice?: number;
        modifications?: string;
        specialInstructions?: string;
      };
    }) => posApi.updateItem(orgId, hotelId, orderId, itemId, input),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update item"),
  });
};

export const useVoidPOSItem = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: string; itemId: string; reason?: string }) =>
      posApi.voidItem(orgId, hotelId, orderId, itemId, reason),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
      toast.success("Item removed");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to remove item"),
  });
};

export const useUpdatePOSOrder = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ orderId, ...input }: { orderId: string; tableNumber?: string; roomNumber?: string }) =>
      posApi.updateOrder(orgId, hotelId, orderId, input),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update order"),
  });
};

export const useVoidPOSOrder = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: (orderId: string) =>
      posApi.voidOrder(orgId, hotelId, orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      toast.success("Order voided");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to void order"),
  });
};

export const useProcessPOSPayment = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ orderId, amount, method }: ProcessPaymentInput) =>
      posApi.closeOrder(orgId, hotelId, orderId, { amount, method }),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      toast.success("Payment processed");
    },
    onError: (err: Error) => toast.error(err.message || "Payment failed"),
  });
};

export const usePostPOSToRoom = () => {
  const qc = useQueryClient();
  const { orgId, hotelId } = useCtx();
  return useMutation({
    mutationFn: ({ orderId, reservationId }: PostToRoomInput) =>
      posApi.postToRoom(orgId, hotelId, orderId, { reservationId }),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: POS_KEYS.orders(hotelId) });
      qc.invalidateQueries({ queryKey: POS_KEYS.order(hotelId, orderId) });
      toast.success("Charges posted to room");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to post to room"),
  });
};
