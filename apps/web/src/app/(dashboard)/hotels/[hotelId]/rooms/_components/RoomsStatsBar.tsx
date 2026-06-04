"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RoomsStatsBarProps {
  stats: {
    total: number;
    vacantClean: number;
    vacantDirty: number;
    occupied: number;
    outOfOrder: number;
  } | undefined;
  isLoading: boolean;
  activeStatus: string | null;
  onStatusClick: (status: string | null) => void;
}

const chips = [
  { label: "Vacant Clean", status: "VACANT_CLEAN", color: "bg-green-500", activeBg: "bg-green-500 text-white" },
  { label: "Vacant Dirty", status: "VACANT_DIRTY", color: "bg-yellow-500", activeBg: "bg-yellow-500 text-white" },
  { label: "Occupied", status: "OCCUPIED", color: "bg-blue-500", activeBg: "bg-blue-500 text-white" },
  { label: "Out of Order", status: "OUT_OF_ORDER", color: "bg-red-500", activeBg: "bg-red-500 text-white" },
  { label: "Total", status: null as string | null, color: "bg-gray-400", activeBg: "bg-gray-400 text-white" },
] as const;

export function RoomsStatsBar({ stats, isLoading, activeStatus, onStatusClick }: RoomsStatsBarProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto flex gap-2 pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  const getCount = (status: string | null): number => {
    if (!stats) return 0;
    switch (status) {
      case "VACANT_CLEAN": return stats.vacantClean;
      case "VACANT_DIRTY": return stats.vacantDirty;
      case "OCCUPIED": return stats.occupied;
      case "OUT_OF_ORDER": return stats.outOfOrder;
      default: return stats.total;
    }
  };

  return (
    <div className="overflow-x-auto flex gap-2 pb-1">
      {chips.map((chip) => {
        const isActive = activeStatus === chip.status;
        return (
          <button
            key={chip.label}
            onClick={() => onStatusClick(chip.status)}
            className={cn(
              "inline-flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? chip.activeBg
                : "border border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", chip.color)} />
            <span>{chip.label}</span>
            <span className="font-mono text-xs">{getCount(chip.status)}</span>
          </button>
        );
      })}
    </div>
  );
}
