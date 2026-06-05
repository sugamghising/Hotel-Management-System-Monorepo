"use client";

import { useState, useEffect } from "react";
import type { FolioItemType, PostChargeInput } from "@/lib/hooks/useFolio";
import { usePostCharge } from "@/lib/hooks/useFolio";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CHARGE_ITEM_TYPES: { value: FolioItemType; label: string }[] = [
  { value: "ROOM_CHARGE", label: "Room Charge" },
  { value: "TAX", label: "Tax" },
  { value: "SERVICE_CHARGE", label: "Service Charge" },
  { value: "POS_CHARGE", label: "POS Charge" },
  { value: "MINIBAR", label: "Minibar" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "SPA", label: "SPA" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "PHONE", label: "Phone" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "DISCOUNT", label: "Discount" },
  { value: "NO_SHOW_FEE", label: "No Show Fee" },
];

const DEPARTMENT_OPTIONS = [
  { value: "ROOMS", label: "Rooms" },
  { value: "FANDB", label: "F&B" },
  { value: "SPA", label: "Spa" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "PHONE", label: "Phone" },
  { value: "OTHER", label: "Other" },
];

interface PostChargeDialogProps {
  reservationId: string;
  open: boolean;
  onClose: () => void;
  defaultItemType?: FolioItemType;
}

export function PostChargeDialog({
  reservationId,
  open,
  onClose,
  defaultItemType,
}: PostChargeDialogProps) {
  const [itemType, setItemType] = useState<FolioItemType>(defaultItemType ?? "ROOM_CHARGE");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [amount, setAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [department, setDepartment] = useState("ROOMS");
  const [revenueCode, setRevenueCode] = useState("");
  const [source, setSource] = useState("");
  const [sourceRef, setSourceRef] = useState("");

  const postCharge = usePostCharge(reservationId);

  useEffect(() => {
    if (defaultItemType) {
      setItemType(defaultItemType);
    }
  }, [defaultItemType]);

  const updateFromQtyPrice = (q: number, p: number) => {
    setQuantity(q);
    setUnitPrice(p);
    setAmount(q * p);
  };

  const handleConfirm = () => {
    if (!description.trim()) return;
    postCharge.mutate(
      {
        itemType,
        description: description.trim(),
        amount,
        quantity,
        unitPrice,
        taxAmount,
        revenueCode: revenueCode || undefined,
        department: department || undefined,
        source: source || undefined,
        sourceRef: sourceRef || undefined,
      } as PostChargeInput,
      {
        onSuccess: () => {
          setItemType("ROOM_CHARGE");
          setDescription("");
          setQuantity(1);
          setUnitPrice(0);
          setAmount(0);
          setTaxAmount(0);
          setDepartment("ROOMS");
          setRevenueCode("");
          setSource("");
          setSourceRef("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setItemType("ROOM_CHARGE");
          setDescription("");
          setQuantity(1);
          setUnitPrice(0);
          setAmount(0);
          setTaxAmount(0);
          setDepartment("ROOMS");
          setRevenueCode("");
          setSource("");
          setSourceRef("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post Charge</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Item Type</Label>
            <Select
              value={itemType}
              onValueChange={(v) => setItemType(v as FolioItemType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARGE_ITEM_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) =>
                  updateFromQtyPrice(Number(e.target.value) || 0, unitPrice)
                }
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) =>
                  updateFromQtyPrice(quantity, Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Tax Amount</Label>
            <Input
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Revenue Code</Label>
            <Input
              value={revenueCode}
              onChange={(e) => setRevenueCode(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source</Label>
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div>
              <Label>Source Ref</Label>
              <Input
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!description.trim() || postCharge.isPending}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
