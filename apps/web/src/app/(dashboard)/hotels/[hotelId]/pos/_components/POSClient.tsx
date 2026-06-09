"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { usePOSOrders, useVoidPOSOrder } from "@/lib/hooks/usePOS";
import { Separator } from "@/components/ui/separator";
import { OrderListPanel } from "./OrderList/OrderListPanel";
import { OrderDetailPanel } from "./OrderDetail/OrderDetailPanel";
import { NewOrderDialog } from "./Dialogs/NewOrderDialog";
import { PaymentDialog } from "./Dialogs/PaymentDialog";
import { PostToRoomDialog } from "./Dialogs/PostToRoomDialog";
import { VoidOrderDialog } from "./Dialogs/VoidOrderDialog";
import { VoidItemDialog } from "./Dialogs/VoidItemDialog";
import { AddMenuItemDialog } from "./Dialogs/AddMenuItemDialog";
import { NewOrderButton } from "./OrderList/NewOrderButton";
import { format } from "date-fns";
import type { POSOrderItem } from "@/lib/hooks/usePOS";

export default function POSClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();
  const currencyCode = activeHotel?.currencyCode ?? "USD";

  const selectedOrderId = searchParams.get("order");
  const activeOutlet = searchParams.get("outlet") ?? "";
  const activeStatus = searchParams.get("status") ?? "OPEN";
  const activeDate = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  const [liveClock, setLiveClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setLiveClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const canCreateOrder = usePermission("POS.CREATE_ORDER");
  const canEditOrder = usePermission("POS.MODIFY_ORDER");
  const canVoidOrder = usePermission("POS.VOID_ORDER");
  const canProcessPayment = usePermission("POS.CLOSE_ORDER");
  const canPostToRoom = usePermission("POS.POST_ROOM_CHARGE");
  const canPrint = usePermission("POS.VIEW_REPORTS");

  const { data: ordersData, isLoading } = usePOSOrders({
    status: activeStatus === "ALL" ? undefined : (activeStatus as any),
    outlet: activeOutlet || undefined,
    date: activeDate,
    page: 1,
    limit: 50,
  });
  const orders = ordersData?.orders;

  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [postToRoomOpen, setPostToRoomOpen] = useState(false);
  const [postToRoomOrderId, setPostToRoomOrderId] = useState<string | null>(null);
  const [voidOrderOpen, setVoidOrderOpen] = useState(false);
  const [voidOrderId, setVoidOrderId] = useState<string | null>(null);
  const [voidItemOpen, setVoidItemOpen] = useState(false);
  const [voidItem, setVoidItem] = useState<POSOrderItem | null>(null);
  const [voidItemOrderId, setVoidItemOrderId] = useState<string | null>(null);
  const [customItemOpen, setCustomItemOpen] = useState(false);
  const [customItemOrderId, setCustomItemOrderId] = useState<string | null>(null);

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

  const handleOutletChange = useCallback(
    (outlet: string) => {
      navigate({ outlet: outlet || null, order: null });
    },
    [navigate],
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      navigate({ status, order: null });
    },
    [navigate],
  );

  const handleDateChange = useCallback(
    (date: string) => {
      navigate({ date, order: null });
    },
    [navigate],
  );

  const handleSelectOrder = useCallback(
    (id: string) => {
      navigate({ order: id });
    },
    [navigate],
  );

  const handleCloseOrder = useCallback(() => {
    navigate({ order: null });
  }, [navigate]);

  const handleNewOrderCreated = useCallback(
    (orderId: string) => {
      navigate({ order: orderId });
    },
    [navigate],
  );

  const handlePayOrder = useCallback((id: string) => {
    setPaymentOrderId(id);
    setPaymentOpen(true);
  }, []);

  const handlePostToRoom = useCallback((id: string) => {
    setPostToRoomOrderId(id);
    setPostToRoomOpen(true);
  }, []);

  const { mutate: voidOrder } = useVoidPOSOrder();

  const handleVoidOrder = useCallback((id: string) => {
    setVoidOrderId(id);
    setVoidOrderOpen(true);
  }, []);

  const handleAddCustomItem = useCallback((orderId: string) => {
    setCustomItemOrderId(orderId);
    setCustomItemOpen(true);
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="h-12 sticky top-0 bg-background border-b flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">POS</span>
          <span className="text-xs text-muted-foreground">{activeHotel?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(liveClock, "EEE d MMM · HH:mm")}
          </span>
          <Separator orientation="vertical" className="h-4" />
          {canCreateOrder && (
            <NewOrderButton onClick={() => setNewOrderOpen(true)} />
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[380px] border-r bg-gray-50/50 flex-shrink-0 hidden lg:flex flex-col">
          <OrderListPanel
            orders={orders}
            isLoading={isLoading}
            activeOutlet={activeOutlet}
            activeStatus={activeStatus}
            activeDate={activeDate}
            selectedOrderId={selectedOrderId}
            currencyCode={currencyCode}
            onOutletChange={handleOutletChange}
            onStatusChange={handleStatusChange}
            onDateChange={handleDateChange}
            onSelectOrder={handleSelectOrder}
            onNewOrder={() => setNewOrderOpen(true)}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <OrderDetailPanel
            orderId={selectedOrderId}
            currencyCode={currencyCode}
            canEdit={canEditOrder}
            canVoid={canVoidOrder}
            canProcessPayment={canProcessPayment}
            canPostToRoom={canPostToRoom}
            canPrint={canPrint}
            onNewOrder={() => setNewOrderOpen(true)}
            onVoidOrder={handleVoidOrder}
            onPayOrder={handlePayOrder}
            onPostToRoom={handlePostToRoom}
            onAddCustomItem={handleAddCustomItem}
          />
        </div>
      </div>

      <NewOrderDialog
        open={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        defaultOutlet={activeOutlet || undefined}
        onOrderCreated={handleNewOrderCreated}
      />

      <PaymentDialog
        orderId={paymentOrderId}
        open={paymentOpen}
        onClose={() => { setPaymentOpen(false); setPaymentOrderId(null); }}
        currencyCode={currencyCode}
      />

      <PostToRoomDialog
        orderId={postToRoomOrderId}
        open={postToRoomOpen}
        onClose={() => { setPostToRoomOpen(false); setPostToRoomOrderId(null); }}
        currencyCode={currencyCode}
      />

      <VoidOrderDialog
        orderId={voidOrderId}
        open={voidOrderOpen}
        onClose={() => { setVoidOrderOpen(false); setVoidOrderId(null); }}
        onVoidSuccess={() => handleCloseOrder()}
        currencyCode={currencyCode}
      />

      {voidItemOpen && voidItem && (
        <VoidItemDialog
          orderId={voidItemOrderId ?? ""}
          item={voidItem}
          open={voidItemOpen}
          onClose={() => { setVoidItemOpen(false); setVoidItemOrderId(null); setVoidItem(null); }}
        />
      )}

      <AddMenuItemDialog
        orderId={customItemOrderId ?? ""}
        open={customItemOpen}
        onClose={() => { setCustomItemOpen(false); setCustomItemOrderId(null); }}
      />
    </div>
  );
}
