"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLowStockItems } from "@/lib/hooks/useInventory";

const STORAGE_KEY = "hms-low-stock-dismissed";

interface LowStockBannerProps {
  onViewAll: () => void;
}

export function LowStockBanner({ onViewAll }: LowStockBannerProps) {
  const { data, isLoading } = useLowStockItems();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  });

  if (isLoading || !data || dismissed) return null;

  const items = data.items ?? [];
  if (items.length === 0) return null;

  const visible = items.slice(0, 5);
  const remaining = items.length - 5;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-yellow-800">
          {items.length} {items.length === 1 ? "item is" : "items are"} below reorder point
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {visible.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 cursor-pointer hover:bg-yellow-200"
              onClick={onViewAll}
            >
              {item.name}: {item.currentStock} {item.unitOfMeasure} (reorder at {item.reorderPoint})
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-600">
              +{remaining} more
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-yellow-700 hover:text-yellow-900 underline mt-1"
        >
          View all low-stock items →
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-yellow-500 hover:text-yellow-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
