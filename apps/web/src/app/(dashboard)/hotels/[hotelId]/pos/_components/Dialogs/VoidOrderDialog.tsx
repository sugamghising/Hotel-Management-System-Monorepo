"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useVoidPOSOrder, usePOSOrder } from "@/lib/hooks/usePOS";

interface VoidOrderDialogProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

export function VoidOrderDialog({ orderId, open, onClose }: VoidOrderDialogProps) {
  const { data: order } = usePOSOrder(orderId);
  const { mutate: voidOrder, isPending } = useVoidPOSOrder();

  const handleConfirm = () => {
    if (!orderId) return;
    voidOrder(orderId, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Void Order</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm">
            This will void <strong>#{order?.orderNumber}</strong> (total:{" "}
            <strong>${order?.total.toFixed(2)}</strong>).
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone.
          </p>
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
            {isPending ? "Voiding..." : "Void Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
