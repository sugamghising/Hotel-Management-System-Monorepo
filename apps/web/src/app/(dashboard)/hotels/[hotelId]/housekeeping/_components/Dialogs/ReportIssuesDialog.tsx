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
import { Checkbox } from "@/components/ui/checkbox";
import { useReportTaskIssues } from "@/lib/hooks/useMaintenance";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";

interface ReportIssuesDialogProps {
  task: HousekeepingTask;
  open: boolean;
  onClose: () => void;
}

export function ReportIssuesDialog({ task, open, onClose }: ReportIssuesDialogProps) {
  const { mutate, isPending } = useReportTaskIssues();
  const [issuesFound, setIssuesFound] = useState("");
  const [notes, setNotes] = useState("");
  const [requiresMaintenance, setRequiresMaintenance] = useState(false);

  useEffect(() => {
    if (open) {
      setIssuesFound("");
      setNotes("");
      setRequiresMaintenance(false);
    }
  }, [open]);

  const handleReport = () => {
    if (!issuesFound.trim()) return;
    mutate(
      {
        id: task.id,
        input: {
          issuesFound: issuesFound.trim(),
          notes: notes.trim() || undefined,
          requiresMaintenance,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Issues</DialogTitle>
          <DialogDescription>
            Room {task.room?.roomNumber ?? task.roomId} \u2014 log issues found during cleaning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Issues Found *</Label>
            <Textarea
              value={issuesFound}
              onChange={(e) => setIssuesFound(e.target.value)}
              placeholder="Describe the issues found..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="requires-maintenance"
              checked={requiresMaintenance}
              onCheckedChange={(v) => setRequiresMaintenance(v === true)}
            />
            <Label htmlFor="requires-maintenance" className="text-sm cursor-pointer">
              Requires maintenance ticket
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleReport}
            disabled={!issuesFound.trim() || isPending}
          >
            {isPending ? "Reporting..." : "Report Issues"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
