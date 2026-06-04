"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRemoveRoomOoo } from "@/lib/hooks/useRooms";

interface RemoveOooDialogProps {
  room: {
    id: string;
    roomNumber: string;
    oooDetails?: { reason?: string; from?: string; until?: string };
  } | null;
  open: boolean;
  onClose: () => void;
}

export function RemoveOooDialog({
  room,
  open,
  onClose,
}: RemoveOooDialogProps) {
  const { mutate, isPending } = useRemoveRoomOoo();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (room && open) {
      setNotes("");
    }
  }, [room, open]);

  if (!room) return null;

  const handleConfirm = () => {
    mutate(
      { id: room.id, reason: notes.trim() || undefined },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Room {room.roomNumber} to Service</DialogTitle>
          <DialogDescription>
            End the out-of-order period and make the room available for guests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {room.oooDetails && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  {room.oooDetails.reason && (
                    <p>
                      <span className="font-medium">Reason:</span>{" "}
                      {room.oooDetails.reason}
                    </p>
                  )}
                  {room.oooDetails.from && (
                    <p>
                      <span className="font-medium">From:</span>{" "}
                      {room.oooDetails.from}
                    </p>
                  )}
                  {room.oooDetails.until && (
                    <p>
                      <span className="font-medium">Until:</span>{" "}
                      {room.oooDetails.until}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              Room will be set to Vacant Dirty for inspection.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Reason for returning to service (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about returning to service..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Returning..." : "Return to Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
