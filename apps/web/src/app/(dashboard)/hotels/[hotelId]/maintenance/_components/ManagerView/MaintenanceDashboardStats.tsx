"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Inbox,
  UserCheck,
  Wrench,
  CheckCircle2,
  ClipboardCheck,
  PauseCircle,
  BedDouble,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { MaintenanceDashboard } from "@/lib/hooks/useMaintenanceRequests";

interface MaintenanceDashboardStatsProps {
  dashboard: MaintenanceDashboard | undefined;
  isLoading: boolean;
  onStatusClick?: (status: string) => void;
  onPriorityClick?: (priority: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-200 dark:bg-gray-700",
  MEDIUM: "bg-blue-200 dark:bg-blue-700",
  HIGH: "bg-orange-200 dark:bg-orange-700",
  URGENT: "bg-red-200 dark:bg-red-700",
  EMERGENCY: "bg-red-500 dark:bg-red-600 animate-pulse",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
  EMERGENCY: "Emergency",
};

export function MaintenanceDashboardStats({
  dashboard,
  isLoading,
  onStatusClick,
  onPriorityClick,
}: MaintenanceDashboardStatsProps) {
  const byStatusMap: Record<string, number> = {};
  dashboard?.byStatus.forEach(({ status, count }) => {
    byStatusMap[status] = count;
  });

  const STAT_CARDS = [
    { key: "REPORTED", label: "Reported", icon: Inbox, iconClass: "text-red-500" },
    { key: "ACKNOWLEDGED", label: "Assigned", icon: UserCheck, iconClass: "text-amber-500" },
    { key: "IN_PROGRESS", label: "In Progress", icon: Wrench, iconClass: "text-indigo-500" },
    { key: "COMPLETED", label: "Completed", icon: CheckCircle2, iconClass: "text-emerald-500" },
    { key: "VERIFIED", label: "Verified", icon: ClipboardCheck, iconClass: "text-slate-500" },
    { key: "PENDING_PARTS", label: "Pending Parts", icon: PauseCircle, iconClass: "text-orange-500" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, iconClass }) => {
          const value = byStatusMap[key] ?? 0;
          return (
            <Card
              key={key}
              className={cn(
                "transition-colors",
                onStatusClick && "cursor-pointer hover:bg-accent/50",
              )}
              onClick={() => onStatusClick?.(key)}
            >
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("h-4 w-4", iconClass)} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metric chips */}
      {!isLoading && dashboard && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm text-orange-700">
            <AlertTriangle className="h-4 w-4" />
            {dashboard.openCount} open, {dashboard.overdueCount} overdue
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
            <BedDouble className="h-4 w-4" />
            {dashboard.unassignedCount} unassigned
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Avg resolution: {dashboard.averageResolutionHours.toFixed(1)}h
          </div>
        </div>
      )}

      {/* Priority row */}
      {!isLoading && dashboard?.byPriority && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">
            Priority:
          </span>
          {Object.entries(PRIORITY_LABELS).map(([key, label]) => {
            const item = dashboard.byPriority.find((p) => p.priority === key);
            const count = item?.count ?? 0;
            return (
              <button
                key={key}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  onPriorityClick && "cursor-pointer hover:bg-accent/50",
                  count === 0 && "opacity-40",
                )}
                onClick={() => onPriorityClick?.(key)}
              >
                <span className={cn("h-2 w-2 rounded-full", PRIORITY_COLORS[key] ?? "bg-gray-300")} />
                {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Requests by Status bar chart */}
      {!isLoading && dashboard?.byStatus && dashboard.byStatus.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Requests by Status
            </h4>
            <div className="space-y-2">
              {dashboard.byStatus
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map(({ status, count }) => {
                  const max = Math.max(...dashboard.byStatus.map((s) => s.count), 1);
                  const pct = (count / max) * 100;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-muted-foreground truncate shrink-0">
                        {status.replace(/_/g, " ").toLowerCase()}
                      </span>
                      <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500/60 dark:bg-blue-500/40 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-6 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
