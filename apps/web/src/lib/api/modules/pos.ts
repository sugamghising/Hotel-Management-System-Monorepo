// apps/web/src/lib/api/modules/pos.ts
import { apiClient } from "../client";

export interface POSOutlet {
  id: string;
  name: string;
  code: string;
  type: "RESTAURANT" | "BAR" | "CAFE" | "ROOM_SERVICE" | "OTHER";
  isActive: boolean;
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
  status: "OPEN" | "CLOSED" | "PAID" | "VOID" | "COMPED";
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
  status: "OPEN" | "CLOSED" | "PAID" | "VOID" | "COMPED";
  total: number;
  paidAmount: number;
  itemCount: number;
  postedToRoom: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface POSPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const posApi = {
  listOrders: async (
    orgId: string,
    hotelId: string,
    params?: Record<string, unknown>,
  ): Promise<{ orders: POSOrderListItem[]; pagination: POSPagination }> => {
    const { data } = await apiClient.get(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders`,
      { params },
    );
    return data.data;
  },

  getOrder: async (
    orgId: string,
    hotelId: string,
    orderId: string,
  ): Promise<POSOrder> => {
    const { data } = await apiClient.get(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}`,
    );
    return data.data;
  },

  listOutlets: async (
    orgId: string,
    hotelId: string,
  ): Promise<{ outlets: POSOutlet[] }> => {
    const { data } = await apiClient.get(
      `/organizations/${orgId}/hotels/${hotelId}/pos/outlets`,
    );
    return data.data;
  },

  listMenu: async (
    orgId: string,
    hotelId: string,
  ): Promise<{ items: POSMenuItem[] }> => {
    const { data } = await apiClient.get(
      `/organizations/${orgId}/hotels/${hotelId}/pos/menu`,
    );
    return data.data;
  },

  createOrder: async (
    orgId: string,
    hotelId: string,
    input: { outlet: string; tableNumber?: string; roomNumber?: string; reservationId?: string },
  ): Promise<POSOrder> => {
    const { data } = await apiClient.post(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders`,
      input,
    );
    return data.data;
  },

  addItem: async (
    orgId: string,
    hotelId: string,
    orderId: string,
    input: {
      itemName: string;
      itemCode?: string;
      quantity: number;
      unitPrice: number;
      modifications?: string;
      specialInstructions?: string;
    },
  ): Promise<void> => {
    await apiClient.post(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/items`,
      input,
    );
  },

  updateItem: async (
    orgId: string,
    hotelId: string,
    orderId: string,
    itemId: string,
    input: {
      quantity?: number;
      unitPrice?: number;
      modifications?: string;
      specialInstructions?: string;
    },
  ): Promise<void> => {
    await apiClient.patch(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/items/${itemId}`,
      input,
    );
  },

  voidItem: async (
    orgId: string,
    hotelId: string,
    orderId: string,
    itemId: string,
    reason?: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/items/${itemId}`,
      { data: reason ? { reason } : undefined },
    );
  },

  closeOrder: async (
    orgId: string,
    hotelId: string,
    orderId: string,
    input: { amount: number; method: string },
  ): Promise<void> => {
    await apiClient.post(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/close`,
      input,
    );
  },

  voidOrder: async (
    orgId: string,
    hotelId: string,
    orderId: string,
  ): Promise<void> => {
    await apiClient.post(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/void`,
    );
  },

  postToRoom: async (
    orgId: string,
    hotelId: string,
    orderId: string,
    input: { reservationId: string },
  ): Promise<void> => {
    await apiClient.post(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/post-to-room`,
      input,
    );
  },

  reopenOrder: async (
    orgId: string,
    hotelId: string,
    orderId: string,
  ): Promise<void> => {
    await apiClient.post(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}/reopen`,
    );
  },

  updateOrder: async (
    orgId: string,
    hotelId: string,
    orderId: string,
    input: { tableNumber?: string; roomNumber?: string },
  ): Promise<void> => {
    await apiClient.patch(
      `/organizations/${orgId}/hotels/${hotelId}/pos/orders/${orderId}`,
      input,
    );
  },
};
