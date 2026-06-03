"use client";

import { useState } from "react";
import { useCheckOut } from "@/lib/hooks/useReservations";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuthStore } from "@/stores/auth.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/formatters";
import { AlertTriangle } from "lucide-react";
import type { ReservationListItem } from "@/lib/api/modules/reservations";

interface CheckOutDialogProps {
  reservation: ReservationListItem | null;
  open: boolean;
  onClose: () => void;
}

export function CheckOutDialog({ reservation, open, onClose }: CheckOutDialogProps) {
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [overrideBalance, setOverrideBalance] = useState(false);
  const checkOut = useCheckOut();
  const canOverrideBalance = usePermission("RESERVATION.OVERRIDE_BALANCE");
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  if (!reservation) return null;

  const hasBalance = reservation.balance > 0;
  const canConfirm = !hasBalance || (canOverrideBalance && overrideBalance);

  const handleConfirm = () => {
    checkOut.mutate(
      { id: reservation.id, payload: { lateCheckOut } },
      {
        onSuccess: () => {
          setLateCheckOut(false);
          setOverrideBalance(false);
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
          setLateCheckOut(false);
          setOverrideBalance(false);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check Out Guest</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="font-medium">{reservation.guestName}</p>
            <p className="text-sm text-muted-foreground">
              Room {reservation.roomNumber ?? "Not assigned"}
            </p>
          </div>
          {hasBalance && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Outstanding balance:{" "}
                {formatCurrency(reservation.balance, currencyCode)}. Ensure
                payment before checkout.
              </span>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={lateCheckOut}
              onChange={(e) => setLateCheckOut(e.target.checked)}
            />
            <span className="text-sm">Late check-out</span>
          </label>
          {canOverrideBalance && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={overrideBalance}
                onChange={(e) => setOverrideBalance(e.target.checked)}
              />
              <span className="text-sm">Override balance check</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={checkOut.isPending || !canConfirm}
          >
            {checkOut.isPending ? "Checking out..." : "Confirm Check-Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
