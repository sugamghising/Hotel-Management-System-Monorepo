"use client";

import { useState } from "react";
import { useRefundPayment } from "@/lib/hooks/useFolio";
import type { FolioPayment, PaymentMethod } from "@/lib/hooks/useFolio";
import { formatCurrency } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store";
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

const REFUND_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHECK", label: "Check" },
  { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
  { value: "GIFT_CARD", label: "Gift Card" },
  { value: "LOYALTY_POINTS", label: "Loyalty Points" },
  { value: "DIRECT_BILL", label: "Direct Bill" },
  { value: "DEPOSIT", label: "Deposit" },
];

interface RefundDialogProps {
  reservationId: string;
  payment: FolioPayment | null;
  open: boolean;
  onClose: () => void;
}

export function RefundDialog({
  reservationId,
  payment,
  open,
  onClose,
}: RefundDialogProps) {
  const [amount, setAmount] = useState(payment?.amount ?? 0);
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<PaymentMethod>(payment?.method ?? "CASH");

  const refund = useRefundPayment(reservationId);
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  if (!payment) return null;

  const handleConfirm = () => {
    if (!amount || !reason.trim()) return;
    refund.mutate(
      { paymentId: payment.id, input: { amount, reason: reason.trim(), method } },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      key={payment.id}
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Original Payment</p>
            <p className="font-medium">
              {formatCurrency(payment.amount, currencyCode)} via {payment.method}
            </p>
          </div>
          <div>
            <Label>Refund Amount</Label>
            <Input
              type="number"
              value={amount}
              max={payment.amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
            {amount > payment.amount && (
              <p className="mt-1 text-xs text-red-500">
                Amount cannot exceed {formatCurrency(payment.amount, currencyCode)}
              </p>
            )}
          </div>
          <div>
            <Label>Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Refund Method</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFUND_METHODS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!amount || !reason.trim() || refund.isPending || amount > payment.amount}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
