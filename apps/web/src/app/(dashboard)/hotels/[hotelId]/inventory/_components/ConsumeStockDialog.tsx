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
import { useInventoryItem, useConsumeStock } from "@/lib/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsumeStockDialogProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}

const DEPARTMENT_OPTIONS = [
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "FNB", label: "F&B" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "FRONT_DESK", label: "Front Desk" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "SPA", label: "Spa" },
  { value: "ADMIN", label: "Admin" },
  { value: "OTHER", label: "Other" },
];

export function ConsumeStockDialog({ itemId, open, onClose }: ConsumeStockDialogProps) {
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { mutate, isPending } = useConsumeStock();

  const [quantity, setQuantity] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity("");
      setDepartment("");
      setNotes("");
    }
  }, [open]);

  const qty = Number(quantity) || 0;
  const remaining = (item?.currentStock ?? 0) - qty;
  const maxQtyError = qty > (item?.currentStock ?? 0);

  const handleSubmit = () => {
    if (!itemId || !quantity || !department || maxQtyError) return;
    mutate(
      {
        itemId,
        input: {
          quantity: qty,
          department,
          notes: notes || undefined,
        },
      },
      { onSuccess: onClose },
    );
  };

  const isValid = !!quantity && qty > 0 && !!department && !maxQtyError;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? "Loading..." : `Record Consumption — ${item?.name ?? ""}`}
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
              <p className="text-lg font-semibold tabular-nums">
                {item.currentStock} {item.unitOfMeasure}
              </p>
            </div>

            <div>
              <Label className="text-xs font-medium">Quantity Consumed *</Label>
              <Input
                type="number"
                min={1}
                max={item.currentStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 h-8"
                placeholder={`Max ${item.currentStock}`}
              />
              {maxQtyError && (
                <p className="text-[10px] text-red-500 mt-0.5">
                  Cannot consume more than current stock
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium">Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_OPTIONS.map((o) => (
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

            {qty > 0 && !maxQtyError && (
              <div className="rounded-md bg-muted p-2 text-center text-sm">
                <span className="text-muted-foreground">Remaining: </span>
                <span className="font-semibold tabular-nums">
                  {remaining} {item.unitOfMeasure}
                </span>
                {qty === item.currentStock && (
                  <p className="text-[10px] text-red-500 mt-1">This will consume all available stock</p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending || !item} onClick={handleSubmit}>
            {isPending ? "Recording..." : "Record Consumption"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
