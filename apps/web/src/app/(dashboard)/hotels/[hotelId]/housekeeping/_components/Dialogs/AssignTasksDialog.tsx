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
import { Label } from "@/components/ui/label";
import { useBulkAssignTasks } from "@/lib/hooks/useMaintenance";

interface AssignTasksDialogProps {
  open: boolean;
  onClose: () => void;
  taskIds: string[];
}

export function AssignTasksDialog({ open, onClose, taskIds }: AssignTasksDialogProps) {
  const { mutate, isPending } = useBulkAssignTasks();
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (open) {
      setAssignedTo("");
    }
  }, [open]);

  const handleAssign = () => {
    if (!assignedTo.trim() || taskIds.length === 0) return;
    mutate(
      { taskIds, assignedTo: assignedTo.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Tasks</DialogTitle>
          <DialogDescription>
            Assign {taskIds.length} task{taskIds.length !== 1 ? "s" : ""} to a staff member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Staff User ID *</Label>
            <Input
              placeholder="Enter user ID..."
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the user ID of the staff member to assign these tasks to.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!assignedTo.trim() || isPending}
          >
            {isPending ? "Assigning..." : `Assign to Staff`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
