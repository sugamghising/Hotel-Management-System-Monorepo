"use client";

import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface ReportTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReportTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data for selected period.",
}: ReportTableProps<TData>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      searchable={false}
      pageSize={50}
      hidePagination={false}
    />
  );
}
