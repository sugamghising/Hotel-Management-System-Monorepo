"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { usePurchaseOrder } from "@/lib/hooks/useInventory";
import type { PurchaseOrderStatus } from "@/lib/hooks/useInventory";
import { Check, Circle } from "lucide-react";

interface PODetailSheetProps {
  poId: string | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (poId: string) => void;
  onApprove: (poId: string) => void;
  onReceive: (poId: string) => void;
  onCancel: (poId: string) => void;
  canSubmit: boolean;
  canApprove: boolean;
  canReceive: boolean;
}

const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  SENT: "bg-cyan-100 text-cyan-700 border-cyan-200",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700 border-orange-200",
  RECEIVED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  SENT: "Sent",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
};

const TIMELINE_STEPS: PurchaseOrderStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "SENT",
  "RECEIVED",
];

export function PODetailSheet({
  poId,
  open,
  onClose,
  onSubmit,
  onApprove,
  onReceive,
  onCancel,
  canSubmit,
  canApprove,
  canReceive,
}: PODetailSheetProps) {
  const { data: order, isLoading } = usePurchaseOrder(poId);

  const currentIdx = order ? TIMELINE_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === "CANCELLED" || order?.status === "CLOSED";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[600px] max-w-full overflow-y-auto">
        <SheetHeader>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : order ? (
            <>
              <SheetTitle className="text-left font-mono text-base">{order.poNumber}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{order.vendorName}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs px-1.5 py-0", STATUS_COLORS[order.status])}
                >
                  {STATUS_LABELS[order.status]}
                </Badge>
              </div>
            </>
          ) : null}
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !order ? (
          <p className="text-sm text-muted-foreground mt-6">Purchase order not found.</p>
        ) : (
          <div className="space-y-6 mt-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expected Delivery</p>
                <p className="font-medium">{order.expectedDelivery ? formatDate(order.expectedDelivery) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Requested By</p>
                <p className="font-medium">{order.requestedByName}</p>
              </div>
              {order.approvedBy && (
                <div>
                  <p className="text-muted-foreground">Approved By</p>
                  <p className="font-medium">{order.approvedBy}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Timeline</p>
              <div className="flex items-center">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isComplete = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            isComplete && !isCurrent && "bg-primary",
                            isCurrent && "ring-2 ring-primary bg-white",
                            !isComplete && !isCurrent && "bg-muted",
                          )}
                        >
                          {isComplete && !isCurrent ? (
                            <Check className="h-3.5 w-3.5 text-white" />
                          ) : isCurrent ? (
                            <Circle className="h-3 w-3 fill-primary text-primary" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] mt-1 text-center",
                            isComplete ? "text-primary font-medium" : "text-muted-foreground",
                          )}
                        >
                          {STATUS_LABELS[step].split(" ")[0]}
                        </span>
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "flex-1 h-0.5 mx-1",
                            idx < currentIdx ? "bg-primary" : "bg-muted",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Items</p>
              <div className="rounded-lg border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-1.5 px-2 font-medium">Item</th>
                      <th className="text-left py-1.5 px-2 font-medium">SKU</th>
                      <th className="text-right py-1.5 px-2 font-medium">Ordered</th>
                      <th className="text-right py-1.5 px-2 font-medium">Received</th>
                      <th className="text-right py-1.5 px-2 font-medium">Unit Price</th>
                      <th className="text-right py-1.5 px-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/30 last:border-0">
                        <td className="py-1.5 px-2 font-medium">{item.itemName}</td>
                        <td className="py-1.5 px-2 text-muted-foreground font-mono">{item.itemSku}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums">{item.quantity}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums">
                          <span
                            className={cn(
                              item.receivedQty === 0 && "text-muted-foreground",
                              item.receivedQty > 0 && item.receivedQty < item.quantity && "text-yellow-600",
                              item.receivedQty >= item.quantity && "text-green-600",
                            )}
                          >
                            {item.receivedQty}/{item.quantity}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1 text-xs border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Notes</p>
                <p className="text-xs bg-muted rounded-md p-2">{order.notes}</p>
              </div>
            )}

            {!isCancelled && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {order.status === "DRAFT" && canSubmit && (
                  <Button size="sm" onClick={() => onSubmit(order.id)}>Submit for Approval</Button>
                )}
                {order.status === "PENDING_APPROVAL" && canApprove && (
                  <Button size="sm" onClick={() => onApprove(order.id)}>Approve</Button>
                )}
                {(order.status === "APPROVED" || order.status === "SENT") && canReceive && (
                  <Button size="sm" onClick={() => onReceive(order.id)}>Receive Goods</Button>
                )}
                {order.status === "PARTIALLY_RECEIVED" && canReceive && (
                  <Button size="sm" onClick={() => onReceive(order.id)}>Receive More Goods</Button>
                )}
                {(order.status === "DRAFT" || order.status === "PENDING_APPROVAL") && (
                  <Button size="sm" variant="outline" onClick={() => onCancel(order.id)}>Cancel PO</Button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
