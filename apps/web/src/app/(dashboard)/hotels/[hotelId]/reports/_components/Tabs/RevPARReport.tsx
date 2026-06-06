"use client";

import { useMemo } from "react";
import { ADRReport as ADRReportType } from "@/lib/hooks/useReports";
import { SummaryStatCard } from "../Shared/SummaryStatCard";
import { BarChart } from "../Shared/BarChart";
import { ReportTable } from "../Shared/ReportTable";
import { EmptyReport } from "../Shared/EmptyReport";
import { ReportSkeleton } from "../Shared/ReportSkeleton";
import { formatCurrency } from "@/lib/utils/formatters";
import { DollarSign, TrendingUp, BedDouble, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { cn as classNames } from "@/lib/utils";

interface RevPARReportTabProps {
  data: ADRReportType | undefined;
  isLoading: boolean;
  currencyCode: string;
}

export function RevPARReportTab({ data, isLoading, currencyCode }: RevPARReportTabProps) {
  const cfmt = (v: number) => formatCurrency(v, currencyCode);

  const dailyChart = data?.daily?.map((d) => ({
    label: d.date.slice(5),
    value: d.revPar,
    meta: cfmt(d.revPar),
  })) ?? [];

  const occupancyChart = data?.daily?.map((d) => ({
    label: d.date.slice(5),
    value: d.roomNights > 0 ? (d.adr > 0 ? d.revPar / d.adr * 100 : 0) : 0,
    meta: `${((d.roomNights > 0 ? d.revPar / d.adr * 100 : 0)).toFixed(1)}%`,
  })) ?? [];

  const avgOccupancy = useMemo(() => {
    if (!data?.daily?.length) return 0;
    const total = data.daily.reduce((s, d) => s + (d.roomNights > 0 ? d.revPar / d.adr : 0), 0);
    return (total / data.daily.length) * 100;
  }, [data]);

  const columns: ColumnDef<{ roomTypeCode: string; roomTypeName: string; adr: number; revPar: number; roomNights: number }>[] = [
    {
      header: "Room Type",
      accessorKey: "roomTypeName",
    },
    {
      header: "ADR",
      accessorKey: "adr",
      cell: ({ row }) => <span className="tabular-nums">{cfmt(row.original.adr)}</span>,
    },
    {
      header: "RevPAR",
      accessorKey: "revPar",
      cell: ({ row }) => <span className="tabular-nums font-semibold">{cfmt(row.original.revPar)}</span>,
    },
    {
      header: "Room Nights",
      accessorKey: "roomNights",
      cell: ({ row }) => row.original.roomNights.toLocaleString(),
    },
    {
      header: "Formula",
      cell: ({ row }) => {
        const calc = row.original.adr > 0
          ? (row.original.revPar / row.original.adr) * 100
          : 0;
        return (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {cfmt(row.original.adr)} × {calc.toFixed(0)}%
          </span>
        );
      },
    },
  ];

  if (isLoading) return <ReportSkeleton />;
  if (!data) return <EmptyReport />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title="RevPAR"
          value={cfmt(data.revPar)}
          subtitle={`Period: ${data.period}`}
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
          highlight
        />
        <SummaryStatCard
          title="ADR"
          value={cfmt(data.adr)}
          subtitle="Average Daily Rate"
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <SummaryStatCard
          title="Avg Occupancy"
          value={`${avgOccupancy.toFixed(1)}%`}
          subtitle="Calculated from RevPAR / ADR"
          icon={<BedDouble className="h-4 w-4 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <SummaryStatCard
          title="Total Room Revenue"
          value={cfmt(data.totalRoomRevenue)}
          subtitle={`${data.totalRoomNights} room nights`}
          icon={<DollarSign className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <Calculator className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>RevPAR</strong> = Total Room Revenue ÷ Available Rooms
            </p>
            <p>
              Alternatively: <strong>RevPAR</strong> = ADR × Occupancy Rate
            </p>
            <p className="text-xs">
              Current: {cfmt(data.adr)} × {avgOccupancy.toFixed(1)}% ={" "}
              <strong className="text-foreground">{cfmt(data.revPar)}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Daily RevPAR
          </h3>
          <BarChart
            data={dailyChart}
            formatType="currency"
            currencyCode={currencyCode}
          />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Daily Occupancy %
          </h3>
          <BarChart
            data={occupancyChart}
            maxValue={100}
            formatType="percent"
          />
        </div>
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
