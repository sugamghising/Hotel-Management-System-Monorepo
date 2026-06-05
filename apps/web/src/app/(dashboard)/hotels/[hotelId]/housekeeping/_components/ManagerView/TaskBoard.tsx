"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HK_STATUS_MAP } from "@/lib/constants/statuses";
import { TaskCard } from "./TaskCard";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";

interface TaskBoardProps {
  tasks: HousekeepingTask[];
  isLoading: boolean;
  isPending: boolean;
  onStart?: (task: HousekeepingTask) => void;
  onComplete?: (task: HousekeepingTask) => void;
  onVerify?: (task: HousekeepingTask) => void;
  onReportIssues?: (task: HousekeepingTask) => void;
}

const BOARD_COLUMNS = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "VERIFIED",
  "ISSUES_REPORTED",
  "CANCELLED",
] as const;

export function TaskBoard({
  tasks,
  isLoading,
  isPending,
  onStart,
  onComplete,
  onVerify,
  onReportIssues,
}: TaskBoardProps) {
  const columns = useMemo(() => {
    const grouped: Record<string, HousekeepingTask[]> = {};
    for (const col of BOARD_COLUMNS) {
      grouped[col] = [];
    }
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    }
    return BOARD_COLUMNS.map((status) => ({
      status,
      config: HK_STATUS_MAP[status as keyof typeof HK_STATUS_MAP],
      items: grouped[status],
    }));
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((col) => (
          <div key={col} className="min-w-[280px] max-w-[320px] flex-1 space-y-3">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(({ status, config, items }) => (
        <div
          key={status}
          className="min-w-[280px] max-w-[320px] flex-1"
        >
          {/* Column header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  config?.color,
                )}
              >
                {config?.label ?? status}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {items.length}
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No tasks
              </p>
            ) : (
              items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isPending={isPending}
                  onStart={onStart}
                  onComplete={onComplete}
                  onVerify={onVerify}
                  onReportIssues={onReportIssues}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
