"use client";

import { useState } from "react";
import type { Reservation } from "@/lib/api/modules/reservations";
import { useCheckOut } from "@/lib/hooks/useReservations";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/lib/utils/formatters";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CheckOutDialogProps {
  reservation: Reservation | null;
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

  const hasBalance = reservation.financial.balance > 0;
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
          <DialogTitle>Check Out</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Guest</p>
            <p className="font-medium">{reservation.guests.primaryGuestName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Room</p>
            <p className="font-medium">
              {reservation.rooms[0]?.roomNumber ?? "Not assigned"}
            </p>
          </div>
          {hasBalance && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Outstanding balance: {formatCurrency(reservation.financial.balance, currencyCode)}
              </span>
            </div>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lateCheckOut}
              onChange={(e) => setLateCheckOut(e.target.checked)}
            />
            <span className="text-sm">Late check-out</span>
          </label>
          {canOverrideBalance && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={overrideBalance}
                onChange={(e) => setOverrideBalance(e.target.checked)}
              />
              <span className="text-sm">Override balance</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={checkOut.isPending || !canConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
