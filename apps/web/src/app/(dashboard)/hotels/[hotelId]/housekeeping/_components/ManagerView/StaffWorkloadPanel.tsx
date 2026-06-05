"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface StaffWorkloadItem {
  staffId: string;
  staffName: string;
  assigned: number;
  completed: number;
}

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
            Staff Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
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
            Staff Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No staff data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Staff Workload
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y">
          {workload.map((item) => (
            <div
              key={item.staffId}
              className={cn(
                "flex items-center justify-between py-2.5 text-sm",
                onStaffClick && "cursor-pointer hover:text-foreground/80 transition-colors",
              )}
              onClick={() => onStaffClick?.(item.staffId)}
            >
              <span className="font-medium">{item.staffName}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.assigned} assigned
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {item.completed} done
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
