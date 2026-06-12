"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventoryItems, usePhysicalCount } from "@/lib/hooks/useInventory";
import type { InventoryCategory } from "@/lib/hooks/useInventory";
import { cn } from "@/lib/utils";

interface PhysicalCountDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: InventoryCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "ROOM_SUPPLIES", label: "Room Supplies" },
  { value: "MINIBAR", label: "Minibar" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "FANDB", label: "F&B" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OFFICE", label: "Office" },
  { value: "UNIFORM", label: "Uniform" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OTHER", label: "Other" },
];

export function PhysicalCountDialog({ open, onClose }: PhysicalCountDialogProps) {
  const [category, setCategory] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [counts, setCounts] = useState<Record<string, { countedQty: number; notes: string }>>({});

  const filters = category ? { category: category as InventoryCategory } : {};
  const { data, isLoading } = useInventoryItems(loaded ? { ...filters, pageSize: 500 } : undefined);
  const { mutate, isPending } = usePhysicalCount();

  useEffect(() => {
    if (open) {
      setCategory("");
      setLoaded(false);
      setCounts({});
    }
  }, [open]);

  const handleLoad = () => {
    setLoaded(true);
    setCounts({});
  };

  useEffect(() => {
    if (data?.items && loaded) {
      setCounts((prev) => {
        const next = { ...prev };
        for (const item of data.items) {
          if (!(item.id in next)) {
            next[item.id] = { countedQty: item.currentStock, notes: "" };
          }
        }
        return next;
      });
    }
  }, [data, loaded]);

  const items = data?.items ?? [];
  const discrepancyCount = items.filter(
    (item) => (counts[item.id]?.countedQty ?? item.currentStock) !== item.currentStock,
  ).length;

  const totalVariance = items.reduce((sum, item) => {
    const counted = counts[item.id]?.countedQty ?? item.currentStock;
    return sum + (counted - item.currentStock) * item.avgUnitCost;
  }, 0);

  const handleSubmit = () => {
    const payload = {
      items: items.map((item) => ({
        itemId: item.id,
        countedQty: counts[item.id]?.countedQty ?? item.currentStock,
        notes: counts[item.id]?.notes || undefined,
      })),
    };
    mutate(payload, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Physical Inventory Count</DialogTitle>
          <DialogDescription>
            This will adjust stock levels to match your counted quantities and create adjustment
            transactions for all discrepancies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!loaded ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={handleLoad} disabled={isLoading}>
                Load Items
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Item</TableHead>
                      <TableHead className="text-xs w-20">System Qty</TableHead>
                      <TableHead className="text-xs w-24">Counted Qty</TableHead>
                      <TableHead className="text-xs w-20">Variance</TableHead>
                      <TableHead className="text-xs">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const counted = counts[item.id]?.countedQty ?? item.currentStock;
                      const variance = counted - item.currentStock;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <p className="text-xs font-medium">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
                          </TableCell>
                          <TableCell className="text-xs tabular-nums">{item.currentStock}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={counted}
                              onChange={(e) =>
                                setCounts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], countedQty: Number(e.target.value) },
                                }))
                              }
                              className="h-7 w-20 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "text-xs tabular-nums font-medium",
                                variance === 0
                                  ? "text-green-600"
                                  : variance < 0
                                    ? "text-red-600"
                                    : "text-blue-600",
                              )}
                            >
                              {variance > 0 ? "+" : ""}{variance}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={counts[item.id]?.notes ?? ""}
                              onChange={(e) =>
                                setCounts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], notes: e.target.value },
                                }))
                              }
                              className="h-7 text-xs"
                              placeholder="Optional..."
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{items.length} items</span>
                <span>{discrepancyCount} with discrepancies</span>
                <span className="font-mono">
                  Total variance: {totalVariance >= 0 ? "+" : ""}
                  {totalVariance.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          {loaded && (
            <Button size="sm" disabled={isPending || items.length === 0} onClick={handleSubmit}>
              {isPending ? "Recording..." : "Record Count"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
