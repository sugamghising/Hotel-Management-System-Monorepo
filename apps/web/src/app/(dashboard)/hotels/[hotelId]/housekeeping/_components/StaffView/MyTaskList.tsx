"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { TaskStatusBadge } from "../Shared/TaskStatusBadge";
import { TaskTypeBadge } from "../Shared/TaskTypeBadge";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";

interface MyTaskListProps {
  tasks: HousekeepingTask[] | undefined;
  isLoading: boolean;
  isPending: boolean;
  onStart: (task: HousekeepingTask) => void;
  onComplete: (task: HousekeepingTask) => void;
  onReportIssues: (task: HousekeepingTask) => void;
}

export function MyTaskList({
  tasks,
  isLoading,
  isPending,
  onStart,
  onComplete,
  onReportIssues,
}: MyTaskListProps) {
  const { active, completed } = useMemo(() => {
    if (!tasks) return { active: [], completed: [] };
    const active: HousekeepingTask[] = [];
    const completed: HousekeepingTask[] = [];
    for (const task of tasks) {
      if (task.status === "COMPLETED" || task.status === "VERIFIED" || task.status === "CANCELLED") {
        completed.push(task);
      } else {
        active.push(task);
      }
    }
    return { active, completed };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No tasks assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active tasks */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Active Tasks ({active.length})
        </h3>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up!</p>
        ) : (
          <div className="space-y-3">
            {active.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isPending={isPending}
                onStart={onStart}
                onComplete={onComplete}
                onReportIssues={onReportIssues}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Completed ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 opacity-60"
              >
                <TaskTypeBadge taskType={task.taskType} />
                <span className="text-sm font-medium">
                  {task.room?.roomNumber ?? task.roomId}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  isPending,
  onStart,
  onComplete,
  onReportIssues,
}: {
  task: HousekeepingTask;
  isPending: boolean;
  onStart: (task: HousekeepingTask) => void;
  onComplete: (task: HousekeepingTask) => void;
  onReportIssues: (task: HousekeepingTask) => void;
}) {
  const priority = task.priority;
  const dotClass =
    priority >= 3
      ? "bg-red-500"
      : priority >= 2
        ? "bg-orange-400"
        : "bg-gray-300";

  const status = task.status;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", dotClass)} />
                <span className="font-semibold">
                  {task.room?.roomNumber ?? task.roomId}
                </span>
              </div>
              <TaskTypeBadge taskType={task.taskType} />
              <TaskStatusBadge status={status} />
            </div>
            {task.notes && (
              <p className="text-sm text-muted-foreground">{task.notes}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.scheduledFor && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(task.scheduledFor).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {task.estimatedMinutes && (
                <span>{task.estimatedMinutes} min</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            {status === "PENDING" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={isPending}
                onClick={() => onStart(task)}
              >
                <Play className="h-3.5 w-3.5" /> Start
              </Button>
            )}
            {status === "IN_PROGRESS" && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1"
                  disabled={isPending}
                  onClick={() => onComplete(task)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-amber-600"
                  disabled={isPending}
                  onClick={() => onReportIssues(task)}
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Issues
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
