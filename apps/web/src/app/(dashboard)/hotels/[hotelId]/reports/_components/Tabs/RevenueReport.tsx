"use client";

import { useMemo } from "react";
import { RevenueReport as RevenueReportType } from "@/lib/hooks/useReports";
import { SummaryStatCard } from "../Shared/SummaryStatCard";
import { BarChart } from "../Shared/BarChart";
import { ReportTable } from "../Shared/ReportTable";
import { EmptyReport } from "../Shared/EmptyReport";
import { ReportSkeleton } from "../Shared/ReportSkeleton";
import { formatCurrency } from "@/lib/utils/formatters";
import { DollarSign, TrendingUp, Utensils, Banknote, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

interface RevenueReportTabProps {
  data: RevenueReportType | undefined;
  isLoading: boolean;
  currencyCode: string;
}

export function RevenueReportTab({ data, isLoading, currencyCode }: RevenueReportTabProps) {
  const netRevenue = useMemo(() => {
    if (!data) return 0;
    return data.totalRevenue - data.taxTotal;
  }, [data]);

  const cfmt = (v: number) => formatCurrency(v, currencyCode);

  const revenueSplit = useMemo(() => {
    if (!data || !data.totalRevenue) return null;
    const total = data.totalRevenue;
    return {
      room: (data.roomRevenue / total) * 100,
      fnb: (data.fnbRevenue / total) * 100,
      other: (data.otherRevenue / total) * 100,
    };
  }, [data]);

  const dailyChart = data?.daily?.map((d) => ({
    label: d.date.slice(5),
    value: d.totalRevenue,
    meta: `Rm: ${cfmt(d.roomRevenue)}`,
  })) ?? [];

  const columns: ColumnDef<{ date: string; roomRevenue: number; fnbRevenue: number; otherRevenue: number; totalRevenue: number }>[] = [
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => row.original.date,
    },
    {
      header: "Room Revenue",
      accessorKey: "roomRevenue",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.roomRevenue)}</span>,
    },
    {
      header: "F&B Revenue",
      accessorKey: "fnbRevenue",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.fnbRevenue)}</span>,
    },
    {
      header: "Other Revenue",
      accessorKey: "otherRevenue",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.otherRevenue)}</span>,
    },
    {
      header: "Total Revenue",
      accessorKey: "totalRevenue",
      cell: ({ row }) => <span className="tabular-nums font-semibold">{cfmt(row.original.totalRevenue)}</span>,
    },
  ];

  if (isLoading) return <ReportSkeleton />;
  if (!data) return <EmptyReport />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title="Total Revenue"
          value={cfmt(data.totalRevenue)}
          subtitle={`Period: ${data.period}`}
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          highlight
        />
        <SummaryStatCard
          title="Room Revenue"
          value={cfmt(data.roomRevenue)}
          subtitle={`${revenueSplit ? revenueSplit.room.toFixed(0) : "—"}% of total`}
          icon={<Wallet className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <SummaryStatCard
          title="F&B Revenue"
          value={cfmt(data.fnbRevenue)}
          subtitle={`${revenueSplit ? revenueSplit.fnb.toFixed(0) : "—"}% of total`}
          icon={<Utensils className="h-4 w-4 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <SummaryStatCard
          title="Net Revenue"
          value={cfmt(netRevenue)}
          subtitle={`After tax (${cfmt(data.taxTotal)} tax)`}
          icon={<Banknote className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      {revenueSplit && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Revenue Split
          </h3>
          <div className="flex h-6 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${revenueSplit.room}%` }}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${revenueSplit.fnb}%` }}
            />
            <div
              className="bg-gray-400 transition-all"
              style={{ width: `${revenueSplit.other}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Room ({revenueSplit.room.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>F&B ({revenueSplit.fnb.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Other ({revenueSplit.other.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Daily Revenue Trend
        </h3>
        <BarChart
          data={dailyChart}
          formatType="currency"
          currencyCode={currencyCode}
        />
      </div>

      {data.daily.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Daily Breakdown
          </h3>
          <ReportTable columns={columns as ColumnDef<any, any>[]} data={data.daily} />
        </div>
      )}
    </div>
  );
}
