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
import { useVerifyTask } from "@/lib/hooks/useMaintenance";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";

interface VerifyTaskDialogProps {
  task: HousekeepingTask;
  open: boolean;
  onClose: () => void;
}

export function VerifyTaskDialog({ task, open, onClose }: VerifyTaskDialogProps) {
  const { mutate, isPending } = useVerifyTask();
  const [inspectionScore, setInspectionScore] = useState("");
  const [issuesFound, setIssuesFound] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setInspectionScore("");
      setIssuesFound("");
      setNotes("");
    }
  }, [open]);

  const handleVerify = () => {
    const score = Number(inspectionScore);
    if (isNaN(score) || score < 0 || score > 100) return;
    mutate(
      {
        id: task.id,
        input: {
          inspectionScore: score,
          issuesFound: issuesFound.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Task</DialogTitle>
          <DialogDescription>
            Room {task.room?.roomNumber ?? task.roomId} \u2014 quality inspection verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Inspection Score *</Label>
            <Input
              type="number"
              placeholder="0-100"
              value={inspectionScore}
              onChange={(e) => setInspectionScore(e.target.value)}
              min={0}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Issues Found (optional)</Label>
            <Textarea
              value={issuesFound}
              onChange={(e) => setIssuesFound(e.target.value)}
              placeholder="Describe any issues found..."
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={!inspectionScore || isPending}
          >
            {isPending ? "Verifying..." : "Verify Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
