"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HK_STATUS_MAP } from "@/lib/constants/statuses";
import { BedDouble, Loader2, CheckCircle2, ClipboardCheck, AlertTriangle } from "lucide-react";
import type { HousekeepingDashboard } from "@/lib/hooks/useMaintenance";

interface HKDashboardStatsProps {
  dashboard: HousekeepingDashboard | undefined;
  isLoading: boolean;
  onStatusClick?: (status: string) => void;
}

const STAT_CARDS = [
  { key: "pending", icon: Loader2, iconClass: "text-amber-500" },
  { key: "inProgress", icon: BedDouble, iconClass: "text-blue-500" },
  { key: "completed", icon: CheckCircle2, iconClass: "text-emerald-500" },
  { key: "verified", icon: ClipboardCheck, iconClass: "text-slate-500" },
  { key: "issuesReported", icon: AlertTriangle, iconClass: "text-red-500" },
] as const;

const STATUS_KEY_MAP: Record<string, string> = {
  pending: "PENDING",
  inProgress: "IN_PROGRESS",
  completed: "COMPLETED",
  verified: "VERIFIED",
  issuesReported: "ISSUES_REPORTED",
};

export function HKDashboardStats({ dashboard, isLoading, onStatusClick }: HKDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {STAT_CARDS.map(({ key, icon: Icon, iconClass }) => {
        const value = dashboard?.summary?.[key as keyof typeof dashboard.summary];
        const statusKey = STATUS_KEY_MAP[key];
        const statusConfig = statusKey
          ? HK_STATUS_MAP[statusKey as keyof typeof HK_STATUS_MAP]
          : null;
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
                      {statusConfig?.label ?? key}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{value ?? 0}</p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
