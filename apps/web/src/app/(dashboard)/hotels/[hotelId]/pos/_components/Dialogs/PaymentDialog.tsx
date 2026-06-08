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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { useProcessPOSPayment, usePOSOrder } from "@/lib/hooks/usePOS";
import { Banknote, CreditCard, Smartphone, Gift } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "MOBILE", label: "Mobile Payment", icon: Smartphone },
  { value: "GIFT_CARD", label: "Gift Card", icon: Gift },
];

interface PaymentDialogProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  currencyCode: string;
}

export function PaymentDialog({ orderId, open, onClose, currencyCode }: PaymentDialogProps) {
  const { data: order } = usePOSOrder(orderId);
  const { mutate: processPayment, isPending } = useProcessPOSPayment();

  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");

  const due = order ? order.total - order.paidAmount : 0;
  const parsedAmount = Number(amount) || 0;
  const change = parsedAmount > due ? parsedAmount - due : 0;
  const isPartial = parsedAmount > 0 && parsedAmount < due;
  const isValid = method && parsedAmount > 0;

  const handleSubmit = () => {
    if (!orderId || !isValid) return;
    processPayment(
      { orderId, amount: parsedAmount, method },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Order #{order?.orderNumber}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center py-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Amount Due</p>
            <p className="text-2xl font-bold">
              {formatCurrency(due, currencyCode)}
            </p>
            {order && order.paidAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Previously paid: {formatCurrency(order.paidAmount, currencyCode)}
              </p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium mb-2 block">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const isSelected = method === pm.value;
                return (
                  <button
                    key={pm.value}
                    onClick={() => setMethod(pm.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {currencyCode}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 h-9 text-sm font-medium"
                placeholder={String(due)}
              />
            </div>
            {isPartial && (
              <p className="text-[11px] text-amber-600 mt-1">
                Partial payment. Remaining balance: {formatCurrency(due - parsedAmount, currencyCode)}
              </p>
            )}
            {method === "CASH" && change > 0 && (
              <p className="text-[11px] text-green-600 mt-1 font-medium">
                Change due: {formatCurrency(change, currencyCode)}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
