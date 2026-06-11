"use client";

import { useState } from "react";
import { useRunNightAudit } from "@/lib/hooks/useNightAudits";
import type { NightAuditPreCheck } from "@/lib/hooks/useNightAudits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

interface RunAuditDialogProps {
  open: boolean;
  onClose: () => void;
  preCheck: NightAuditPreCheck | null;
}

export function RunAuditDialog({ open, onClose, preCheck }: RunAuditDialogProps) {
  const runAudit = useRunNightAudit();
  const [autoPost, setAutoPost] = useState(true);
  const [markNoShows, setMarkNoShows] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const businessDate = preCheck?.businessDate ?? today;

  const handleRun = () => {
    runAudit.mutate(
      {
        businessDate,
        autoPostRoomCharges: autoPost,
        autoMarkNoShows: markNoShows,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run Night Audit</DialogTitle>
          <DialogDescription>
            Run end-of-day closeout for{" "}
            <span className="font-medium">{businessDate}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {preCheck?.checks && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Unbalanced folios: {preCheck.checks.unbalancedFolios}</p>
              <p>
                Unchecked-out reservations:{" "}
                {preCheck.checks.uncheckedOutReservations}
              </p>
              <p>Pending charges: {preCheck.checks.pendingCharges}</p>
              <p>Room discrepancies: {preCheck.checks.roomDiscrepancies}</p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoPost"
              checked={autoPost}
              onCheckedChange={(c) => setAutoPost(c === true)}
            />
            <Label htmlFor="autoPost">Auto-post room charges</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="markNoShows"
              checked={markNoShows}
              onCheckedChange={(c) => setMarkNoShows(c === true)}
            />
            <Label htmlFor="markNoShows">Auto-mark no-shows</Label>
          </div>
          {preCheck && !preCheck.canProceed && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Pre-check indicates there are issues that may block the
                audit. Review the Pre-Check tab for details.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRun} disabled={runAudit.isPending}>
            {runAudit.isPending ? "Running..." : "Run Audit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
