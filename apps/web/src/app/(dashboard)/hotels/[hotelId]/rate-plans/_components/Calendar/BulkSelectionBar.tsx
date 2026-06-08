"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BulkSelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  onSetOverride: () => void;
  onSetStopSell: () => void;
  onClearOverrides: () => void;
}

export function BulkSelectionBar({
  selectedCount,
  onClear,
  onSetOverride,
  onSetStopSell,
  onClearOverrides,
}: BulkSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-0 bg-white border-t shadow-md z-10 px-4 py-2.5 flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        {selectedCount} {selectedCount === 1 ? "date" : "dates"} selected
      </span>

      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClear}>
        <X className="h-3 w-3 mr-1" />
        Clear
      </Button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" className="h-7 text-xs" onClick={onSetOverride}>
          Set Override
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={onSetStopSell}
        >
          Stop Sell
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-red-600"
          onClick={onClearOverrides}
        >
          Clear Overrides
        </Button>
      </div>
    </div>
  );
}
