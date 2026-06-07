"use client";

import { useMemo, useState, useEffect } from "react";
import { ADRReport as ADRReportType } from "@/lib/hooks/useReports";
import { SummaryStatCard } from "../Shared/SummaryStatCard";
import { BarChart } from "../Shared/BarChart";
import { ReportTable } from "../Shared/ReportTable";
import { EmptyReport } from "../Shared/EmptyReport";
import { ReportSkeleton } from "../Shared/ReportSkeleton";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { DollarSign, TrendingUp, Info, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ADRReportTabProps {
  data: ADRReportType | undefined;
  isLoading: boolean;
  currencyCode: string;
}

const CALLOUT_KEY = "adr-callout-dismissed";

export function ADRReportTab({ data, isLoading, currencyCode }: ADRReportTabProps) {
  const [calloutDismissed, setCalloutDismissed] = useState(true);

  useEffect(() => {
    setCalloutDismissed(localStorage.getItem(CALLOUT_KEY) === "1");
  }, []);

  const dismissCallout = () => {
    localStorage.setItem(CALLOUT_KEY, "1");
    setCalloutDismissed(true);
  };

  const cfmt = (v: number) => formatCurrency(v, currencyCode);

  const dailyStats = useMemo(() => {
    if (!data?.daily?.length) return null;
    const rates = data.daily.map((d) => d.adr);
    return {
      highest: Math.max(...rates),
      lowest: Math.min(...rates),
      average: rates.reduce((a, b) => a + b, 0) / rates.length,
    };
  }, [data]);

  const dailyChart = data?.daily?.map((d) => ({
    label: d.date.slice(5),
    value: d.adr,
    meta: cfmt(d.adr),
  })) ?? [];

  const columns: ColumnDef<{ roomTypeCode: string; roomTypeName: string; adr: number; revPar: number; roomNights: number }>[] = [
    {
      header: "Room Type",
      accessorKey: "roomTypeName",
    },
    {
      header: "ADR",
      accessorKey: "adr",
      cell: ({ row }) => <span className="tabular-nums font-semibold">{cfmt(row.original.adr)}</span>,
    },
    {
      header: "RevPAR",
      accessorKey: "revPar",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.revPar)}</span>,
    },
    {
      header: "Room Nights",
      accessorKey: "roomNights",
      cell: ({ row }) => row.original.roomNights.toLocaleString(),
    },
    {
      header: "vs Period Avg",
      cell: ({ row }) => {
        const avg = dailyStats?.average ?? row.original.adr;
        const diff = row.original.adr - avg;
        const pct = avg > 0 ? (diff / avg) * 100 : 0;
        return (
          <span className={cn("tabular-nums", diff >= 0 ? "text-emerald-600" : "text-red-500")}>
            {diff >= 0 ? "+" : ""}{pct.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  if (isLoading) return <ReportSkeleton />;
  if (!data) return <EmptyReport />;

  return (
    <div className="space-y-6">
      {!calloutDismissed && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm flex items-center justify-between w-full">
            <span>
              <strong>ADR</strong> (Average Daily Rate) measures the average revenue earned per
              occupied room. It is calculated as total room revenue divided by rooms sold.
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-blue-600 hover:text-blue-800 -mr-1"
              onClick={dismissCallout}
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title="ADR"
          value={cfmt(data.adr)}
          subtitle={`Period: ${data.period}`}
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
          highlight
        />
        <SummaryStatCard
          title="Highest Rate"
          value={dailyStats ? cfmt(dailyStats.highest) : "—"}
          subtitle="Peak daily ADR"
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <SummaryStatCard
          title="Lowest Rate"
          value={dailyStats ? cfmt(dailyStats.lowest) : "—"}
          subtitle="Lowest daily ADR"
          icon={<TrendingUp className="h-4 w-4 text-red-500" />}
          iconBg="bg-red-50"
        />
        <SummaryStatCard
          title="Average Rate"
          value={dailyStats ? cfmt(dailyStats.average) : "—"}
          subtitle={`Across ${data.daily.length} days`}
          icon={<Home className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Daily ADR Trend
        </h3>
        <BarChart
          data={dailyChart}
          formatType="currency"
          currencyCode={currencyCode}
        />
      </div>

      {data.byRoomType.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            By Room Type
          </h3>
          <ReportTable columns={columns as ColumnDef<any, any>[]} data={data.byRoomType} />
        </div>
      )}
    </div>
  );
}
