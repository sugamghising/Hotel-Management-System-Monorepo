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
import { Separator } from "@/components/ui/separator";
import { useVerifyMaintenance, useUpdateMaintenance } from "@/lib/hooks/useMaintenanceRequests";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";

interface VerifyDialogProps {
  request: MaintenanceRequest;
  open: boolean;
  onClose: () => void;
  currency?: string;
}

export function VerifyDialog({ request, open, onClose, currency = "USD" }: VerifyDialogProps) {
  const verifyMut = useVerifyMaintenance();
  const updateMut = useUpdateMaintenance();
  const [verificationNotes, setVerificationNotes] = useState("");

  useEffect(() => {
    if (open) setVerificationNotes("");
  }, [open]);

  const handleApprove = () => {
    verifyMut.mutate(
      { id: request.id, input: { verificationNotes: verificationNotes.trim() || undefined } },
      { onSuccess: onClose },
    );
  };

  const handleReject = () => {
    const note = verificationNotes.trim()
      ? `[Rejected] ${verificationNotes}`
      : "[Rejected \u2014 needs rework]";
    updateMut.mutate(
      { id: request.id, input: { status: "ASSIGNED" } },
      { onSuccess: onClose },
    );
  };

  const isPending = verifyMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Verify Request</DialogTitle>
          <DialogDescription>
            Review and verify the completed maintenance work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-medium">{request.title}</p>
            <p className="text-sm text-muted-foreground">
              {request.requestType.replace(/_/g, " ").toLowerCase()}
              {request.room && ` \u2014 Room ${request.room.roomNumber}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Technician:</span>{" "}
              {request.assignee ? `${request.assignee.firstName} ${request.assignee.lastName}` : "N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>{" "}
              {request.completedAt ? formatDate(request.completedAt) : "N/A"}
            </div>
          </div>

          {request.completionNotes && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Completion Notes</Label>
              <Textarea
                value={request.completionNotes}
                readOnly
                className="text-sm bg-muted/30 resize-none"
                rows={3}
              />
            </div>
          )}

          {request.partsUsed.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Parts Used</Label>
              <div className="rounded-lg border bg-muted/30 p-2 text-sm space-y-1">
                {request.partsUsed.map((p, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{p.partName} \u00D7 {p.quantity}</span>
                    <span className="text-muted-foreground">{formatCurrency(p.unitCost * p.quantity, currency)}</span>
                  </div>
                ))}
                {request.actualCost != null && (
                  <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(request.actualCost, currency)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Verification Notes (optional)</Label>
            <Textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add verification notes if needed..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="destructive" onClick={handleReject} disabled={isPending}>
            Reject \u2014 Needs Rework
          </Button>
          <Button onClick={handleApprove} disabled={isPending}>
            {verifyMut.isPending ? "Verifying..." : "Approve & Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
