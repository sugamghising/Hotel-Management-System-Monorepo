"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface OrgDangerZoneTabProps {
  orgId: string;
  orgName: string;
  canDelete: boolean;
}

export function OrgDangerZoneTab({ orgId, orgName, canDelete }: OrgDangerZoneTabProps) {
  const [confirmText, setConfirmText] = useState("");

  if (!canDelete) return null;

  const handleRequestDeletion = () => {
    window.open("mailto:support@hms.com?subject=Organization Deletion Request", "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-red-600">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Destructive actions for this organization. Proceed with caution.
        </p>
      </div>
      <Separator />

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-sm font-semibold text-red-800">
            Delete Organization
          </span>
        </div>

        <p className="text-xs text-red-700">
          Deleting &ldquo;{orgName}&rdquo; will remove all associated hotels, bookings, users, and data.
          This action cannot be undone.
        </p>

        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Contact support</AlertTitle>
          <AlertDescription className="text-xs">
            Organization deletion must be processed by our support team.
            Please contact us to proceed.
          </AlertDescription>
        </Alert>

        <div>
          <Label className="text-xs font-medium">
            Type <strong>{orgName}</strong> to confirm:
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 h-8 text-sm font-mono"
            placeholder={orgName}
          />
        </div>

        <Button
          size="sm"
          disabled={confirmText !== orgName}
          onClick={handleRequestDeletion}
          className="bg-red-600 hover:bg-red-700"
        >
          <><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Request Deletion</>
        </Button>
      </div>
    </div>
  );
}
