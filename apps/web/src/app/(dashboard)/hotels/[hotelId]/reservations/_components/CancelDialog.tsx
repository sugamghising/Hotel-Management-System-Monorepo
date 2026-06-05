"use client";

import { useState } from "react";
import { useCancelReservation } from "@/lib/hooks/useReservations";
import { useAuthStore } from "@/stores/auth.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { XCircle } from "lucide-react";
import type { ReservationListItem } from "@/lib/api/modules/reservations";

interface CancelDialogProps {
  reservation: ReservationListItem | null;
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
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Cancel Reservation</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm space-y-1">
            <p>
              <strong>{reservation.guestName}</strong>
            </p>
            <p className="text-muted-foreground">
              {formatDate(reservation.checkInDate)} —{" "}
              {formatDate(reservation.checkOutDate)}
            </p>
            <p className="text-muted-foreground">
              Total: {formatCurrency(reservation.totalAmount, currencyCode)}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Reason for cancellation
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Guest request, duplicate booking, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-xs text-red-500">
                Please enter at least 10 characters
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            This action cannot be undone. The reservation will be cancelled and
            the guest will be notified.
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
            {cancel.isPending ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
