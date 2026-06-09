"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OrderHeader } from "./OrderHeader";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderTotals } from "./OrderTotals";
import { AddItemSection } from "./AddItemSection";
import { OrderActions } from "./OrderActions";
import { Receipt, Plus } from "lucide-react";
import { usePOSOrder } from "@/lib/hooks/usePOS";

interface OrderDetailPanelProps {
  orderId: string | null;
  currencyCode: string;
  canEdit: boolean;
  canVoid: boolean;
  canProcessPayment: boolean;
  canPostToRoom: boolean;
  canPrint: boolean;
  onNewOrder: () => void;
  onVoidOrder: (id: string) => void;
  onPayOrder: (id: string) => void;
  onPostToRoom: (id: string) => void;
  onAddCustomItem: (orderId: string) => void;
}

export function OrderDetailPanel({
  orderId,
  currencyCode,
  canEdit,
  canVoid,
  canProcessPayment,
  canPostToRoom,
  canPrint,
  onNewOrder,
  onVoidOrder,
  onPayOrder,
  onPostToRoom,
  onAddCustomItem,
}: OrderDetailPanelProps) {
  const { data: order, isLoading, isError, refetch } = usePOSOrder(orderId);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Receipt className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-1">
          Select an order
        </h3>
        <p className="text-sm text-muted-foreground/60 mb-4 max-w-xs">
          Select an order from the list to view details, or create a new order to get started.
        </p>
        <Button size="sm" onClick={onNewOrder}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Order
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Failed to load order details.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <OrderHeader
        order={order}
        onVoid={() => onVoidOrder(order.id)}
        onPostToRoom={() => onPostToRoom(order.id)}
        canVoid={canVoid}
        canPostToRoom={canPostToRoom}
      />

      <div className="flex-1 overflow-y-auto">
        <OrderItemsTable
          items={order.items}
          status={order.status}
          orderId={order.id}
          canEdit={canEdit}
        />

        <AddItemSection
          orderId={order.id}
          orderStatus={order.status}
          canEdit={canEdit}
          currencyCode={currencyCode}
          onAddCustomItem={() => onAddCustomItem(order.id)}
        />
      </div>

      <div className="sticky bottom-0 bg-background">
        <OrderTotals order={order} currencyCode={currencyCode} />
        <OrderActions
          order={order}
          canProcessPayment={canProcessPayment}
          canPostToRoom={canPostToRoom}
          canPrint={canPrint}
          onPay={() => onPayOrder(order.id)}
          onPostToRoom={() => onPostToRoom(order.id)}
        />
      </div>
    </div>
  );
}
