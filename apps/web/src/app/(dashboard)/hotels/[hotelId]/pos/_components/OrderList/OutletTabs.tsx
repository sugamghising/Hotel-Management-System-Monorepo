"use client";

import { usePOSOutlets } from "@/lib/hooks/usePOS";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface OutletTabsProps {
  activeOutlet: string;
  onOutletChange: (outlet: string) => void;
}

export function OutletTabs({ activeOutlet, onOutletChange }: OutletTabsProps) {
  const { data, isLoading } = usePOSOutlets();
  const outlets = data?.outlets ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-1 px-4 pt-3 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-md" />
        ))}
      </div>
    );
  }

  if (outlets.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" />
        No outlets configured for this hotel.
      </div>
    );
  }

  return (
    <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
      <button
        onClick={() => onOutletChange("")}
        className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
          activeOutlet === ""
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        All
      </button>
      {outlets.map((outlet) => (
        <button
          key={outlet.id}
          onClick={() => onOutletChange(outlet.name)}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeOutlet === outlet.name
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {outlet.name}
        </button>
      ))}
    </div>
  );
}
