"use client";

import type { NightAuditStatus_ } from "@/lib/hooks/useNightAudits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NightAuditBadge } from "@/components/status/StatusBadge";
import { Banknote, Receipt, CreditCard, FileUp, UserX, FileText, DoorOpen, BedDouble } from "lucide-react";

interface ReportTabProps {
  audit: NightAuditStatus_ | null;
  isLoading: boolean;
  latestCompletedId: string | null;
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function ReportTab({ audit, isLoading }: ReportTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Operational Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!audit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Audit Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No completed audit found. Run a night audit to generate a
            report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Audit Report — {audit.businessDate}
          </CardTitle>
          <NightAuditBadge status={audit.status} />
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <span>Started: {formatDateTime(audit.startedAt)}</span>
            <span>Completed: {formatDateTime(audit.completedAt)}</span>
            <span>By: {audit.performedBy ?? "—"}</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold">Revenue</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                      <Banknote className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium">Room Revenue</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(audit.roomRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                      <Receipt className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Other Revenue</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(audit.otherRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50">
                      <CreditCard className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium">
                      Payments Received
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(audit.paymentsReceived)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Operations
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50">
                      <FileUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium">
                      Auto-Posted Charges
                    </span>
                  </div>
                  <span className="font-semibold">
                    {audit.autoPostedCharges}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
                      <UserX className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">
                      No-Shows Marked
                    </span>
                  </div>
                  <span className="font-semibold">
                    {audit.noShowsMarked}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
                      <FileText className="h-4 w-4 text-rose-600" />
                    </div>
                    <span className="text-sm font-medium">
                      Unbalanced Folios
                    </span>
                  </div>
                  <span className="font-semibold">
                    {audit.unbalancedFolios}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                      <BedDouble className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium">
                      Unchecked-Out Res
                    </span>
                  </div>
                  <span className="font-semibold">
                    {audit.uncheckedOutRes}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50">
                      <DoorOpen className="h-4 w-4 text-cyan-600" />
                    </div>
                    <span className="text-sm font-medium">
                      Room Discrepancies
                    </span>
                  </div>
                  <span className="font-semibold">
                    {audit.roomDiscrepancies}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {audit.notes && (
            <div className="mt-6 rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-1 text-sm font-semibold">Notes</h4>
              <p className="text-sm text-muted-foreground">{audit.notes}</p>
            </div>
          )}
          {audit.errors && Array.isArray(audit.errors) && audit.errors.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="mb-1 text-sm font-semibold text-red-800">
                Errors
              </h4>
              <ul className="list-inside list-disc text-sm text-red-700">
                {audit.errors.map((err, i) => (
                  <li key={i}>
                    {typeof err === "string" ? err : JSON.stringify(err)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
