"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, ClipboardCheck } from "lucide-react";
import { WorkOrderCard } from "./WorkOrderCard";
import { RequestStatusBadge } from "../Shared/RequestStatusBadge";
import { RequestTypeBadge } from "../Shared/RequestTypeBadge";
import { PRIORITY_SORT_ORDER } from "../Shared/PriorityBadge";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";

interface MyWorkQueueProps {
  requests: MaintenanceRequest[] | undefined;
  isLoading: boolean;
  isPending: boolean;
  onStart: (id: string) => void;
  onComplete: (request: MaintenanceRequest) => void;
  onAddParts: (request: MaintenanceRequest) => void;
}

export function MyWorkQueue({
  requests,
  isLoading,
  isPending,
  onStart,
  onComplete,
  onAddParts,
}: MyWorkQueueProps) {
  const { active, completed } = useMemo(() => {
    if (!requests) return { active: [], completed: [] };
    const activeList: MaintenanceRequest[] = [];
    const completedList: MaintenanceRequest[] = [];
    for (const r of requests) {
      if (r.status === "COMPLETED" || r.status === "VERIFIED" || r.status === "CANCELLED") {
        completedList.push(r);
      } else {
        activeList.push(r);
      }
    }

    const sortFn = (a: MaintenanceRequest, b: MaintenanceRequest) => {
      const pa = PRIORITY_SORT_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_SORT_ORDER[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      const sa = a.status === "IN_PROGRESS" ? 0 : 1;
      const sb = b.status === "IN_PROGRESS" ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? "");
    };

    activeList.sort(sortFn);
    return { active: activeList, completed: completedList };
  }, [requests]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Wrench className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground">No work assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">My Work Queue</h2>
        <p className="text-sm text-muted-foreground">
          {active.filter((r) => r.status === "ACKNOWLEDGED").length} open{" \u00B7 "}
          {active.filter((r) => r.status === "IN_PROGRESS").length} in progress
        </p>
      </div>

      {/* Active cards */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((req) => (
            <WorkOrderCard
              key={req.id}
              request={req}
              isPending={isPending}
              onStart={onStart}
              onComplete={onComplete}
              onAddParts={onAddParts}
            />
          ))}
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Completed ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 opacity-60"
              >
                <RequestTypeBadge requestType={req.requestType} />
                <span className="text-sm font-medium truncate">{req.title}</span>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <RequestStatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
