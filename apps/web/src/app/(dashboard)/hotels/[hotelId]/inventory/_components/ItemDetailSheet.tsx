"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useInventoryItem, useItemTransactions } from "@/lib/hooks/useInventory";
import type { InventoryTransaction } from "@/lib/hooks/useInventory";

interface ItemDetailSheetProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
  onAdjust: (itemId: string) => void;
  onConsume: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  canAdjust: boolean;
  canConsume: boolean;
  canUpdate: boolean;
}

const TX_TYPE_STYLES: Record<string, string> = {
  PURCHASE: "bg-green-100 text-green-800",
  CONSUMPTION: "bg-red-100 text-red-800",
  ADJUSTMENT: "bg-blue-100 text-blue-800",
  WASTE: "bg-orange-100 text-orange-800",
  RETURN: "bg-purple-100 text-purple-800",
  TRANSFER: "bg-cyan-100 text-cyan-800",
  OPENING: "bg-gray-100 text-gray-800",
};

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

function TransactionRow({ tx }: { tx: InventoryTransaction }) {
  const isIn = tx.quantity > 0;
  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1 py-0 shrink-0", TX_TYPE_STYLES[tx.type] ?? "")}
        >
          {tx.type}
        </Badge>
        <span className={cn("tabular-nums font-medium", isIn ? "text-green-600" : "text-red-600")}>
          {isIn ? "+" : ""}{tx.quantity}
        </span>
        <span className="text-muted-foreground truncate">{tx.performedByName}</span>
      </div>
      <span className="text-muted-foreground shrink-0 ml-2">{formatDate(tx.performedAt, "MMM d, HH:mm")}</span>
    </div>
  );
}

export function ItemDetailSheet({
  itemId,
  open,
  onClose,
  onAdjust,
  onConsume,
  onEdit,
  canAdjust,
  canConsume,
  canUpdate,
}: ItemDetailSheetProps) {
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { data: txData, isLoading: txLoading } = useItemTransactions(itemId);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (open) setTab("overview");
  }, [open]);

  const stockPct =
    item && item.parLevel > 0
      ? Math.min((item.currentStock / item.parLevel) * 100, 100)
      : 0;
  const barColor =
    !item || item.currentStock <= 0
      ? "bg-gray-200"
      : item.currentStock <= item.reorderPoint
        ? "bg-red-500"
        : item.currentStock < item.parLevel
          ? "bg-yellow-500"
          : "bg-green-500";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[520px] max-w-full">
        <SheetHeader>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : item ? (
            <>
              <SheetTitle className="text-left">{item.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </Badge>
              </div>
            </>
          ) : null}
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !item ? (
          <p className="text-sm text-muted-foreground mt-6">Item not found.</p>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-3">Stock</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-semibold tabular-nums">{item.currentStock}</span>
                  <span className="text-sm text-muted-foreground">{item.unitOfMeasure}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className={cn("h-full rounded-full", barColor)} style={{ width: `${stockPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Available: {item.availableStock}</span>
                  <span>Reserved: {item.reservedStock}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-3">Cost</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Avg. unit cost</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(item.avgUnitCost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last unit cost</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(item.lastUnitCost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total value</p>
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(item.currentStock * item.avgUnitCost)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-3">Reorder Levels</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Par Level</p>
                    <p className="font-semibold tabular-nums">{item.parLevel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reorder Point</p>
                    <p className="font-semibold tabular-nums">{item.reorderPoint}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reorder Qty</p>
                    <p className="font-semibold tabular-nums">{item.reorderQty}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canAdjust && (
                  <Button size="sm" variant="outline" onClick={() => { onAdjust(item.id); onClose(); }}>
                    Adjust Stock
                  </Button>
                )}
                {canConsume && (
                  <Button size="sm" variant="outline" onClick={() => { onConsume(item.id); onClose(); }}>
                    Record Consumption
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => { onEdit(item.id); onClose(); }}>
                  Edit Item
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              {txLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : !txData || txData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions found.</p>
              ) : (
                <div className="space-y-0">
                  {txData.slice(0, 20).map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{CATEGORY_LABELS[item.category] ?? item.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit of Measure</p>
                  <p className="font-medium">{item.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Track Expiry</p>
                  <p className="font-medium">{item.trackExpiry ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Track Batches</p>
                  <p className="font-medium">{item.trackBatches ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active</p>
                  <p className="font-medium">{item.isActive ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(item.createdAt)}</p>
                </div>
              </div>
              {canUpdate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => { onEdit(item.id); onClose(); }}
                >
                  Edit Item
                </Button>
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
