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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { useUpdateRoomStatus } from "@/lib/hooks/useRooms";

interface UpdateStatusDialogProps {
  room: { id: string; roomNumber: string; status: string } | null;
  open: boolean;
  onClose: () => void;
}

const TRANSITIONS: Record<string, string[]> = {
  VACANT_CLEAN: ["VACANT_DIRTY", "BLOCKED", "OUT_OF_ORDER"],
  VACANT_DIRTY: ["VACANT_CLEANING", "VACANT_CLEAN", "BLOCKED", "OUT_OF_ORDER"],
  VACANT_CLEANING: ["VACANT_CLEAN", "VACANT_DIRTY"],
  OCCUPIED_CLEAN: ["OCCUPIED_DIRTY", "OCCUPIED_CLEANING"],
  OCCUPIED_DIRTY: ["OCCUPIED_CLEANING", "OCCUPIED_CLEAN"],
  OCCUPIED_CLEANING: ["OCCUPIED_CLEAN", "OCCUPIED_DIRTY"],
  RESERVED: ["VACANT_CLEAN", "BLOCKED"],
  BLOCKED: ["VACANT_CLEAN", "VACANT_DIRTY"],
  OUT_OF_ORDER: ["VACANT_DIRTY"],
};

const PRIORITY_OPTIONS = [
  { value: "0", label: "Normal" },
  { value: "1", label: "High" },
  { value: "2", label: "Urgent" },
];

function isDirtyOrCleaning(status: string) {
  return status.includes("DIRTY") || status.includes("CLEANING");
}

export function UpdateStatusDialog({
  room,
  open,
  onClose,
}: UpdateStatusDialogProps) {
  const { mutate, isPending } = useUpdateRoomStatus();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("0");

  useEffect(() => {
    if (room && open) {
      setSelectedStatus("");
      setReason("");
      setPriority("0");
    }
  }, [room, open]);

  if (!room) return null;

  const currentLabel =
    ROOM_STATUS_MAP[room.status as keyof typeof ROOM_STATUS_MAP]?.label ??
    room.status;
  const currentLight =
    ROOM_STATUS_MAP[room.status as keyof typeof ROOM_STATUS_MAP]?.light ?? "";
  const transitions = TRANSITIONS[room.status] ?? [];

  const showPriority = selectedStatus && isDirtyOrCleaning(selectedStatus);

  const handleConfirm = () => {
    if (!selectedStatus) return;
    mutate(
      {
        roomId: room.id,
        status: selectedStatus,
        reason: reason.trim() || undefined,
        priority: Number(priority) || undefined,
      },
      {
        onSuccess: () => {
          const label =
            ROOM_STATUS_MAP[
              selectedStatus as keyof typeof ROOM_STATUS_MAP
            ]?.label ?? selectedStatus;
          toast.success(`Room ${room.roomNumber} updated to ${label}`);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Room {room.roomNumber}</DialogTitle>
          <DialogDescription>
            Change the status of this room to one of the available transitions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                currentLight,
              )}
            >
              {currentLabel}
            </span>
          </div>

          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {transitions.map((s) => {
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

          {showPriority && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional reason for status change..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || isPending}
          >
            {isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
