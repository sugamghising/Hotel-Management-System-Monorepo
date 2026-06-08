"use client";

import { OutletTabs } from "./OutletTabs";
import { OrderCard } from "./OrderCard";
import { NewOrderButton } from "./NewOrderButton";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { POSOrderListItem } from "@/lib/hooks/usePOS";

interface OrderListPanelProps {
  orders: POSOrderListItem[] | undefined;
  isLoading: boolean;
  activeOutlet: string;
  activeStatus: string;
  activeDate: string;
  selectedOrderId: string | null;
  currencyCode: string;
  onOutletChange: (outlet: string) => void;
  onStatusChange: (status: string) => void;
  onDateChange: (date: string) => void;
  onSelectOrder: (id: string) => void;
  onNewOrder: () => void;
}

const STATUS_CHIPS = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "ALL", label: "All" },
];

export function OrderListPanel({
  orders,
  isLoading,
  activeOutlet,
  activeStatus,
  activeDate,
  selectedOrderId,
  currencyCode,
  onOutletChange,
  onStatusChange,
  onDateChange,
  onSelectOrder,
  onNewOrder,
}: OrderListPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <OutletTabs activeOutlet={activeOutlet} onOutletChange={onOutletChange} />

      <div className="flex items-center gap-2 px-4 py-2 border-b">
        <div className="flex gap-1">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => onStatusChange(chip.value)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors",
                activeStatus === chip.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Input
            type="date"
            value={activeDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-7 w-[130px] text-[11px]"
          />
          <button
            onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
            className="text-[11px] text-primary hover:underline whitespace-nowrap"
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Coffee className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              {activeStatus === "OPEN" ? "No open orders" : "No orders found"}
            </p>
            <NewOrderButton onClick={onNewOrder} variant="ghost" label="+ New Order" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                currencyCode={currencyCode}
                onClick={() => onSelectOrder(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
