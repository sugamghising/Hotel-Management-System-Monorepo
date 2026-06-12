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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInventoryItem, useAdjustStock } from "@/lib/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdjustStockDialogProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}

type AdjustmentMode = "add" | "remove" | "set";

const REASON_OPTIONS = [
  { value: "RECEIVED_DELIVERY", label: "Received delivery" },
  { value: "DAMAGE_LOSS", label: "Damage / Loss" },
  { value: "COUNTING_ERROR", label: "Counting error" },
  { value: "THEFT", label: "Theft" },
  { value: "SPOILAGE", label: "Spoilage" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "OPENING_BALANCE", label: "Opening balance" },
  { value: "OTHER", label: "Other" },
];

export function AdjustStockDialog({ itemId, open, onClose }: AdjustStockDialogProps) {
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { mutate, isPending } = useAdjustStock();

  const [mode, setMode] = useState<AdjustmentMode>("add");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (open && item) {
      setMode("add");
      setQuantity("");
      setUnitCost(item.lastUnitCost > 0 ? String(item.lastUnitCost) : "");
      setReason("");
      setNotes("");
      setBatchNumber("");
      setExpiryDate("");
    }
  }, [open, item]);

  const qty = Number(quantity) || 0;
  const calculated =
    mode === "set"
      ? qty
      : mode === "add"
        ? (item?.currentStock ?? 0) + qty
        : (item?.currentStock ?? 0) - qty;

  const isIncrease = calculated >= (item?.currentStock ?? 0);

  const handleSubmit = () => {
    if (!itemId || !quantity || !reason) return;
    const q = mode === "remove" ? -qty : mode === "set" ? qty - (item?.currentStock ?? 0) : qty;
    mutate(
      {
        itemId,
        input: {
          quantity: q,
          reason,
          unitCost: mode === "add" && unitCost ? Number(unitCost) : undefined,
          notes: notes || undefined,
          batchNumber: item?.trackBatches ? batchNumber || undefined : undefined,
          expiryDate: item?.trackExpiry ? expiryDate || undefined : undefined,
        },
      },
      { onSuccess: onClose },
    );
  };

  const isValid = !!reason && (mode === "set" ? Number(quantity) >= 0 : !!quantity && Number(quantity) > 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? "Loading..." : `Adjust Stock — ${item?.name ?? ""}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !item ? (
          <p className="text-sm text-muted-foreground py-4">Item not found.</p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-semibold tabular-nums">
                {item.currentStock} {item.unitOfMeasure}
              </p>
            </div>

            <div>
              <Label className="text-xs font-medium">Adjustment Type</Label>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as AdjustmentMode)} className="flex gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add" className="text-xs cursor-pointer">Add Stock (+)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="remove" id="remove" />
                  <Label htmlFor="remove" className="text-xs cursor-pointer">Remove Stock (−)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="set" id="set" />
                  <Label htmlFor="set" className="text-xs cursor-pointer">Set Exact Count</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-xs font-medium">
                {mode === "set" ? "New Stock Count *" : "Quantity *"}
              </Label>
                <Input
                  type="number"
                  min={mode === "set" ? 0 : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 h-8"
                  placeholder={mode === "set" ? "Enter exact count..." : "Enter quantity..."}
                />
            </div>

            {mode === "add" && (
              <div>
                <Label className="text-xs font-medium">Unit Cost</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="mt-1 h-8"
                  placeholder="Used to recalculate average cost"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium">Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {item.trackBatches && (
              <div>
                <Label className="text-xs font-medium">Batch Number</Label>
                <Input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="mt-1 h-8"
                  placeholder="Optional batch number..."
                />
              </div>
            )}

            {item.trackExpiry && (
              <div>
                <Label className="text-xs font-medium">Expiry Date</Label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1 h-8"
                />
              </div>
            )}

            {Number(quantity) > 0 && (
              <div className="rounded-md bg-muted p-2 text-center">
                <span className="text-xs text-muted-foreground">New stock level: </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    isIncrease ? "text-green-600" : "text-red-600",
                  )}
                >
                  {calculated} {item.unitOfMeasure}
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending || !item} onClick={handleSubmit}>
            {isPending ? "Saving..." : "Save Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
