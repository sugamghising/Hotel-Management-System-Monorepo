"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from "lucide-react";
import { RequestStatusBadge } from "../Shared/RequestStatusBadge";
import { RequestTypeBadge } from "../Shared/RequestTypeBadge";
import { PriorityBadge } from "../Shared/PriorityBadge";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";

interface MaintenanceTableProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
  canViewCosts: boolean;
  canVerify: boolean;
  isManager: boolean;
  userId: string;
  onAssign: (request: MaintenanceRequest) => void;
  onSchedule: (request: MaintenanceRequest) => void;
  onStart: (id: string) => void;
  onComplete: (request: MaintenanceRequest) => void;
  onVerify: (request: MaintenanceRequest) => void;
  onAddParts: (request: MaintenanceRequest) => void;
  onEdit: (request: MaintenanceRequest) => void;
  onUpdateStatus: (id: string, status: string) => void;
  emptyMessage?: string;
}

export function MaintenanceTable({
  requests,
  isLoading,
  total,
  page,
  onPageChange,
  isPending,
  canViewCosts,
  canVerify,
  isManager,
  userId,
  onAssign,
  onSchedule,
  onStart,
  onComplete,
  onVerify,
  onAddParts,
  onEdit,
  onUpdateStatus,
  emptyMessage,
}: MaintenanceTableProps) {
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const today = new Date().toISOString().split("T")[0];

  const columns: ColumnDef<MaintenanceRequest>[] = useMemo(
    () => [
      {
        id: "request",
        header: "Request",
        size: 220,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2" title={r.title}>
                {r.title}
              </p>
              <div className="flex items-center gap-1.5">
                <RequestTypeBadge requestType={r.requestType} />
              </div>
              {r.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                  {r.description}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "location",
        header: "Location",
        size: 140,
        cell: ({ row }) => {
          const r = row.original;
          if (r.room) {
            return (
              <div className="text-sm space-y-0.5">
                <span className="font-medium">Room {r.room.roomNumber}</span>
                {r.room.floor != null && (
                  <span className="text-xs text-muted-foreground block">
                    Floor {r.room.floor} \u00B7 {r.room.roomType.code}
                  </span>
                )}
              </div>
            );
          }
          if (r.location) {
            return <span className="text-sm text-muted-foreground">{r.location}</span>;
          }
          return <span className="text-sm text-muted-foreground">{"\u2014"}</span>;
        },
      },
      {
        id: "priority_status",
        header: "Priority / Status",
        size: 140,
        cell: ({ row }) => {
          const r = row.original;
          const isOverdue =
            r.scheduledFor &&
            r.scheduledFor < today &&
            !["COMPLETED", "VERIFIED", "CANCELLED"].includes(r.status);
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <PriorityBadge priority={r.priority} />
                {r.priority === "EMERGENCY" && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </div>
              <RequestStatusBadge status={r.status} />
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px] px-1 py-0 h-auto">
                  Overdue
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "assignee",
        header: "Assigned To",
        size: 130,
        cell: ({ row }) => {
          const r = row.original;
          const isOpenOver24h =
            r.status === "REPORTED" &&
            r.createdAt &&
            new Date(r.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;
          if (r.assignee) {
            return (
              <div className="text-sm">
                <span>{r.assignee.firstName} {r.assignee.lastName}</span>
                {r.assignedAt && (
                  <p className="text-xs text-muted-foreground">{formatDate(r.assignedAt)}</p>
                )}
              </div>
            );
          }
          return (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Unassigned</span>
              {isOpenOver24h && (
                <AlertTriangle className="h-3 w-3 text-amber-500" />
              )}
            </div>
          );
        },
      },
      {
        id: "dates",
        header: "Dates",
        size: 110,
        cell: ({ row }) => {
          const r = row.original;
          const isOverdue =
            r.scheduledFor &&
            r.scheduledFor < today &&
            !["COMPLETED", "VERIFIED", "CANCELLED"].includes(r.status);
          return (
            <div className="text-xs space-y-0.5">
              <div>Created: {formatDate(r.createdAt)}</div>
              <div>
                Sched: {r.scheduledFor ? formatDate(r.scheduledFor) : "Not scheduled"}
              </div>
              {isOverdue && (
                <span className="text-red-600 font-medium">Overdue</span>
              )}
            </div>
          );
        },
      },
      {
        id: "cost",
        header: "Cost",
        size: 120,
        cell: ({ row }) => {
          const r = row.original;
          const hasEstimated = r.estimatedCost != null;
          const hasActual = r.actualCost != null;
          const isOverBudget =
            hasEstimated && hasActual && r.estimatedCost! > 0 &&
            r.actualCost! > r.estimatedCost! * 1.2;

          return (
            <div className={cn("space-y-0.5", !canViewCosts && "invisible")}>
              <div className="text-xs text-muted-foreground">
                Est: {hasEstimated ? formatCurrency(r.estimatedCost!) : "\u2014"}
              </div>
              <div className="text-xs text-muted-foreground">
                Act: {hasActual ? formatCurrency(r.actualCost!) : "pending"}
              </div>
              {isOverBudget && (
                <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                  Over budget
                </span>
              )}
              {r.partsUsed.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {r.partsUsed.length} part{r.partsUsed.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          const status = r.status;
          const canCompleteThis =
            status === "IN_PROGRESS" && (isManager || r.assignedTo === userId);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {status === "REPORTED" && (
                  <>
                    {isManager && (
                      <DropdownMenuItem onClick={() => onAssign(r)}>Assign</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onSchedule(r)}>Schedule</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(r)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(r.id, "PENDING_PARTS")}>
                      Put On Hold
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onUpdateStatus(r.id, "CANCELLED")}
                    >
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}
                {status === "ACKNOWLEDGED" && (
                  <>
                    {isManager && (
                      <DropdownMenuItem onClick={() => onAssign(r)}>Reassign</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onSchedule(r)}>Schedule</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStart(r.id)}>Mark Started</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(r)}>Edit</DropdownMenuItem>
                  </>
                )}
                {status === "IN_PROGRESS" && (
                  <>
                    <DropdownMenuItem onClick={() => onAddParts(r)}>Add Parts</DropdownMenuItem>
                    {canCompleteThis && (
                      <DropdownMenuItem onClick={() => onComplete(r)}>Complete</DropdownMenuItem>
                    )}
                  </>
                )}
                {status === "COMPLETED" && (
                  <>
                    {canVerify && (
                      <DropdownMenuItem onClick={() => onVerify(r)}>Verify</DropdownMenuItem>
                    )}
                  </>
                )}
                {status === "VERIFIED" && (
                  <DropdownMenuItem disabled>View details</DropdownMenuItem>
                )}
                {status === "PENDING_PARTS" && (
                  <>
                    <DropdownMenuItem onClick={() => onUpdateStatus(r.id, "REPORTED")}>
                      Reopen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(r)}>Edit</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      isPending,
      canViewCosts,
      canVerify,
      isManager,
      userId,
      onAssign,
      onSchedule,
      onStart,
      onComplete,
      onVerify,
      onAddParts,
      onEdit,
      onUpdateStatus,
      today,
    ],
  );

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        emptyMessage={emptyMessage ?? "No maintenance requests found."}
        pageSize={pageSize}
        hidePagination
        className="w-full"
      />

      {total > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {total} record{total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(1)} disabled={page <= 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
