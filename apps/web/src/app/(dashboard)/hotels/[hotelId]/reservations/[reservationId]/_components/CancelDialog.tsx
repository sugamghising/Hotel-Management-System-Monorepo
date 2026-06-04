"use client";

import { useState } from "react";
import type { Reservation } from "@/lib/api/modules/reservations";
import { useCancelReservation } from "@/lib/hooks/useReservations";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store";
import { XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelDialogProps {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
}

export function CancelDialog({ reservation, open, onClose }: CancelDialogProps) {
  const [reason, setReason] = useState("");
  const cancel = useCancelReservation();
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  if (!reservation) return null;

  const isValid = reason.trim().length >= 10;

  const handleConfirm = () => {
    if (!isValid) return;
    cancel.mutate(
      { id: reservation.id, payload: { reason: reason.trim(), waiveFee: false } },
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
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <DialogTitle>Cancel Reservation</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Guest</p>
            <p className="font-medium">{reservation.guests.primaryGuestName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dates</p>
            <p className="font-medium">
              {formatDate(reservation.dates.checkIn)} &mdash; {formatDate(reservation.dates.checkOut)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-medium">
              {formatCurrency(reservation.financial.totalAmount, currencyCode)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter cancellation reason (min. 10 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {reason.length > 0 && reason.trim().length < 10 && (
              <p className="mt-1 text-xs text-red-500">
                Reason must be at least 10 characters
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            This action is irreversible. The reservation will be cancelled and cannot be restored.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Reservation
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || cancel.isPending}
          >
            Cancel Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
