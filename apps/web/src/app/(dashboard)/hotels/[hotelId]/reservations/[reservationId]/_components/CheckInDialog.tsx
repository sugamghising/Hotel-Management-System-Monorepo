"use client";

import { useState } from "react";
import type { Reservation } from "@/lib/api/modules/reservations";
import { useCheckIn } from "@/lib/hooks/useReservations";
import { formatDate } from "@/lib/utils/formatters";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CheckInDialogProps {
  reservation: Reservation | null;
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
          <DialogTitle>Check In</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Guest</p>
            <p className="font-medium">{reservation.guests.primaryGuestName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confirmation</p>
            <p className="font-medium">{reservation.confirmationNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check-in Date</p>
            <p className="font-medium">{formatDate(reservation.dates.checkIn)}</p>
          </div>
          {!reservation.rooms[0]?.roomNumber && (
            <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">No room assigned</span>
            </div>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
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
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
