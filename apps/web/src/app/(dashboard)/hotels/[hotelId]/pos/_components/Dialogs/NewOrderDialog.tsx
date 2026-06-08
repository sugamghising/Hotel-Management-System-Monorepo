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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCreatePOSOrder, usePOSOutlets } from "@/lib/hooks/usePOS";

interface NewOrderDialogProps {
  open: boolean;
  onClose: () => void;
  defaultOutlet?: string;
  onOrderCreated: (orderId: string) => void;
}

export function NewOrderDialog({
  open,
  onClose,
  defaultOutlet,
  onOrderCreated,
}: NewOrderDialogProps) {
  const { data: outletsData } = usePOSOutlets();
  const { mutate: createOrder, isPending } = useCreatePOSOrder();

  const outlets = outletsData?.outlets ?? [];
  const [outlet, setOutlet] = useState(defaultOutlet ?? "");
  const [tableNumber, setTableNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const handleSubmit = () => {
    createOrder(
      {
        outlet,
        tableNumber: tableNumber || undefined,
        roomNumber: roomNumber || undefined,
      },
      {
        onSuccess: (data) => {
          setOutlet("");
          setTableNumber("");
          setRoomNumber("");
          onOrderCreated(data.id);
          onClose();
        },
      },
    );
  };

  const isValid = outlet;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">Outlet *</Label>
            <Select value={outlet} onValueChange={setOutlet}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder="Select outlet" />
              </SelectTrigger>
              <SelectContent>
                {outlets.length === 1 ? (
                  <SelectItem value={outlets[0].name}>{outlets[0].name}</SelectItem>
                ) : (
                  outlets.map((o) => (
                    <SelectItem key={o.id} value={o.name}>
                      {o.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {outlets.length === 1 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Only one outlet available
              </p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium">Table Number</Label>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="e.g. 12, Bar Stool 3"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Room Number</Label>
            <Input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="e.g. 204"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              For room service orders
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Opening..." : "Open Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
