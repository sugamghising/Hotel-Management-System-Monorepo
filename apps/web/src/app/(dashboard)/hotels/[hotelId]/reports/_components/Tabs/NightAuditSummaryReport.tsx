"use client";

import { useMemo } from "react";
import { NightAuditSummary } from "@/lib/hooks/useReports";
import { SummaryStatCard } from "../Shared/SummaryStatCard";
import { BarChart } from "../Shared/BarChart";
import { ReportTable } from "../Shared/ReportTable";
import { EmptyReport } from "../Shared/EmptyReport";
import { ReportSkeleton } from "../Shared/ReportSkeleton";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  UserX,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

interface NightAuditSummaryReportTabProps {
  data: NightAuditSummary[] | undefined;
  isLoading: boolean;
  currencyCode: string;
}

const statusBadge = (hasAdjustments: boolean) => {
  if (hasAdjustments) {
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><AlertCircle className="h-3 w-3 mr-1" />Adjusted</Badge>;
  }
  return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
};

export function NightAuditSummaryReportTab({
  data,
  isLoading,
  currencyCode,
}: NightAuditSummaryReportTabProps) {
  const cfmt = (v: number) => formatCurrency(v, currencyCode);

  const totals = useMemo(() => {
    if (!data?.length) return null;
    return {
      roomRevenue: data.reduce((s, a) => s + a.totals.roomRevenue, 0),
      otherRevenue: data.reduce((s, a) => s + a.totals.otherRevenue, 0),
      paymentsReceived: data.reduce((s, a) => s + a.totals.paymentsReceived, 0),
      taxCollected: data.reduce((s, a) => s + a.totals.taxCollected, 0),
      adjustments: data.reduce((s, a) => s + a.totals.adjustments, 0),
      totalCharge: data.reduce((s, a) => s + a.totals.roomRevenue + a.totals.otherRevenue + a.totals.taxCollected, 0),
      noShows: data.reduce((s, a) => s + a.noShows, 0),
      checkIns: data.reduce((s, a) => s + a.checkIns, 0),
      checkOuts: data.reduce((s, a) => s + a.checkOuts, 0),
    };
  }, [data]);

  const barChartData = data?.map((a) => ({
    label: formatDate(a.businessDate, "MMM d"),
    value: a.totals.roomRevenue + a.totals.otherRevenue + a.totals.taxCollected,
    meta: `${a.inHouse} in-house`,
  })) ?? [];

  const columns: ColumnDef<NightAuditSummary>[] = [
    {
      header: "Business Date",
      accessorKey: "businessDate",
      cell: ({ row }) => formatDate(row.original.businessDate),
    },
    {
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.totals.adjustments !== 0),
    },
    {
      header: "Room Revenue",
      accessorKey: "totals.roomRevenue",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.totals.roomRevenue)}</span>,
    },
    {
      header: "Other Revenue",
      accessorKey: "totals.otherRevenue",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.totals.otherRevenue)}</span>,
    },
    {
      header: "Total Revenue",
      cell: ({ row }) => {
        const t = row.original.totals;
        const total = t.roomRevenue + t.otherRevenue + t.taxCollected;
        return <span className="tabular-nums font-semibold">{cfmt(total)}</span>;
      },
    },
    {
      header: "Payments",
      accessorKey: "totals.paymentsReceived",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.totals.paymentsReceived)}</span>,
    },
    {
      header: "No-Shows",
      accessorKey: "noShows",
      cell: ({ row }) => (
        <span className={cn("tabular-nums", row.original.noShows > 0 ? "text-red-500 font-medium" : "")}>
          {row.original.noShows}
        </span>
      ),
    },
    {
      header: "In House",
      accessorKey: "inHouse",
      cell: ({ row }) => row.original.inHouse,
    },
    {
      header: "Occupancy",
      accessorKey: "occupancyRate",
      cell: ({ row }) => `${row.original.occupancyRate.toFixed(1)}%`,
    },
  ];

  if (isLoading) return <ReportSkeleton />;
  if (!data || !data.length) return <EmptyReport />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryStatCard
          title="Total Room Revenue"
          value={totals ? cfmt(totals.roomRevenue) : "—"}
          subtitle={`Across ${data.length} audits`}
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
          highlight
        />
        <SummaryStatCard
          title="Total Other Revenue"
          value={totals ? cfmt(totals.otherRevenue) : "—"}
          subtitle={`Adjustments: ${totals ? cfmt(totals.adjustments) : "—"}`}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <SummaryStatCard
          title="Payments Received"
          value={totals ? cfmt(totals.paymentsReceived) : "—"}
          subtitle={`Tax collected: ${totals ? cfmt(totals.taxCollected) : "—"}`}
          icon={<CreditCard className="h-4 w-4 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <SummaryStatCard
          title="Charges Posted"
          value={totals ? cfmt(totals.totalCharge) : "—"}
          subtitle="Room + Other + Tax"
          icon={<FileText className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <SummaryStatCard
          title="No-Shows"
          value={totals?.noShows ?? 0}
          subtitle={`${totals?.checkIns ?? 0} check-ins, ${totals?.checkOuts ?? 0} check-outs`}
          icon={<UserX className="h-4 w-4 text-red-500" />}
          iconBg="bg-red-50"
        />
        <SummaryStatCard
          title="Audits Completed"
          value={data.length}
          subtitle={`${data.filter((a) => a.inHouse > 0).length} with active guests`}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

      {barChartData.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Revenue per Audit
          </h3>
          <BarChart
            data={barChartData}
            formatType="currency"
            currencyCode={currencyCode}
          />
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Audit History
        </h3>
        <ReportTable
          columns={columns as ColumnDef<any, any>[]}
          data={data}
        />
      </div>
    </div>
  );
}
