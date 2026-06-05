"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatInitials } from "@/lib/utils/formatters";
import { Users } from "lucide-react";
import type { StaffWorkloadItem } from "@/lib/hooks/useMaintenanceRequests";

interface StaffWorkloadPanelProps {
  workload: StaffWorkloadItem[] | undefined;
  isLoading: boolean;
  onStaffClick?: (staffId: string) => void;
}

export function StaffWorkloadPanel({ workload, isLoading, onStaffClick }: StaffWorkloadPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Technician Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workload || workload.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Technician Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">All caught up!</p>
        </CardContent>
      </Card>
    );
  }

  const maxAssigned = Math.max(...workload.map((w) => w.assigned), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Technician Workload
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {workload.map((item) => (
          <div
            key={item.staffId}
            className={cn(
              "flex items-center gap-3",
              onStaffClick && "cursor-pointer hover:opacity-80 transition-opacity",
            )}
            onClick={() => onStaffClick?.(item.staffId)}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">
                {formatInitials(item.staffName.split(" ")[0] ?? "", item.staffName.split(" ")[1] ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.staffName}</p>
              <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${item.assigned > 0 ? (item.completed / item.assigned) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {item.completed}/{item.assigned}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
