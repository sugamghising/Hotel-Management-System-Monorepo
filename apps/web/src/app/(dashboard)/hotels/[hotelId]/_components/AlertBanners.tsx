"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertBannersProps {
  outOfOrder: number | undefined;
  vacantDirty: number | undefined;
  isLoading: boolean;
}

export function AlertBanners({
  outOfOrder,
  vacantDirty,
  isLoading,
}: AlertBannersProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  const toggleDismiss = (key: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {outOfOrder !== undefined && outOfOrder > 0 && !dismissed.has("ooo") && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {outOfOrder} {outOfOrder === 1 ? "room is" : "rooms are"}{" "}
              currently out of order
            </span>
          </div>
          <button
            onClick={() => toggleDismiss("ooo")}
            className="shrink-0 rounded p-0.5 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {vacantDirty !== undefined && vacantDirty > 5 && !dismissed.has("cleaning") && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {vacantDirty} {vacantDirty === 1 ? "room needs" : "rooms need"}{" "}
              cleaning
            </span>
          </div>
          <button
            onClick={() => toggleDismiss("cleaning")}
            className="shrink-0 rounded p-0.5 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
