"use client";

import { useState } from "react";
import { useRollbackNightAudit } from "@/lib/hooks/useNightAudits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RollbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RollbackDialog({ open, onClose }: RollbackDialogProps) {
  const rollback = useRollbackNightAudit();
  const [reason, setReason] = useState("");

  const handleRollback = () => {
    if (!reason.trim()) return;
    rollback.mutate(reason.trim(), {
      onSuccess: () => {
        setReason("");
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rollback Night Audit</DialogTitle>
          <DialogDescription>
            This will reverse the last completed night audit. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Rolling back will revert all changes made during the night
              audit process.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for rollback</Label>
            <Textarea
              id="reason"
              placeholder="Explain why the rollback is needed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRollback}
            disabled={rollback.isPending || !reason.trim()}
          >
            {rollback.isPending ? "Rolling back..." : "Confirm Rollback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
