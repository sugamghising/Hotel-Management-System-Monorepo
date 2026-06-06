"use client";

import { useMemo } from "react";
import { OccupancyReport as OccupancyReportType } from "@/lib/hooks/useReports";
import { SummaryStatCard } from "../Shared/SummaryStatCard";
import { BarChart } from "../Shared/BarChart";
import { ReportTable } from "../Shared/ReportTable";
import { EmptyReport } from "../Shared/EmptyReport";
import { ReportSkeleton } from "../Shared/ReportSkeleton";
import { formatPercent } from "@/lib/utils/formatters";
import { BedDouble, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";

interface OccupancyReportTabProps {
  data: OccupancyReportType | undefined;
  isLoading: boolean;
}

export function OccupancyReportTab({ data, isLoading }: OccupancyReportTabProps) {
  const peakDay = useMemo(() => {
    if (!data?.daily?.length) return null;
    return data.daily.reduce((a, b) => (a.rate > b.rate ? a : b));
  }, [data]);

  const lowestDay = useMemo(() => {
    if (!data?.daily?.length) return null;
    return data.daily.reduce((a, b) => (a.rate < b.rate ? a : b));
  }, [data]);

  const avgRate = data?.occupancyRate ?? 0;
  const colorClass =
    avgRate >= 80
      ? "text-emerald-600"
      : avgRate >= 60
        ? "text-amber-600"
        : "text-red-500";

  const dailyChart = data?.daily?.map((d) => ({
    label: d.date.slice(5),
    value: d.rate,
    meta: `${d.occupied}/${d.total} rooms`,
  })) ?? [];

  const byRoomType = data?.byRoomType ?? [];

  const columns: ColumnDef<(typeof byRoomType)[number]>[] = [
    {
      header: "Room Type",
      accessorKey: "roomTypeName",
    },
    {
      header: "Code",
      accessorKey: "roomTypeCode",
    },
    {
      header: "Total Rooms",
      accessorKey: "total",
      cell: ({ row }) => row.original.total.toLocaleString(),
    },
    {
      header: "Occupied",
      accessorKey: "occupied",
      cell: ({ row }) => row.original.occupied.toLocaleString(),
    },
    {
      header: "Occupancy %",
      accessorKey: "occupancyRate",
      cell: ({ row }) => {
        const rate = row.original.occupancyRate;
        const cls = rate >= 80
          ? "text-emerald-600 font-semibold"
          : rate >= 60
            ? "text-amber-600 font-semibold"
            : "text-red-500 font-semibold";
        return <span className={cn(cls, "tabular-nums")}>{formatPercent(rate)}</span>;
      },
    },
  ];

  if (isLoading) return <ReportSkeleton />;
  if (!data) return <EmptyReport />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title="Average Occupancy"
          value={<span className={cn(colorClass)}>{formatPercent(avgRate)}</span>}
          subtitle={`${data.occupiedRooms} of ${data.totalRooms} rooms`}
          icon={<BedDouble className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
          highlight
        />
        <SummaryStatCard
          title="Room Nights Sold"
          value={data.occupiedRooms.toLocaleString()}
          subtitle={`Period: ${data.period}`}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <SummaryStatCard
          title="Peak Day"
          value={peakDay ? formatPercent(peakDay.rate) : "—"}
          subtitle={peakDay ? `${peakDay.date} (${peakDay.occupied} rooms)` : ""}
          icon={<ArrowUpRight className="h-4 w-4 text-orange-600" />}
          iconBg="bg-orange-50"
        />
        <SummaryStatCard
          title="Lowest Day"
          value={lowestDay ? formatPercent(lowestDay.rate) : "—"}
          subtitle={lowestDay ? `${lowestDay.date} (${lowestDay.occupied} rooms)` : ""}
          icon={<Calendar className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Daily Occupancy Rate
        </h3>
        <BarChart
          data={dailyChart}
          maxValue={100}
          referenceLine={80}
          referenceLabel="Target 80%"
          formatType="percent"
        />
      </div>

      {byRoomType.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            By Room Type
          </h3>
          <ReportTable
            columns={columns as ColumnDef<any, any>[]}
            data={byRoomType}
          />
        </div>
      )}
    </div>
  );
}
