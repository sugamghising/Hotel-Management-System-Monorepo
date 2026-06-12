"use client";

import { ArrowUpDown, Eye, Minus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import type { InventoryItem } from "@/lib/hooks/useInventory";

const CATEGORY_LABELS: Record<string, string> = {
  ROOM_SUPPLIES: "Room Supplies",
  MINIBAR: "Minibar",
  CLEANING: "Cleaning",
  FANDB: "F&B",
  MAINTENANCE: "Maintenance",
  OFFICE: "Office",
  UNIFORM: "Uniform",
  MARKETING: "Marketing",
  OTHER: "Other",
};

interface ItemRowProps {
  item: InventoryItem;
  onAdjust: (itemId: string) => void;
  onConsume: (itemId: string) => void;
  onView: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  canAdjust: boolean;
  canConsume: boolean;
  canUpdate: boolean;
}

export function ItemRow({
  item,
  onAdjust,
  onConsume,
  onView,
  onEdit,
  canAdjust,
  canConsume,
  canUpdate,
}: ItemRowProps) {
  const stockPct =
    item.parLevel > 0
      ? Math.min((item.currentStock / item.parLevel) * 100, 100)
      : 0;

  const barColor =
    item.currentStock <= 0
      ? "bg-gray-200"
      : item.currentStock <= item.reorderPoint
        ? "bg-red-500"
        : item.currentStock < item.parLevel
          ? "bg-yellow-500"
          : "bg-green-500";

  const stockLabel =
    item.currentStock <= 0 ? (
      <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50 px-1 py-0">
        Out of stock
      </Badge>
    ) : item.currentStock <= item.reorderPoint ? (
      <span className="text-[10px] text-red-600 font-medium">⚠ Reorder now</span>
    ) : null;

  return (
    <tr
      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => onView(item.id)}
    >
      <td className="py-2.5 px-3">
        <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>
      </td>
      <td className="py-2.5 px-3">
        <div>
          <span className="text-sm font-medium">{item.name}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Badge variant="outline" className="text-[10px] text-muted-foreground px-1 py-0">
              {CATEGORY_LABELS[item.category] ?? item.category}
            </Badge>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 min-w-[140px]">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${stockPct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs tabular-nums">
            {item.currentStock} {item.unitOfMeasure} available
          </span>
          {stockLabel}
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span className="text-xs text-muted-foreground">
          Par: {item.parLevel} | Reorder: {item.reorderPoint}
        </span>
      </td>
      <td className="py-2.5 px-3">
        <span className="text-xs tabular-nums">{formatCurrency(item.avgUnitCost)}</span>
      </td>
      <td className="py-2.5 px-3">
        <span className="text-xs tabular-nums">
          {formatCurrency(item.currentStock * item.avgUnitCost)}
        </span>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          {canAdjust && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAdjust(item.id)}
              title="Adjust Stock"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </Button>
          )}
          {canConsume && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onConsume(item.id)}
              title="Record Consumption"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onView(item.id)}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(item.id)}
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
