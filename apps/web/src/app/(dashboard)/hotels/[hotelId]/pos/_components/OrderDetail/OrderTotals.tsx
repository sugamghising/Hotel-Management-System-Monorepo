"use client";

import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { POSOrder } from "@/lib/hooks/usePOS";

interface OrderTotalsProps {
  order: POSOrder;
  currencyCode: string;
}

export function OrderTotals({ order, currencyCode }: OrderTotalsProps) {
  const balance = order.total - order.paidAmount;

  return (
    <div className="px-4 py-3 space-y-1.5 text-sm border-t bg-background">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span>{formatCurrency(order.subtotal, currencyCode)}</span>
      </div>
      {order.serviceCharge > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>Service Charge</span>
          <span>{formatCurrency(order.serviceCharge, currencyCode)}</span>
        </div>
      )}
      {order.discountTotal > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span>
          <span className="text-red-600">-{formatCurrency(order.discountTotal, currencyCode)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>Tax</span>
        <span>{formatCurrency(order.taxTotal, currencyCode)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-base">
        <span>TOTAL</span>
        <span>{formatCurrency(order.total, currencyCode)}</span>
      </div>
      {order.paidAmount > 0 && (
        <>
          <div className="flex justify-between text-sm text-green-600">
            <span>Paid</span>
            <span>{formatCurrency(order.paidAmount, currencyCode)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Balance</span>
            <span>{formatCurrency(balance, currencyCode)}</span>
          </div>
        </>
      )}
    </div>
  );
}
