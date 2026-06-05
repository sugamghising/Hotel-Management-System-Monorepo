"use client";

import type { NightAuditPreCheck } from "@/lib/hooks/useNightAudits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  DoorOpen,
  Receipt,
  BedDouble,
} from "lucide-react";

interface PreCheckChecklistProps {
  preCheck: NightAuditPreCheck | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const CHECK_ITEMS = [
  {
    key: "unbalancedFolios" as const,
    label: "Unbalanced Folios",
    description: "Folios with outstanding balances that need resolution",
    icon: FileText,
  },
  {
    key: "uncheckedOutReservations" as const,
    label: "Unchecked-Out Reservations",
    description: "Reservations that have not been checked out",
    icon: BedDouble,
  },
  {
    key: "pendingCharges" as const,
    label: "Pending Charges",
    description: "Charges that have not been posted to folios",
    icon: Receipt,
  },
  {
    key: "roomDiscrepancies" as const,
    label: "Room Discrepancies",
    description: "Mismatches between system and actual room status",
    icon: DoorOpen,
  },
];

export function PreCheckChecklist({
  preCheck,
  isLoading,
  isError,
  onRetry,
}: PreCheckChecklistProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pre-Flight Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pre-Flight Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to load pre-check data</AlertTitle>
            <AlertDescription>
              There was an error loading the pre-flight checklist. Please try
              again.
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!preCheck) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pre-Flight Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No pre-check data available. The system may not have run a
            pre-check yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pre-Flight Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CHECK_ITEMS.map((item) => {
            const count = preCheck.checks[item.key];
            const passed = count === 0;
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    passed
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Badge
                  variant={passed ? "secondary" : "destructive"}
                  className="shrink-0"
                >
                  {count}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Alert variant={preCheck.canProceed ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {preCheck.canProceed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <AlertTitle>
            {preCheck.canProceed
              ? "Ready to proceed"
              : "Issues blocking audit"}
          </AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          {preCheck.canProceed
            ? "All checks passed. You can proceed with the night audit."
            : "Resolve the issues above before running the night audit."}
        </AlertDescription>
        {preCheck.warnings.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-amber-700">Warnings:</p>
            <ul className="list-inside list-disc text-sm text-amber-600">
              {preCheck.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {preCheck.errors.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-red-700">Errors:</p>
            <ul className="list-inside list-disc text-sm text-red-600">
              {preCheck.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </Alert>
    </div>
  );
}
