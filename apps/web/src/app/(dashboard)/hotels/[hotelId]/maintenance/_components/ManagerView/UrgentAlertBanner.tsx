"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";
import { PriorityBadge } from "../Shared/PriorityBadge";

interface UrgentAlertBannerProps {
  urgentRequests: MaintenanceRequest[] | undefined;
  isLoading: boolean;
  onViewAll: () => void;
}

export function UrgentAlertBanner({ urgentRequests, isLoading, onViewAll }: UrgentAlertBannerProps) {
  if (isLoading) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">Checking urgent requests...</AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-64 mt-1" />
        </AlertDescription>
      </Alert>
    );
  }

  if (!urgentRequests || urgentRequests.length === 0) return null;

  const displayRequests = urgentRequests.slice(0, 3);
  const remaining = urgentRequests.length - 3;

  return (
    <Alert variant="destructive" className="mb-4 border-red-300 bg-red-50 dark:bg-red-950/30">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">
        {"\uD83D\uDEA8"} {urgentRequests.length} urgent request{urgentRequests.length !== 1 ? "s" : ""} need immediate attention
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-1.5">
          {displayRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {req.room ? `Room ${req.room.roomNumber}` : "No room"}
              </span>
              {"\u2014"}
              <span className="truncate max-w-[200px]">{req.title}</span>
              <PriorityBadge priority={req.priority} />
            </div>
          ))}
        </div>
        {remaining > 0 && (
          <p className="text-sm mt-1 text-muted-foreground">
            ... and {remaining} more
          </p>
        )}
        <Button variant="link" size="sm" className="h-auto px-0 text-sm mt-1" onClick={onViewAll}>
          View all {"\u2192"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
