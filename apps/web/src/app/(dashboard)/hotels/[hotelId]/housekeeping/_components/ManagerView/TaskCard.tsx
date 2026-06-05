"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Play, CheckCircle2, ClipboardCheck, AlertTriangle, Clock } from "lucide-react";
import { TaskStatusBadge } from "../Shared/TaskStatusBadge";
import { TaskTypeBadge } from "../Shared/TaskTypeBadge";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";

interface TaskCardProps {
  task: HousekeepingTask;
  isPending: boolean;
  onStart?: (task: HousekeepingTask) => void;
  onComplete?: (task: HousekeepingTask) => void;
  onVerify?: (task: HousekeepingTask) => void;
  onReportIssues?: (task: HousekeepingTask) => void;
}

export function TaskCard({
  task,
  isPending,
  onStart,
  onComplete,
  onVerify,
  onReportIssues,
}: TaskCardProps) {
  const priority = task.priority;
  const dotClass =
    priority >= 3
      ? "bg-red-500"
      : priority >= 2
        ? "bg-orange-400"
        : "bg-gray-300";

  const initials = task.assignee
    ? `${task.assignee.firstName[0]}${task.assignee.lastName[0]}`
    : "?";

  const status = task.status;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 space-y-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", dotClass)} />
            <span className="font-semibold text-sm">
              {task.room?.roomNumber ?? task.roomId}
            </span>
          </div>
          <TaskStatusBadge status={status} />
        </div>

        {/* Type badge */}
        <div className="flex items-center justify-between">
          <TaskTypeBadge taskType={task.taskType} />
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimatedMinutes}m
            </span>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {task.assignee
              ? `${task.assignee.firstName} ${task.assignee.lastName}`
              : "Unassigned"}
          </span>
        </div>

        {/* Notes */}
        {task.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1">
          {status === "PENDING" && onStart && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={isPending}
              onClick={() => onStart(task)}
            >
              <Play className="h-3 w-3" /> Start
            </Button>
          )}
          {status === "IN_PROGRESS" && onComplete && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 text-emerald-600"
              disabled={isPending}
              onClick={() => onComplete(task)}
            >
              <CheckCircle2 className="h-3 w-3" /> Complete
            </Button>
          )}
          {status === "COMPLETED" && onVerify && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 text-blue-600"
              disabled={isPending}
              onClick={() => onVerify(task)}
            >
              <ClipboardCheck className="h-3 w-3" /> Verify
            </Button>
          )}
          {status === "IN_PROGRESS" && onReportIssues && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 text-amber-600"
              disabled={isPending}
              onClick={() => onReportIssues(task)}
            >
              <AlertTriangle className="h-3 w-3" /> Issues
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
