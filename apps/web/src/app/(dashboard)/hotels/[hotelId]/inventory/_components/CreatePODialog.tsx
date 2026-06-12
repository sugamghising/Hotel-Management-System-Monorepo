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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVendors, useInventoryItems, useCreatePurchaseOrder, useSubmitPurchaseOrder } from "@/lib/hooks/useInventory";
import { formatCurrency } from "@/lib/utils/formatters";
import { X, Search } from "lucide-react";

interface CreatePODialogProps {
  open: boolean;
  onClose: () => void;
  defaultVendorId?: string;
}

interface POItemRow {
  itemId: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  unitPrice: number;
}

export function CreatePODialog({ open, onClose, defaultVendorId }: CreatePODialogProps) {
  const { data: vendorsData } = useVendors();
  const { data: itemsData } = useInventoryItems({ pageSize: 500 });
  const { mutate: createPO, isPending: creating } = useCreatePurchaseOrder();
  const { mutate: submitPO, isPending: submitting } = useSubmitPurchaseOrder();

  const vendors = vendorsData?.vendors ?? [];
  const allItems = itemsData?.items ?? [];

  const [step, setStep] = useState(1);
  const [vendorId, setVendorId] = useState(defaultVendorId ?? "");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [poItems, setPoItems] = useState<POItemRow[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");

  useEffect(() => {
    if (open) {
      setStep(1);
      setVendorId(defaultVendorId ?? "");
      setOrderDate(new Date().toISOString().split("T")[0]);
      setExpectedDelivery("");
      setNotes("");
      setPoItems([]);
      setItemSearch("");
      setTaxAmount("0");
      setShippingCost("0");
    }
  }, [open, defaultVendorId]);

  const filteredItems = allItems.filter(
    (i) =>
      i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.sku.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  const addItem = (itemId: string) => {
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;
    if (poItems.some((r) => r.itemId === itemId)) return;
    setPoItems((prev) => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        quantity: 1,
        unitPrice: item.lastUnitCost > 0 ? item.lastUnitCost : 0,
      },
    ]);
    setItemSearch("");
  };

  const removeItem = (itemId: string) => {
    setPoItems((prev) => prev.filter((r) => r.itemId !== itemId));
  };

  const updateItem = (itemId: string, field: "quantity" | "unitPrice", value: number) => {
    setPoItems((prev) =>
      prev.map((r) => (r.itemId === itemId ? { ...r, [field]: value } : r)),
    );
  };

  const subtotal = poItems.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);
  const tax = Number(taxAmount) || 0;
  const shipping = Number(shippingCost) || 0;
  const total = subtotal + tax + shipping;

  const handleCreate = (andSubmit: boolean) => {
    if (!vendorId || poItems.length === 0) return;
    const input = {
      vendorId,
      expectedDelivery: expectedDelivery || undefined,
      notes: notes || undefined,
      items: poItems.map((r) => ({
        itemId: r.itemId,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
      })),
    };
    createPO(input, {
      onSuccess: (data) => {
        if (andSubmit && data?.id) {
          submitPO(data.id, {
            onSuccess: onClose,
            onError: () => onClose(),
          });
        } else {
          onClose();
        }
      },
    });
  };

  const isPending = creating || submitting;
  const canProceed = !!vendorId && poItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "New Purchase Order — Vendor & Dates" : "New Purchase Order — Items"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {step === 1 ? (
            <>
              <div>
                <Label className="text-xs font-medium">Vendor *</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue placeholder="Select approved vendor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.filter((v) => v.isApproved).map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Order Date *</Label>
                  <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="mt-1 h-8" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Expected Delivery</Label>
                  <Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} className="mt-1 h-8" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 text-sm" rows={2} placeholder="Optional..." />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="pl-7 h-8 text-sm"
                  placeholder="Search items to add..."
                />
                {itemSearch && filteredItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md z-10 mt-1 max-h-40 overflow-y-auto">
                    {filteredItems.slice(0, 10).map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center justify-between"
                        onClick={() => addItem(item.id)}
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground font-mono">{item.sku}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {poItems.length > 0 && (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs w-20">Qty *</TableHead>
                        <TableHead className="text-xs w-24">Unit Price *</TableHead>
                        <TableHead className="text-xs w-24">Total</TableHead>
                        <TableHead className="text-xs w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poItems.map((row) => (
                        <TableRow key={row.itemId}>
                          <TableCell className="text-xs">{row.itemName}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{row.itemSku}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={row.quantity}
                              onChange={(e) => updateItem(row.itemId, "quantity", Number(e.target.value))}
                              className="h-7 w-16 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={row.unitPrice}
                              onChange={(e) => updateItem(row.itemId, "unitPrice", Number(e.target.value))}
                              className="h-7 w-20 text-xs"
                            />
                          </TableCell>
                          <TableCell className="text-xs tabular-nums font-medium">
                            {formatCurrency(row.quantity * row.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <button onClick={() => removeItem(row.itemId)} className="text-muted-foreground hover:text-destructive">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Tax</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    className="h-7 w-28 text-xs text-right"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Shipping</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="h-7 w-28 text-xs text-right"
                  />
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 2 && (
            <Button variant="outline" size="sm" onClick={() => setStep(1)} disabled={isPending}>
              Back
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button size="sm" disabled={!vendorId} onClick={() => setStep(2)}>
              Next — Add Items
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={!canProceed || isPending}
                onClick={() => handleCreate(false)}
              >
                {creating ? "Creating..." : "Create as Draft"}
              </Button>
              <Button
                size="sm"
                disabled={!canProceed || isPending}
                onClick={() => handleCreate(true)}
              >
                {isPending ? "Submitting..." : "Create & Submit"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
