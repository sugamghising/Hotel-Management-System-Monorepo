"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePurchaseOrder, useReceivePurchaseOrder } from "@/lib/hooks/useInventory";

interface ReceiveGoodsDialogProps {
  poId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiveGoodsDialog({ poId, open, onClose }: ReceiveGoodsDialogProps) {
  const { data: order, isLoading } = usePurchaseOrder(poId);
  const { mutate, isPending } = useReceivePurchaseOrder();

  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [unitCosts, setUnitCosts] = useState<Record<string, number>>({});
  const [batchNumbers, setBatchNumbers] = useState<Record<string, string>>({});
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && order) {
      setReceivedDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      const initialQtys: Record<string, number> = {};
      const initialCosts: Record<string, number> = {};
      const initialBatches: Record<string, string> = {};
      const initialExpiries: Record<string, string> = {};
      for (const item of order.items) {
        const remaining = item.quantity - item.receivedQty;
        if (remaining > 0) {
          initialQtys[item.id] = remaining;
          initialCosts[item.id] = item.unitPrice;
          initialBatches[item.id] = "";
          initialExpiries[item.id] = "";
        }
      }
      setQtys(initialQtys);
      setUnitCosts(initialCosts);
      setBatchNumbers(initialBatches);
      setExpiryDates(initialExpiries);
    }
  }, [open, order]);

  if (!poId) return null;

  const pendingItems = order?.items.filter((item) => item.quantity - item.receivedQty > 0) ?? [];
  const allReceived = pendingItems.every(
    (item) => (qtys[item.id] ?? 0) >= item.quantity - item.receivedQty,
  );

  const handleReceiveAll = () => {
    const all: Record<string, number> = {};
    for (const item of pendingItems) {
      all[item.id] = item.quantity - item.receivedQty;
    }
    setQtys(all);
  };

  const handleSubmit = () => {
    if (!poId) return;
    const items = pendingItems
      .filter((item) => (qtys[item.id] ?? 0) > 0)
      .map((item) => ({
        poItemId: item.id,
        receivedQty: qtys[item.id] ?? 0,
        unitCost: unitCosts[item.id] !== item.unitPrice ? unitCosts[item.id] : undefined,
        batchNumber: batchNumbers[item.id] || undefined,
        expiryDate: expiryDates[item.id] || undefined,
      }));
    if (items.length === 0) return;
    mutate(
      { poId, input: { receivedDate, items, notes: notes || undefined } },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? "Loading..." : `Receive Goods — ${order?.poNumber ?? ""}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !order ? (
          <p className="text-sm text-muted-foreground py-4">Order not found.</p>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Date Received *</Label>
              <Input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="mt-1 h-8 w-48"
              />
            </div>

            {pendingItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">All items have been fully received.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{pendingItems.length} items to receive</p>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleReceiveAll}>
                    Receive All
                  </Button>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="text-xs text-right">Ordered</TableHead>
                        <TableHead className="text-xs text-right">Prev. Received</TableHead>
                        <TableHead className="text-xs w-20">Receive Now</TableHead>
                        <TableHead className="text-xs w-20">Unit Cost</TableHead>
                        <TableHead className="text-xs w-20">Batch</TableHead>
                        <TableHead className="text-xs w-28">Expiry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingItems.map((item) => {
                        const remaining = item.quantity - item.receivedQty;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <p className="text-xs font-medium">{item.itemName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{item.itemSku}</p>
                            </TableCell>
                            <TableCell className="text-xs tabular-nums text-right">{item.quantity}</TableCell>
                            <TableCell className="text-xs tabular-nums text-right">{item.receivedQty}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={remaining}
                                value={qtys[item.id] ?? 0}
                                onChange={(e) =>
                                  setQtys((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                                }
                                className="h-7 w-16 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={unitCosts[item.id] ?? item.unitPrice}
                                onChange={(e) =>
                                  setUnitCosts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                                }
                                className="h-7 w-20 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={batchNumbers[item.id] ?? ""}
                                onChange={(e) =>
                                  setBatchNumbers((prev) => ({ ...prev, [item.id]: e.target.value }))
                                }
                                className="h-7 w-20 text-xs"
                                placeholder="—"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={expiryDates[item.id] ?? ""}
                                onChange={(e) =>
                                  setExpiryDates((prev) => ({ ...prev, [item.id]: e.target.value }))
                                }
                                className="h-7 w-28 text-xs"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-xs text-muted-foreground">
                  {allReceived
                    ? "This will close the purchase order."
                    : "This will create a PARTIALLY_RECEIVED status."}
                </p>
              </>
            )}

            <div>
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-sm"
                rows={2}
                placeholder="Optional notes..."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={isPending || !order || pendingItems.length === 0} onClick={handleSubmit}>
            {isPending ? "Processing..." : "Confirm Receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
