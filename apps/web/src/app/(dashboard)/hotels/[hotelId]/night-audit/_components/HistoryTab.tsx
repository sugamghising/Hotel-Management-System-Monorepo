"use client";

import { useMemo } from "react";
import type { NightAuditStatus_ } from "@/lib/hooks/useNightAudits";
import { DataTable } from "@/components/tables/DataTable";
import { NightAuditBadge } from "@/components/status/StatusBadge";
import type { ColumnDef } from "@tanstack/react-table";

interface HistoryTabProps {
  history: NightAuditStatus_[];
  isLoading: boolean;
  canRollback: boolean;
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function HistoryTab({ history, isLoading }: HistoryTabProps) {
  const columns = useMemo<ColumnDef<NightAuditStatus_>[]>(
    () => [
      {
        accessorKey: "businessDate",
        header: "Date",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.businessDate}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <NightAuditBadge status={row.original.status} size="sm" />
        ),
      },
      {
        accessorKey: "roomRevenue",
        header: "Room Revenue",
        cell: ({ row }) => formatCurrency(row.original.roomRevenue),
      },
      {
        accessorKey: "startedAt",
        header: "Started",
        cell: ({ row }) => formatDateTime(row.original.startedAt),
      },
      {
        accessorKey: "completedAt",
        header: "Completed",
        cell: ({ row }) => formatDateTime(row.original.completedAt),
      },
      {
        accessorKey: "performedBy",
        header: "Performed By",
        cell: ({ row }) => row.original.performedBy ?? "—",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={history}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Search by date..."
      searchKey="businessDate"
      emptyMessage="No night audits have been run yet."
    />
  );
}
