"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useCommunicationStats } from "@/lib/hooks/useCommunications";
import { Skeleton } from "@/components/ui/skeleton";
import { subDays, formatISO } from "date-fns";

export function StatsBar() {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const dateTo = formatISO(new Date(), { representation: "date" });
  const dateFrom = formatISO(subDays(new Date(), 30), { representation: "date" });

  const { data: stats, isLoading } = useCommunicationStats(
    activeHotel?.id ?? null,
    dateFrom,
    dateTo,
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <StatChip label="Sent" value={stats?.totalSent ?? 0} className="text-gray-600 bg-gray-100" />
      <StatChip
        label="Delivered"
        value={`${stats?.delivered ?? 0} (${stats?.deliveryRate ?? 0}%)`}
        className="text-green-600 bg-green-100"
      />
      <StatChip
        label="Opened"
        value={`${stats?.opened ?? 0} (${stats?.openRate ?? 0}%)`}
        className="text-blue-600 bg-blue-100"
      />
      {(stats?.failed ?? 0) > 0 && (
        <StatChip
          label="Failed"
          value={stats?.failed ?? 0}
          className="text-red-600 bg-red-100"
        />
      )}
      <span className="text-xs text-muted-foreground ml-auto">Last 30 days</span>
    </div>
  );
}

function StatChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}: <span className="font-semibold">{value}</span>
    </span>
  );
}
