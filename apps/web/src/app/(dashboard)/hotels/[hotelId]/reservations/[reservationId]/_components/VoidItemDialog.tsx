"use client";

import { useState } from "react";
import { useVoidFolioItem } from "@/lib/hooks/useFolio";
import type { FolioItem } from "@/lib/hooks/useFolio";
import { formatCurrency } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VoidItemDialogProps {
  reservationId: string;
  item: FolioItem | null;
  open: boolean;
  onClose: () => void;
}

export function VoidItemDialog({
  reservationId,
  item,
  open,
  onClose,
}: VoidItemDialogProps) {
  const [reason, setReason] = useState("");
  const voidItem = useVoidFolioItem(reservationId);
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  if (!item) return null;

  const isValid = reason.trim().length >= 5;

  const handleConfirm = () => {
    if (!isValid) return;
    voidItem.mutate(
      { itemId: item.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Void Charge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Item</p>
            <p className="font-medium">{item.description}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium">
              {formatCurrency(item.amount, currencyCode)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter reason (min. 5 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {reason.length > 0 && reason.trim().length < 5 && (
              <p className="mt-1 text-xs text-red-500">
                Reason must be at least 5 characters
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || voidItem.isPending}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
