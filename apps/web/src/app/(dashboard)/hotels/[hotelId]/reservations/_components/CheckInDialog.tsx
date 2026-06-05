"use client";

import { useState } from "react";
import { useCheckIn } from "@/lib/hooks/useReservations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatters";
import { AlertTriangle } from "lucide-react";
import type { ReservationListItem } from "@/lib/api/modules/reservations";

interface CheckInDialogProps {
  reservation: ReservationListItem | null;
  open: boolean;
  onClose: () => void;
}

export function CheckInDialog({ reservation, open, onClose }: CheckInDialogProps) {
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const checkIn = useCheckIn();

  if (!reservation) return null;

  const handleConfirm = () => {
    checkIn.mutate(
      { id: reservation.id, payload: { earlyCheckIn } },
      {
        onSuccess: () => {
          setEarlyCheckIn(false);
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
          setEarlyCheckIn(false);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check In Guest</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="font-medium">{reservation.guestName}</p>
            <p className="text-sm text-muted-foreground">
              {reservation.confirmationNumber}
            </p>
          </div>
          <p className="text-sm">
            Check-in date:{" "}
            <strong>{formatDate(reservation.checkInDate)}</strong>
          </p>
          {!reservation.roomNumber && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>No room assigned. A room will be auto-assigned.</span>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={earlyCheckIn}
              onChange={(e) => setEarlyCheckIn(e.target.checked)}
            />
            <span className="text-sm">Early check-in</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={checkIn.isPending}>
            {checkIn.isPending ? "Checking in..." : "Confirm Check-In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
