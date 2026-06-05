"use client";

import { useEffect, useState, useMemo } from "react";
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
import { useAddMaintenanceParts } from "@/lib/hooks/useMaintenanceRequests";
import { formatCurrency } from "@/lib/utils/formatters";
import { X } from "lucide-react";
import type { MaintenancePart } from "@/lib/hooks/useMaintenanceRequests";

interface AddPartsDialogProps {
  requestId: string;
  open: boolean;
  onClose: () => void;
  currency?: string;
}

export function AddPartsDialog({ requestId, open, onClose, currency = "USD" }: AddPartsDialogProps) {
  const { mutate, isPending } = useAddMaintenanceParts();
  const [parts, setParts] = useState<MaintenancePart[]>([
    { partName: "", quantity: 1, unitCost: 0 },
  ]);

  useEffect(() => {
    if (open) {
      setParts([{ partName: "", quantity: 1, unitCost: 0 }]);
    }
  }, [open]);

  const partsTotal = useMemo(
    () => parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0),
    [parts],
  );

  const addPart = () => {
    setParts([...parts, { partName: "", quantity: 1, unitCost: 0 }]);
  };

  const removePart = (index: number) => {
    if (parts.length <= 1) return;
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof MaintenancePart, value: string | number) => {
    const updated = [...parts];
    (updated[index] as any)[field] = value;
    setParts(updated);
  };

  const handleAdd = () => {
    const validParts = parts.filter((p) => p.partName.trim());
    if (validParts.length === 0) return;
    mutate(
      { id: requestId, parts: validParts },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Parts</DialogTitle>
          <DialogDescription>
            Log parts used for this maintenance request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {parts.map((part, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Part name"
                  value={part.partName}
                  onChange={(e) => updatePart(i, "partName", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-16 space-y-1">
                <Input
                  type="number"
                  placeholder="Qty"
                  min={1}
                  value={part.quantity || ""}
                  onChange={(e) => updatePart(i, "quantity", Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-24 space-y-1">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min={0}
                    step="0.01"
                    className="h-8 text-sm pl-5"
                    value={part.unitCost || ""}
                    onChange={(e) => updatePart(i, "unitCost", Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 mt-0"
                onClick={() => removePart(i)}
                disabled={parts.length <= 1}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="link" size="sm" onClick={addPart} className="h-auto px-0">
            + Add another part
          </Button>

          {partsTotal > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              Parts total: {formatCurrency(partsTotal, currency)}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={isPending}>
            {isPending ? "Adding..." : "Add Parts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
