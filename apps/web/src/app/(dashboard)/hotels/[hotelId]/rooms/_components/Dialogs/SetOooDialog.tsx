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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSetRoomOoo } from "@/lib/hooks/useRooms";

interface SetOooDialogProps {
  room: { id: string; roomNumber: string } | null;
  open: boolean;
  onClose: () => void;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function todayString() {
  return toDateInputValue(new Date());
}

export function SetOooDialog({ room, open, onClose }: SetOooDialogProps) {
  const { mutate, isPending } = useSetRoomOoo();
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState(todayString());
  const [untilDate, setUntilDate] = useState("");
  const [maintenanceRequired, setMaintenanceRequired] = useState(false);
  const [touched, setTouched] = useState({
    reason: false,
    untilDate: false,
  });

  useEffect(() => {
    if (room && open) {
      setReason("");
      setFromDate(todayString());
      setUntilDate("");
      setMaintenanceRequired(false);
      setTouched({ reason: false, untilDate: false });
    }
  }, [room, open]);

  if (!room) return null;

  const reasonError =
    touched.reason && reason.trim().length < 10
      ? "Reason must be at least 10 characters"
      : null;

  const untilError =
    touched.untilDate && (!untilDate || new Date(untilDate) <= new Date(fromDate))
      ? "Until date must be after the from date"
      : null;

  const isValid =
    reason.trim().length >= 10 &&
    untilDate &&
    new Date(untilDate) > new Date(fromDate);

  const handleConfirm = () => {
    setTouched({ reason: true, untilDate: true });
    if (!isValid) return;

    mutate(
      {
        id: room.id,
        input: {
          reason: reason.trim(),
          from: fromDate,
          until: untilDate,
          maintenanceRequired,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Room {room.roomNumber} Out of Order</DialogTitle>
          <DialogDescription>
            Mark this room as out of order and specify the reason and time
            frame.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, reason: true }))}
              placeholder="Why is this room out of order?"
              rows={3}
            />
            {reasonError && (
              <p className="text-xs text-red-500">{reasonError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>From</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Until</Label>
            <Input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, untilDate: true }))}
            />
            {untilError && (
              <p className="text-xs text-red-500">{untilError}</p>
            )}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="maintenance"
              checked={maintenanceRequired}
              onCheckedChange={(v: boolean | "indeterminate") => setMaintenanceRequired(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="maintenance" className="font-normal">
                Requires maintenance
              </Label>
              <p className="text-xs text-muted-foreground">
                A maintenance request will be created.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Setting..." : "Set Out of Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
