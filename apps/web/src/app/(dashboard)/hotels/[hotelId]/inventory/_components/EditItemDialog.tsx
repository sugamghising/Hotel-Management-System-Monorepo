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
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryItem, useUpdateInventoryItem } from "@/lib/hooks/useInventory";
import type { InventoryCategory } from "@/lib/hooks/useInventory";

interface EditItemDialogProps {
  itemId: string | null;
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

export function EditItemDialog({ itemId, open, onClose }: EditItemDialogProps) {
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { mutate, isPending } = useUpdateInventoryItem();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("ROOM_SUPPLIES");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [parLevel, setParLevel] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [reorderQty, setReorderQty] = useState("");

  useEffect(() => {
    if (open && item) {
      setName(item.name);
      setDescription(item.description ?? "");
      setCategory(item.category);
      setUnitOfMeasure(item.unitOfMeasure);
      setParLevel(String(item.parLevel));
      setReorderPoint(String(item.reorderPoint));
      setReorderQty(String(item.reorderQty));
    }
  }, [open, item]);

  const reorderPointNum = Number(reorderPoint);
  const parLevelNum = Number(parLevel);
  const reorderTooHigh = reorderPointNum > parLevelNum;

  const handleSubmit = () => {
    if (!itemId || !name) return;
    mutate(
      {
        itemId,
        input: {
          name,
          description: description || null,
          category,
          unitOfMeasure,
          parLevel: parLevelNum || undefined,
          reorderPoint: reorderPointNum || undefined,
          reorderQty: Number(reorderQty) || undefined,
        },
      },
      { onSuccess: onClose },
    );
  };

  const isValid = !!name && !reorderTooHigh;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isLoading ? "Loading..." : `Edit — ${item?.name ?? ""}`}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !item ? (
          <p className="text-sm text-muted-foreground py-4">Item not found.</p>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-8" />
            </div>

            <div>
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as InventoryCategory)}>
                  <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Unit of Measure *</Label>
                <Input value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} className="mt-1 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium">Par Level</Label>
                <Input type="number" value={parLevel} onChange={(e) => setParLevel(e.target.value)} className="mt-1 h-8" />
              </div>
              <div>
                <Label className="text-xs font-medium">Reorder Point</Label>
                <Input type="number" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} className="mt-1 h-8" />
                {reorderTooHigh && <p className="text-[10px] text-red-500 mt-0.5">Must be ≤ par level</p>}
              </div>
              <div>
                <Label className="text-xs font-medium">Reorder Qty</Label>
                <Input type="number" value={reorderQty} onChange={(e) => setReorderQty(e.target.value)} className="mt-1 h-8" />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending || !item} onClick={handleSubmit}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
