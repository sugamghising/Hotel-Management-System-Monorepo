"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import {
  usePurchaseOrders,
  useVendors,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
} from "@/lib/hooks/useInventory";
import type { PurchaseOrderStatus } from "@/lib/hooks/useInventory";
import { usePermission } from "@/lib/hooks/usePermission";
import { ClipboardList, Plus } from "lucide-react";

const STATUS_PILLS: { value: PurchaseOrderStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "PARTIALLY_RECEIVED", label: "Receiving" },
  { value: "RECEIVED", label: "Received" },
  { value: "CLOSED", label: "Closed" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  SENT: "bg-cyan-100 text-cyan-700",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
  RECEIVED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

interface PurchaseOrdersTabProps {
  onCreatePO: () => void;
  onViewDetail: (poId: string) => void;
  onReceive: (poId: string) => void;
}

export function PurchaseOrdersTab({ onCreatePO, onViewDetail, onReceive }: PurchaseOrdersTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: vendorsData } = useVendors();
  const vendors = vendorsData?.vendors ?? [];
  const { mutate: submitPO } = useSubmitPurchaseOrder();
  const { mutate: approvePO } = useApprovePurchaseOrder();
  const { mutate: cancelPO } = useCancelPurchaseOrder();

  const canCreate = usePermission("INVENTORY.PO.CREATE");
  const canSubmit = usePermission("INVENTORY.PO.SUBMIT");
  const canApprove = usePermission("INVENTORY.PO.APPROVE");
  const canReceive = usePermission("INVENTORY.PO.RECEIVE");

  const status = searchParams.get("poStatus") ?? "";
  const vendorId = searchParams.get("poVendor") ?? "";
  const dateFrom = searchParams.get("poFrom") ?? "";
  const dateTo = searchParams.get("poTo") ?? "";
  const search = searchParams.get("poSearch") ?? "";
  const page = Number(searchParams.get("poPage")) || 1;

  const filters = {
    status: (status as PurchaseOrderStatus) || undefined,
    vendorId: vendorId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: search || undefined,
    page,
    pageSize: 25,
  };

  const { data, isLoading } = usePurchaseOrders(filters);
  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 25);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      return `${pathname}?${params}`;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.replace(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  const handleSubmit = (poId: string) => submitPO(poId);
  const handleApprove = (poId: string) => approvePO(poId);
  const handleCancel = (poId: string) => {
    if (confirm("Cancel this purchase order?")) {
      cancelPO({ poId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => navigate({ poStatus: pill.value || null, poPage: null })}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                status === pill.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
        {canCreate && (
          <Button size="sm" onClick={onCreatePO}>
            <Plus className="h-4 w-4 mr-1.5" /> New Purchase Order
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select value={vendorId} onValueChange={(v) => navigate({ poVendor: v || null, poPage: null })}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="All vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Vendors</SelectItem>
            {vendors.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => navigate({ poFrom: e.target.value || null, poPage: null })}
          className="h-8 w-36 text-xs"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => navigate({ poTo: e.target.value || null, poPage: null })}
          className="h-8 w-36 text-xs"
        />
        <Input
          value={search}
          onChange={(e) => navigate({ poSearch: e.target.value || null, poPage: null })}
          placeholder="Search PO number..."
          className="h-8 w-48 text-xs"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <ClipboardList className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No purchase orders found</h3>
          {canCreate && (
            <Button size="sm" className="mt-4" onClick={onCreatePO}>
              <Plus className="h-4 w-4 mr-1.5" /> New Purchase Order
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">PO Number</TableHead>
                  <TableHead className="text-xs">Vendor</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Order Date</TableHead>
                  <TableHead className="text-xs">Expected</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs text-right">Items</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => onViewDetail(po.id)}
                  >
                    <TableCell>
                      <span className="text-xs font-mono font-medium text-primary">{po.poNumber}</span>
                    </TableCell>
                    <TableCell className="text-xs">{po.vendorName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0", STATUS_COLORS[po.status] ?? "")}
                      >
                        {po.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDate(po.orderDate)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {po.expectedDelivery ? formatDate(po.expectedDelivery) : "—"}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-right font-medium">
                      {formatCurrency(po.total)}
                    </TableCell>
                    <TableCell className="text-xs text-right">{po.items.length} items</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-0.5">
                        {po.status === "DRAFT" && canSubmit && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1" onClick={() => handleSubmit(po.id)}>
                            Submit
                          </Button>
                        )}
                        {po.status === "PENDING_APPROVAL" && canApprove && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1 text-blue-600" onClick={() => handleApprove(po.id)}>
                            Approve
                          </Button>
                        )}
                        {(po.status === "APPROVED" || po.status === "SENT") && canReceive && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1" onClick={() => onReceive(po.id)}>
                            Receive
                          </Button>
                        )}
                        {po.status === "PARTIALLY_RECEIVED" && canReceive && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1" onClick={() => onReceive(po.id)}>
                            Receive More
                          </Button>
                        )}
                        {(po.status === "DRAFT" || po.status === "PENDING_APPROVAL") && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1 text-red-500" onClick={() => handleCancel(po.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page <= 1} onClick={() => navigate({ poPage: String(page - 1) })}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= totalPages} onClick={() => navigate({ poPage: String(page + 1) })}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
