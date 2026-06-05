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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useScheduleMaintenance } from "@/lib/hooks/useMaintenanceRequests";

interface ScheduleDialogProps {
  requestId: string;
  currentDate: string | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleDialog({
  requestId,
  currentDate,
  open,
  onClose,
}: ScheduleDialogProps) {
  const { mutate, isPending } = useScheduleMaintenance();
  const [scheduledFor, setScheduledFor] = useState("");
  const [note, setNote] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      setScheduledFor(currentDate?.split("T")[0] ?? tomorrowStr);
      setNote("");
    }
  }, [open, currentDate, tomorrowStr]);

  const handleSchedule = () => {
    if (!scheduledFor) return;
    mutate(
      { id: requestId, scheduledFor },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Request</DialogTitle>
          <DialogDescription>
            Set a scheduled date for this maintenance work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scheduled Date *</Label>
            <Input
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about the schedule..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={!scheduledFor || isPending}>
            {isPending ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
