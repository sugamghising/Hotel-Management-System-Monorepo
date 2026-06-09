"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/formatters";
import { useVoidPOSItem } from "@/lib/hooks/usePOS";
import type { POSOrderItem } from "@/lib/hooks/usePOS";

interface VoidItemDialogProps {
  orderId: string;
  item: POSOrderItem;
  open: boolean;
  onClose: () => void;
}

export function VoidItemDialog({ orderId, item, open, onClose }: VoidItemDialogProps) {
  const { mutate: voidItem, isPending } = useVoidPOSItem();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    voidItem(
      { orderId, itemId: item.id, reason: reason || undefined },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove Item</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg">
            <div>
              <p className="text-sm font-medium">{item.itemName}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <span className="font-semibold">{formatCurrency(item.totalPrice)}</span>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Reason (optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 h-16 text-sm resize-none"
              placeholder="e.g. Customer changed mind, wrong item"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Removing..." : "Remove Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
