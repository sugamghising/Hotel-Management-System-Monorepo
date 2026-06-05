"use client";

import { useState } from "react";
import { usePostPayment } from "@/lib/hooks/useFolio";
import type { PaymentMethod } from "@/lib/hooks/useFolio";
import { formatCurrency } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
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

const CARD_BRANDS = ["VISA", "MASTERCARD", "AMEX", "OTHER"];

interface PostPaymentDialogProps {
  reservationId: string;
  currentBalance: number;
  open: boolean;
  onClose: () => void;
}

export function PostPaymentDialog({
  reservationId,
  currentBalance,
  open,
  onClose,
}: PostPaymentDialogProps) {
  const [amount, setAmount] = useState(currentBalance > 0 ? currentBalance : 0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cardLastFour, setCardLastFour] = useState("");
  const [cardBrand, setCardBrand] = useState("VISA");
  const [notes, setNotes] = useState("");

  const postPayment = usePostPayment(reservationId);
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  const isCardMethod = method === "CREDIT_CARD" || method === "DEBIT_CARD";
  const balanceAfter = currentBalance - amount;

  const handleConfirm = () => {
    if (amount <= 0) return;
    postPayment.mutate(
      {
        amount,
        method,
        ...(isCardMethod ? { cardLastFour: cardLastFour || undefined, cardBrand } : {}),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setAmount(0);
          setMethod("CASH");
          setCardLastFour("");
          setCardBrand("VISA");
          setNotes("");
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
          setAmount(0);
          setMethod("CASH");
          setCardLastFour("");
          setCardBrand("VISA");
          setNotes("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
            <p
              className={`mt-1 text-xs ${
                balanceAfter <= 0 ? "text-green-600" : "text-yellow-600"
              }`}
            >
              Balance after: {formatCurrency(balanceAfter, currencyCode)}
            </p>
          </div>
          <div>
            <Label>Method</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCardMethod && (
            <>
              <div>
                <Label>Card Last 4</Label>
                <Input
                  value={cardLastFour}
                  onChange={(e) => setCardLastFour(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div>
                <Label>Card Brand</Label>
                <Select value={cardBrand} onValueChange={setCardBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={amount <= 0 || postPayment.isPending}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
