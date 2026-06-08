"use client";

import { useState } from "react";
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
import { useAuthStore } from "@/stores/auth.store";
import { useAddPOSItem } from "@/lib/hooks/usePOS";

interface AddMenuItemDialogProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function AddMenuItemDialog({ orderId, open, onClose }: AddMenuItemDialogProps) {
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");
  const { mutate: addItem, isPending } = useAddPOSItem();

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [modifications, setModifications] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleSubmit = () => {
    if (!itemName || !price) return;
    addItem(
      {
        orderId,
        itemName,
        quantity: Number(quantity) || 1,
        unitPrice: Number(price),
        modifications: modifications || undefined,
        specialInstructions: specialInstructions || undefined,
      },
      {
        onSuccess: () => {
          setItemName("");
          setPrice("");
          setQuantity("1");
          setModifications("");
          setSpecialInstructions("");
          onClose();
        },
      },
    );
  };

  const isValid = itemName && price && Number(price) > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Custom Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">Item Name *</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="e.g. Grilled Salmon"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Price * ({currencyCode})</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Modifications</Label>
            <Input
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="e.g. Well done, no onions"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Special Instructions</Label>
            <Input
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="e.g. Allergies, preferences"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Adding..." : "Add to Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
