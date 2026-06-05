"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Play,
  CheckCircle2,
  ClipboardCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskTypeBadge } from "./TaskTypeBadge";

interface TaskTableProps {
  tasks: HousekeepingTask[];
  isLoading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
  selectedTaskIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onStart?: (task: HousekeepingTask) => void;
  onComplete?: (task: HousekeepingTask) => void;
  onVerify?: (task: HousekeepingTask) => void;
  onReportIssues?: (task: HousekeepingTask) => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
}

export function TaskTable({
  tasks,
  isLoading,
  total,
  page,
  onPageChange,
  isPending,
  selectedTaskIds = [],
  onSelectionChange,
  onStart,
  onComplete,
  onVerify,
  onReportIssues,
  toolbar,
  emptyMessage,
}: TaskTableProps) {
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleSelection = (id: string) => {
    if (!onSelectionChange) return;
    const next = selectedTaskIds.includes(id)
      ? selectedTaskIds.filter((tid) => tid !== id)
      : [...selectedTaskIds, id];
    onSelectionChange(next);
  };

  const columns: ColumnDef<HousekeepingTask>[] = useMemo(
    () => [
      ...(onSelectionChange
        ? [
            {
              id: "select",
              header: "",
              size: 36,
              cell: ({ row }: { row: { original: HousekeepingTask } }) => (
                <Checkbox
                  checked={selectedTaskIds.includes(row.original.id)}
                  onCheckedChange={() => toggleSelection(row.original.id)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="ml-1"
                />
              ),
            },
          ]
        : []),
      {
        accessorKey: "room.roomNumber",
        header: "Room",
        size: 80,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.room?.roomNumber ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "taskType",
        header: "Type",
        size: 140,
        cell: ({ row }) => <TaskTypeBadge taskType={row.original.taskType} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
      },
      {
        id: "priority",
        header: "Priority",
        size: 80,
        cell: ({ row }) => {
          const priority = row.original.priority;
          const dotClass =
            priority >= 3
              ? "bg-red-500"
              : priority >= 2
                ? "bg-orange-400"
                : "bg-gray-300";
          return (
            <div className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", dotClass)} />
              <span className="text-xs text-muted-foreground">
                {priority >= 3 ? "Urgent" : priority >= 2 ? "High" : "Normal"}
              </span>
            </div>
          );
        },
      },
      {
        id: "assignee",
        header: "Assigned To",
        size: 120,
        cell: ({ row }) => {
          const a = row.original.assignee;
          return (
            <span className="text-sm text-muted-foreground">
              {a ? `${a.firstName} ${a.lastName}` : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "scheduledFor",
        header: "Scheduled",
        size: 110,
        cell: ({ row }) => {
          const d = row.original.scheduledFor;
          if (!d) return <span className="text-sm text-muted-foreground">-</span>;
          return (
            <span className="text-sm">
              {new Date(d).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 140,
        cell: ({ row }) => {
          const task = row.original;
          const status = task.status;
          return (
            <div className="flex items-center gap-1">
              {status === "PENDING" && onStart && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(task);
                  }}
                  title="Start"
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              )}
              {status === "IN_PROGRESS" && onComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task);
                  }}
                  title="Complete"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {status === "COMPLETED" && onVerify && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerify(task);
                  }}
                  title="Verify"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                </Button>
              )}
              {status === "IN_PROGRESS" && onReportIssues && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-600"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportIssues(task);
                  }}
                  title="Report Issues"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [isPending, onStart, onComplete, onVerify, onReportIssues, selectedTaskIds, onSelectionChange],
  );

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        toolbar={toolbar}
        emptyMessage={emptyMessage ?? "No tasks found."}
        pageSize={pageSize}
        hidePagination
        className="w-full"
      />

      {/* Server-side pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {isLoading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
            ) : (
              `${total} record${total !== 1 ? "s" : ""}`
            )}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
