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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBulkRoomStatus } from "@/lib/hooks/useRooms";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";

interface BulkStatusDialogProps {
  selectedRooms: Array<{ id: string; roomNumber: string; status?: string }>;
  open: boolean;
  onClose: () => void;
}

const BULK_OPTIONS = ["VACANT_CLEAN", "VACANT_DIRTY", "BLOCKED"] as const;

export function BulkStatusDialog({
  selectedRooms,
  open,
  onClose,
}: BulkStatusDialogProps) {
  const { mutate, isPending } = useBulkRoomStatus();
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setStatus("");
      setReason("");
    }
  }, [open]);

  const roomIds = selectedRooms.map((r) => r.id);
  const occupiedCount = selectedRooms.filter(
    (r) => r.status?.startsWith("OCCUPIED"),
  ).length;

  const displayList = selectedRooms
    .slice(0, 5)
    .map((r) => r.roomNumber)
    .join(", ");
  const extraCount = selectedRooms.length - 5;

  const handleConfirm = () => {
    if (!status) return;
    mutate(
      {
        roomIds,
        status,
        reason: reason.trim() || undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Room Status</DialogTitle>
          <DialogDescription>
            Update the status of multiple rooms at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedRooms.length} room
              {selectedRooms.length !== 1 ? "s" : ""} selected: {displayList}
              {extraCount > 0 && <span> and {extraCount} more</span>}
            </p>
          </div>

          {occupiedCount > 0 && (
            <Alert>
              <AlertDescription>
                Warning: {occupiedCount} selected room
                {occupiedCount !== 1 ? "s are" : " is"} occupied.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {BULK_OPTIONS.map((s) => {
                  const info =
                    ROOM_STATUS_MAP[s as keyof typeof ROOM_STATUS_MAP];
                  return (
                    <SelectItem key={s} value={s}>
                      {info?.label ?? s}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional reason for bulk update..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!status || isPending}>
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
