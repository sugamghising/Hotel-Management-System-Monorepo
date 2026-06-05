"use client";

import type { NightAuditStatus } from "@/lib/hooks/useNightAudits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ClipboardCheck, Ban } from "lucide-react";

interface QuickActionsProps {
  status: NightAuditStatus | null;
  canProceed: boolean;
  canRun: boolean;
  canRollback: boolean;
  isInProgress: boolean;
  onRun: () => void;
  onRollback: () => void;
  onViewPreCheck: () => void;
}

export function QuickActions({
  status,
  canProceed,
  canRun,
  canRollback,
  isInProgress,
  onRun,
  onRollback,
  onViewPreCheck,
}: QuickActionsProps) {
  const showRun =
    canRun &&
    (status === "PENDING" || status === "FAILED");
  const showRollback =
    canRollback && status === "COMPLETED";

  if (!showRun && !showRollback) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {showRun && (
            <Button
              onClick={onRun}
              disabled={isInProgress || !canProceed}
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Night Audit
            </Button>
          )}
          {showRollback && (
            <Button
              variant="outline"
              onClick={onRollback}
              disabled={isInProgress}
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onViewPreCheck}
            size="lg"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            View Pre-Check
          </Button>
        </div>
        {!canProceed && showRun && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <Ban className="h-4 w-4" />
            <span>
              Pre-check has unresolved issues. Resolve them before running
              the audit.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
