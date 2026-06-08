"use client";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Printer, CreditCard, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import type { POSOrder } from "@/lib/hooks/usePOS";

interface OrderActionsProps {
  order: POSOrder;
  canProcessPayment: boolean;
  canPostToRoom: boolean;
  canPrint: boolean;
  onPay: () => void;
  onPostToRoom: () => void;
}

export function OrderActions({
  order,
  canProcessPayment,
  canPostToRoom,
  canPrint,
  onPay,
  onPostToRoom,
}: OrderActionsProps) {
  if (order.status !== "OPEN") return null;

  const hasItems = order.items.some((i) => !i.isVoided);

  return (
    <div className="px-4 py-3 border-t bg-background flex items-center gap-2">
      {canProcessPayment && (
        <Tooltip content={!hasItems ? "Add items first" : ""}>
          <Button
            size="sm"
            disabled={!hasItems}
            onClick={onPay}
          >
            <CreditCard className="h-4 w-4 mr-1.5" />
            Pay Now
          </Button>
        </Tooltip>
      )}

      {canPostToRoom && (
        <Tooltip content={!hasItems ? "Add items first" : ""}>
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasItems}
            onClick={onPostToRoom}
          >
            <DoorOpen className="h-4 w-4 mr-1.5" />
            Post to Room
          </Button>
        </Tooltip>
      )}

      {canPrint && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => toast.info("Printing...")}
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print Receipt
        </Button>
      )}
    </div>
  );
}
