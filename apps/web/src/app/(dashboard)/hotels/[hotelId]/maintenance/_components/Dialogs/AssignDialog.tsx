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
import { Label } from "@/components/ui/label";
import { useAssignMaintenance } from "@/lib/hooks/useMaintenanceRequests";
import type { StaffWorkloadItem } from "@/lib/hooks/useMaintenanceRequests";

interface AssignDialogProps {
  requestId: string;
  requestTitle: string;
  currentAssignee: string | null;
  staffWorkload: StaffWorkloadItem[];
  open: boolean;
  onClose: () => void;
}

export function AssignDialog({
  requestId,
  requestTitle,
  currentAssignee,
  staffWorkload,
  open,
  onClose,
}: AssignDialogProps) {
  const { mutate, isPending } = useAssignMaintenance();
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (open) {
      setAssignedTo(currentAssignee ?? "");
    }
  }, [open, currentAssignee]);

  const handleAssign = () => {
    if (!assignedTo) return;
    mutate(
      { id: requestId, assignedTo },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Request</DialogTitle>
          <DialogDescription>
            Assign "{requestTitle}" to a technician.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assign To *</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician..." />
              </SelectTrigger>
              <SelectContent>
                {staffWorkload.map((s) => (
                  <SelectItem key={s.staffId} value={s.staffId}>
                    {s.staffName} \u2014 {s.assigned} active tasks
                  </SelectItem>
                ))}
                <SelectItem value="">Unassign</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!assignedTo || isPending}>
            {isPending ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
