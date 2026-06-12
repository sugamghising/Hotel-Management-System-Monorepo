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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCreateInventoryItem } from "@/lib/hooks/useInventory";
import type { InventoryCategory } from "@/lib/hooks/useInventory";

interface CreateItemDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: InventoryCategory; label: string }[] = [
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

export function CreateItemDialog({ open, onClose }: CreateItemDialogProps) {
  const { mutate, isPending } = useCreateInventoryItem();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("ROOM_SUPPLIES");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [parLevel, setParLevel] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [reorderQty, setReorderQty] = useState("");
  const [avgUnitCost, setAvgUnitCost] = useState("");
  const [trackExpiry, setTrackExpiry] = useState(false);
  const [trackBatches, setTrackBatches] = useState(false);

  useEffect(() => {
    if (open) {
      setSku("");
      setName("");
      setDescription("");
      setCategory("ROOM_SUPPLIES");
      setUnitOfMeasure("");
      setParLevel("");
      setReorderPoint("");
      setReorderQty("");
      setAvgUnitCost("");
      setTrackExpiry(false);
      setTrackBatches(false);
    }
  }, [open]);

  const reorderPointNum = Number(reorderPoint);
  const parLevelNum = Number(parLevel);
  const reorderTooHigh = reorderPointNum > parLevelNum;

  const handleSubmit = () => {
    if (!sku || !name || !category || !unitOfMeasure || !parLevel || !reorderQty) return;
    mutate(
      {
        sku: sku.toUpperCase(),
        name,
        description: description || undefined,
        category,
        unitOfMeasure,
        parLevel: parLevelNum,
        reorderPoint: reorderPointNum,
        reorderQty: Number(reorderQty),
        avgUnitCost: avgUnitCost ? Number(avgUnitCost) : undefined,
        trackExpiry,
        trackBatches,
      },
      { onSuccess: onClose },
    );
  };

  const isValid =
    !!sku && !!name && !!category && !!unitOfMeasure && !!parLevel && !!reorderQty && !reorderTooHigh;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Inventory Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">SKU *</Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="mt-1 h-8 font-mono text-xs uppercase"
                placeholder="e.g. TOW-001"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-8"
                placeholder="Item name..."
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 text-sm"
              rows={2}
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as InventoryCategory)}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Unit of Measure *</Label>
              <Input
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                className="mt-1 h-8"
                placeholder="pcs, kg, L..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium">Par Level *</Label>
              <Input
                type="number"
                min={0}
                value={parLevel}
                onChange={(e) => setParLevel(e.target.value)}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Reorder Point *</Label>
              <Input
                type="number"
                min={0}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                className="mt-1 h-8"
              />
              {reorderTooHigh && (
                <p className="text-[10px] text-red-500 mt-0.5">Must be ≤ par level</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium">Reorder Qty *</Label>
              <Input
                type="number"
                min={1}
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                className="mt-1 h-8"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Starting Cost</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={avgUnitCost}
              onChange={(e) => setAvgUnitCost(e.target.value)}
              className="mt-1 h-8"
              placeholder="Optional..."
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={trackExpiry} onCheckedChange={setTrackExpiry} />
              <Label className="text-xs cursor-pointer">Track expiry dates</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={trackBatches} onCheckedChange={setTrackBatches} />
              <Label className="text-xs cursor-pointer">Track batch numbers</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
