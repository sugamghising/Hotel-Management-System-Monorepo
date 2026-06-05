"use client";

import type { NightAuditStatus_, NightAuditPreCheck } from "@/lib/hooks/useNightAudits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NightAuditBadge } from "@/components/status/StatusBadge";
import { Calendar, Clock, User, AlertTriangle } from "lucide-react";

interface CurrentStatusCardProps {
  audit: NightAuditStatus_ | null;
  preCheck: NightAuditPreCheck | null;
  isLoading: boolean;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function CurrentStatusCard({
  audit,
  preCheck,
  isLoading,
}: CurrentStatusCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  const hasErrors =
    audit?.errors && Array.isArray(audit.errors) && audit.errors.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Status
        </CardTitle>
        {audit && (
          <NightAuditBadge status={audit.status} size="lg" />
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Business Date:</span>
            <span className="font-medium">
              {preCheck?.businessDate ?? audit?.businessDate ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">
              {formatDateTime(audit?.startedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-medium">
              {formatDateTime(audit?.completedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Performed By:</span>
            <span className="font-medium">
              {audit?.performedBy ?? "—"}
            </span>
          </div>
        </div>
        {hasErrors && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Errors during audit
            </div>
            <ul className="mt-1 list-inside list-disc text-sm text-red-700">
              {audit!.errors!.map((err: unknown, i: number) => (
                <li key={i}>
                  {typeof err === "string"
                    ? err
                    : JSON.stringify(err)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {audit?.notes && (
          <div className="mt-4 rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{audit.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
