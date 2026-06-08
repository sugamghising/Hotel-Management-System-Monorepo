"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/formatters";
import { formatCurrency } from "@/lib/utils/formatters";
import { Coffee, Table2, DoorOpen, Receipt } from "lucide-react";
import type { POSOrderListItem, POSOrderStatus } from "@/lib/hooks/usePOS";

const STATUS_CONFIG: Record<POSOrderStatus, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-blue-50 text-blue-700 border-blue-200" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200" },
  PAID: { label: "Paid", color: "bg-green-50 text-green-700 border-green-200" },
  VOID: { label: "Void", color: "bg-red-50 text-red-700 border-red-200" },
  COMPED: { label: "Comp", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

interface OrderCardProps {
  order: POSOrderListItem;
  isSelected: boolean;
  currencyCode: string;
  onClick: () => void;
}

export function OrderCard({ order, isSelected, currencyCode, onClick }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.OPEN;
  const isDimmed = order.status === "VOID" || order.status === "CLOSED";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all",
        isSelected
          ? "ring-2 ring-blue-400 bg-blue-50 border-blue-200"
          : "hover:bg-blue-50/50 border-border",
        order.status === "OPEN" && !isSelected && "shadow-sm bg-card",
        isDimmed && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-bold text-sm">#{order.orderNumber}</span>
        <Badge variant="outline" className={cn("text-[10px] font-medium px-1.5 py-0", config.color)}>
          {config.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {order.tableNumber && (
          <span className="inline-flex items-center gap-0.5 text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            <Table2 className="h-3 w-3" />
            {order.tableNumber}
          </span>
        )}
        {order.roomNumber && (
          <span className="inline-flex items-center gap-0.5 text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            <DoorOpen className="h-3 w-3" />
            {order.roomNumber}
          </span>
        )}
        {order.postedToRoom && (
          <span className="inline-flex items-center gap-0.5 text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
            <Receipt className="h-3 w-3" />
            Posted
          </span>
        )}
        {!order.tableNumber && !order.roomNumber && (
          <span className="text-[11px] text-muted-foreground italic">—</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{order.itemCount} items</span>
          <span>{formatTime(order.createdAt)}</span>
        </div>
        <span className="font-semibold text-sm">
          {formatCurrency(order.total, currencyCode)}
        </span>
      </div>
    </button>
  );
}
