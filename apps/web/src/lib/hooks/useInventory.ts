import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InventoryCategory =
  | "ROOM_SUPPLIES"
  | "MINIBAR"
  | "CLEANING"
  | "FANDB"
  | "MAINTENANCE"
  | "OFFICE"
  | "UNIFORM"
  | "MARKETING"
  | "OTHER";

export type TransactionType =
  | "PURCHASE"
  | "CONSUMPTION"
  | "ADJUSTMENT"
  | "RETURN"
  | "TRANSFER"
  | "WASTE"
  | "OPENING";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SENT"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED"
  | "CLOSED";

export interface InventoryItem {
  id: string;
  hotelId: string;
  sku: string;
  name: string;
  description: string | null;
  category: InventoryCategory;
  unitOfMeasure: string;
  parLevel: number;
  reorderPoint: number;
  reorderQty: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  avgUnitCost: number;
  lastUnitCost: number;
  trackExpiry: boolean;
  trackBatches: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  type: TransactionType;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  refType: string | null;
  refId: string | null;
  notes: string | null;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface Vendor {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: Record<string, any> | null;
  paymentTerms: string | null;
  currencyCode: string;
  taxId: string | null;
  isApproved: boolean;
  isActive: boolean;
  rating: number | null;
  lastOrderDate: string | null;
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  hotelId: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDelivery: string | null;
  receivedDate: string | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  requestedBy: string;
  requestedByName: string;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  poId: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
}

export interface CreateInventoryItemInput {
  sku: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  unitOfMeasure: string;
  parLevel: number;
  reorderPoint: number;
  reorderQty: number;
  avgUnitCost?: number;
  trackExpiry?: boolean;
  trackBatches?: boolean;
}

export interface UpdateInventoryItemInput {
  name?: string;
  description?: string | null;
  category?: InventoryCategory;
  unitOfMeasure?: string;
  parLevel?: number;
  reorderPoint?: number;
  reorderQty?: number;
  isActive?: boolean;
}

export interface AdjustStockInput {
  quantity: number;
  reason: string;
  unitCost?: number;
  notes?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface ConsumeStockInput {
  quantity: number;
  department: string;
  notes?: string;
  refType?: string;
  refId?: string;
}

export interface PhysicalCountInput {
  items: Array<{
    itemId: string;
    countedQty: number;
    notes?: string;
  }>;
}

export interface CreateVendorInput {
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Record<string, any>;
  paymentTerms?: string;
  currencyCode?: string;
  taxId?: string;
}

export interface UpdateVendorInput {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Record<string, any>;
  paymentTerms?: string;
  rating?: number | null;
  isActive?: boolean;
}

export interface CreatePurchaseOrderInput {
  vendorId: string;
  expectedDelivery?: string;
  notes?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface ReceiveGoodsInput {
  receivedDate: string;
  items: Array<{
    poItemId: string;
    receivedQty: number;
    unitCost?: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  notes?: string;
}

export interface InventoryFilters {
  category?: InventoryCategory;
  lowStock?: boolean;
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TransactionFilters {
  itemId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const INVENTORY_KEYS = {
  items: (orgId: string, hotelId: string, filters?: InventoryFilters) =>
    ["inventory", "items", orgId, hotelId, filters] as const,
  item: (orgId: string, hotelId: string, itemId: string) =>
    ["inventory", "item", orgId, hotelId, itemId] as const,
  lowStock: (orgId: string, hotelId: string) =>
    ["inventory", "low-stock", orgId, hotelId] as const,
  transactions: (orgId: string, hotelId: string, filters?: TransactionFilters) =>
    ["inventory", "transactions", orgId, hotelId, filters] as const,
  itemTransactions: (orgId: string, hotelId: string, itemId: string) =>
    ["inventory", "item-transactions", orgId, hotelId, itemId] as const,
};

export const VENDOR_KEYS = {
  list: (orgId: string, hotelId: string) =>
    ["vendors", "list", orgId, hotelId] as const,
  detail: (orgId: string, hotelId: string, vendorId: string) =>
    ["vendors", "detail", orgId, hotelId, vendorId] as const,
};

export const PO_KEYS = {
  list: (orgId: string, hotelId: string, filters?: PurchaseOrderFilters) =>
    ["purchase-orders", "list", orgId, hotelId, filters] as const,
  detail: (orgId: string, hotelId: string, poId: string) =>
    ["purchase-orders", "detail", orgId, hotelId, poId] as const,
};

// ─── API ──────────────────────────────────────────────────────────────────────

const inventoryApi = {
  items: (orgId: string, hotelId: string, filters?: InventoryFilters) =>
    apiClient
      .get<{ data: { items: InventoryItem[]; total: number; page: number; pageSize: number } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items`,
        { params: filters },
      )
      .then((r) => r.data.data),

  item: (orgId: string, hotelId: string, itemId: string) =>
    apiClient
      .get<{ data: { item: InventoryItem } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items/${itemId}`,
      )
      .then((r) => r.data.data.item),

  lowStock: (orgId: string, hotelId: string) =>
    apiClient
      .get<{ data: { items: InventoryItem[] } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/low-stock`,
      )
      .then((r) => r.data.data),

  transactions: (orgId: string, hotelId: string, filters?: TransactionFilters) =>
    apiClient
      .get<{ data: { transactions: InventoryTransaction[]; total: number; page: number; pageSize: number } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/transactions`,
        { params: filters },
      )
      .then((r) => r.data.data),

  itemTransactions: (orgId: string, hotelId: string, itemId: string) =>
    apiClient
      .get<{ data: { transactions: InventoryTransaction[] } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items/${itemId}/transactions`,
      )
      .then((r) => r.data.data.transactions ?? []),

  createItem: (orgId: string, hotelId: string, input: CreateInventoryItemInput) =>
    apiClient
      .post<{ data: { item: InventoryItem } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items`,
        input,
      )
      .then((r) => r.data.data.item),

  updateItem: (orgId: string, hotelId: string, itemId: string, input: UpdateInventoryItemInput) =>
    apiClient
      .patch<{ data: { item: InventoryItem } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items/${itemId}`,
        input,
      )
      .then((r) => r.data.data.item),

  adjustStock: (orgId: string, hotelId: string, itemId: string, input: AdjustStockInput) =>
    apiClient
      .post<{ data: { item: InventoryItem } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items/${itemId}/adjust`,
        input,
      )
      .then((r) => r.data.data.item),

  consumeStock: (orgId: string, hotelId: string, itemId: string, input: ConsumeStockInput) =>
    apiClient
      .post<{ data: { item: InventoryItem } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/items/${itemId}/consume`,
        input,
      )
      .then((r) => r.data.data.item),

  physicalCount: (orgId: string, hotelId: string, input: PhysicalCountInput) =>
    apiClient
      .post<{ data: { updated: number } }>(
        `/organizations/${orgId}/hotels/${hotelId}/inventory/physical-count`,
        input,
      )
      .then((r) => r.data.data),
};

const vendorApi = {
  list: (orgId: string, hotelId: string) =>
    apiClient
      .get<{ data: { vendors: Vendor[] } }>(
        `/organizations/${orgId}/hotels/${hotelId}/vendors`,
      )
      .then((r) => r.data.data),

  detail: (orgId: string, hotelId: string, vendorId: string) =>
    apiClient
      .get<{ data: { vendor: Vendor } }>(
        `/organizations/${orgId}/hotels/${hotelId}/vendors/${vendorId}`,
      )
      .then((r) => r.data.data.vendor),

  create: (orgId: string, hotelId: string, input: CreateVendorInput) =>
    apiClient
      .post<{ data: { vendor: Vendor } }>(
        `/organizations/${orgId}/hotels/${hotelId}/vendors`,
        input,
      )
      .then((r) => r.data.data.vendor),

  update: (orgId: string, hotelId: string, vendorId: string, input: UpdateVendorInput) =>
    apiClient
      .patch<{ data: { vendor: Vendor } }>(
        `/organizations/${orgId}/hotels/${hotelId}/vendors/${vendorId}`,
        input,
      )
      .then((r) => r.data.data.vendor),

  approve: (orgId: string, hotelId: string, vendorId: string) =>
    apiClient
      .patch<{ data: { vendor: Vendor } }>(
        `/organizations/${orgId}/hotels/${hotelId}/vendors/${vendorId}`,
        { isApproved: true },
      )
      .then((r) => r.data.data.vendor),
};

const poApi = {
  list: (orgId: string, hotelId: string, filters?: PurchaseOrderFilters) =>
    apiClient
      .get<{ data: { orders: PurchaseOrder[]; total: number; page: number; pageSize: number } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders`,
        { params: filters },
      )
      .then((r) => r.data.data),

  detail: (orgId: string, hotelId: string, poId: string) =>
    apiClient
      .get<{ data: { order: PurchaseOrder } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders/${poId}`,
      )
      .then((r) => r.data.data.order),

  create: (orgId: string, hotelId: string, input: CreatePurchaseOrderInput) =>
    apiClient
      .post<{ data: { order: PurchaseOrder } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders`,
        input,
      )
      .then((r) => r.data.data.order),

  submit: (orgId: string, hotelId: string, poId: string) =>
    apiClient
      .post<{ data: { order: PurchaseOrder } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders/${poId}/submit`,
      )
      .then((r) => r.data.data.order),

  approve: (orgId: string, hotelId: string, poId: string) =>
    apiClient
      .post<{ data: { order: PurchaseOrder } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders/${poId}/approve`,
      )
      .then((r) => r.data.data.order),

  receive: (orgId: string, hotelId: string, poId: string, input: ReceiveGoodsInput) =>
    apiClient
      .post<{ data: { order: PurchaseOrder } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders/${poId}/receive`,
        input,
      )
      .then((r) => r.data.data.order),

  cancel: (orgId: string, hotelId: string, poId: string, reason?: string) =>
    apiClient
      .post<{ data: { order: PurchaseOrder } }>(
        `/organizations/${orgId}/hotels/${hotelId}/purchase-orders/${poId}/cancel`,
        { reason },
      )
      .then((r) => r.data.data.order),
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useInventoryItems = (filters?: InventoryFilters) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: INVENTORY_KEYS.items(organizationId ?? "", activeHotel?.id ?? "", filters),
    queryFn: () => inventoryApi.items(organizationId!, activeHotel!.id, filters),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useInventoryItem = (itemId: string | null) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: INVENTORY_KEYS.item(organizationId ?? "", activeHotel?.id ?? "", itemId ?? ""),
    queryFn: () => inventoryApi.item(organizationId!, activeHotel!.id, itemId!),
    enabled: !!organizationId && !!activeHotel && !!itemId,
  });
};

export const useLowStockItems = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: INVENTORY_KEYS.lowStock(organizationId ?? "", activeHotel?.id ?? ""),
    queryFn: () => inventoryApi.lowStock(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
    refetchInterval: 10 * 60 * 1000,
  });
};

export const useInventoryTransactions = (filters?: TransactionFilters) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: INVENTORY_KEYS.transactions(organizationId ?? "", activeHotel?.id ?? "", filters),
    queryFn: () => inventoryApi.transactions(organizationId!, activeHotel!.id, filters),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useItemTransactions = (itemId: string | null) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: INVENTORY_KEYS.itemTransactions(organizationId ?? "", activeHotel?.id ?? "", itemId ?? ""),
    queryFn: () => inventoryApi.itemTransactions(organizationId!, activeHotel!.id, itemId!),
    enabled: !!organizationId && !!activeHotel && !!itemId,
  });
};

export const useVendors = () => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: VENDOR_KEYS.list(organizationId ?? "", activeHotel?.id ?? ""),
    queryFn: () => vendorApi.list(organizationId!, activeHotel!.id),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const useVendor = (vendorId: string | null) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: VENDOR_KEYS.detail(organizationId ?? "", activeHotel?.id ?? "", vendorId ?? ""),
    queryFn: () => vendorApi.detail(organizationId!, activeHotel!.id, vendorId!),
    enabled: !!organizationId && !!activeHotel && !!vendorId,
  });
};

export const usePurchaseOrders = (filters?: PurchaseOrderFilters) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: PO_KEYS.list(organizationId ?? "", activeHotel?.id ?? "", filters),
    queryFn: () => poApi.list(organizationId!, activeHotel!.id, filters),
    enabled: !!organizationId && !!activeHotel,
  });
};

export const usePurchaseOrder = (poId: string | null) => {
  const { organizationId, activeHotel } = useAuthStore();
  return useQuery({
    queryKey: PO_KEYS.detail(organizationId ?? "", activeHotel?.id ?? "", poId ?? ""),
    queryFn: () => poApi.detail(organizationId!, activeHotel!.id, poId!),
    enabled: !!organizationId && !!activeHotel && !!poId,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateInventoryItem = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateInventoryItemInput) =>
      inventoryApi.createItem(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory", "items", organizationId, activeHotel!.id] });
      toast.success("Item created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create item"),
  });
};

export const useUpdateInventoryItem = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateInventoryItemInput }) =>
      inventoryApi.updateItem(organizationId!, activeHotel!.id, itemId, input),
    onSuccess: (_, { itemId }) => {
      qc.invalidateQueries({ queryKey: ["inventory", "item", organizationId, activeHotel!.id, itemId] });
      qc.invalidateQueries({ queryKey: ["inventory", "items", organizationId, activeHotel!.id] });
      toast.success("Item updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update item"),
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: AdjustStockInput }) =>
      inventoryApi.adjustStock(organizationId!, activeHotel!.id, itemId, input),
    onSuccess: (_, { itemId }) => {
      const orgId = organizationId;
      const hid = activeHotel!.id;
      qc.invalidateQueries({ queryKey: ["inventory", "item", orgId, hid, itemId] });
      qc.invalidateQueries({ queryKey: ["inventory", "items", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "transactions", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "low-stock", orgId, hid] });
      toast.success("Stock adjusted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Stock adjustment failed"),
  });
};

export const useConsumeStock = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: ConsumeStockInput }) =>
      inventoryApi.consumeStock(organizationId!, activeHotel!.id, itemId, input),
    onSuccess: (_, { itemId }) => {
      const orgId = organizationId;
      const hid = activeHotel!.id;
      qc.invalidateQueries({ queryKey: ["inventory", "item", orgId, hid, itemId] });
      qc.invalidateQueries({ queryKey: ["inventory", "items", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "transactions", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "low-stock", orgId, hid] });
      toast.success("Consumption recorded");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to record consumption"),
  });
};

export const usePhysicalCount = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: PhysicalCountInput) =>
      inventoryApi.physicalCount(organizationId!, activeHotel!.id, input),
    onSuccess: (data) => {
      const orgId = organizationId;
      const hid = activeHotel!.id;
      qc.invalidateQueries({ queryKey: ["inventory", "items", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "transactions", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "low-stock", orgId, hid] });
      toast.success(`Physical count recorded for ${data.updated} items`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Physical count failed"),
  });
};

export const useCreateVendor = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateVendorInput) =>
      vendorApi.create(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors", "list", organizationId, activeHotel!.id] });
      toast.success("Vendor created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create vendor"),
  });
};

export const useUpdateVendor = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ vendorId, input }: { vendorId: string; input: UpdateVendorInput }) =>
      vendorApi.update(organizationId!, activeHotel!.id, vendorId, input),
    onSuccess: (_, { vendorId }) => {
      const orgId = organizationId;
      const hid = activeHotel!.id;
      qc.invalidateQueries({ queryKey: ["vendors", "detail", orgId, hid, vendorId] });
      qc.invalidateQueries({ queryKey: ["vendors", "list", orgId, hid] });
      toast.success("Vendor updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update vendor"),
  });
};

export const useApproveVendor = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (vendorId: string) =>
      vendorApi.approve(organizationId!, activeHotel!.id, vendorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors", "list", organizationId, activeHotel!.id] });
      qc.invalidateQueries({ queryKey: ["vendors", "detail", organizationId, activeHotel!.id] });
      toast.success("Vendor approved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to approve vendor"),
  });
};

export const useCreatePurchaseOrder = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) =>
      poApi.create(organizationId!, activeHotel!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders", "list", organizationId, activeHotel!.id] });
      toast.success("Purchase order created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create purchase order"),
  });
};

export const useSubmitPurchaseOrder = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (poId: string) =>
      poApi.submit(organizationId!, activeHotel!.id, poId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders", "list", organizationId, activeHotel!.id] });
      qc.invalidateQueries({ queryKey: ["purchase-orders", "detail", organizationId, activeHotel!.id] });
      toast.success("PO submitted for approval");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to submit PO"),
  });
};

export const useApprovePurchaseOrder = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: (poId: string) =>
      poApi.approve(organizationId!, activeHotel!.id, poId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders", "list", organizationId, activeHotel!.id] });
      qc.invalidateQueries({ queryKey: ["purchase-orders", "detail", organizationId, activeHotel!.id] });
      toast.success("Purchase order approved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to approve PO"),
  });
};

export const useReceivePurchaseOrder = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ poId, input }: { poId: string; input: ReceiveGoodsInput }) =>
      poApi.receive(organizationId!, activeHotel!.id, poId, input),
    onSuccess: () => {
      const orgId = organizationId;
      const hid = activeHotel!.id;
      qc.invalidateQueries({ queryKey: ["purchase-orders", "list", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["purchase-orders", "detail", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "items", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "transactions", orgId, hid] });
      qc.invalidateQueries({ queryKey: ["inventory", "low-stock", orgId, hid] });
      toast.success("Goods received and stock updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to receive goods"),
  });
};

export const useCancelPurchaseOrder = () => {
  const qc = useQueryClient();
  const { organizationId, activeHotel } = useAuthStore();
  return useMutation({
    mutationFn: ({ poId, reason }: { poId: string; reason?: string }) =>
      poApi.cancel(organizationId!, activeHotel!.id, poId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders", "list", organizationId, activeHotel!.id] });
      qc.invalidateQueries({ queryKey: ["purchase-orders", "detail", organizationId, activeHotel!.id] });
      toast.success("Purchase order cancelled");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to cancel PO"),
  });
};
