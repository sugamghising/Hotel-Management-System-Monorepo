"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { Plus, Minus, X, Utensils } from "lucide-react";
import { useAddPOSItem, useVoidPOSItem, useUpdatePOSItem } from "@/lib/hooks/usePOS";
import type { POSOrderItem, POSMenuItem } from "@/lib/hooks/usePOS";

interface OrderItemsTableProps {
  items: POSOrderItem[];
  status: string;
  orderId: string;
  canEdit: boolean;
}

export function OrderItemsTable({ items, status, orderId, canEdit }: OrderItemsTableProps) {
  const { mutate: addItem } = useAddPOSItem();
  const { mutate: voidItem } = useVoidPOSItem();
  const { mutate: updateItem } = useUpdatePOSItem();

  const nonVoided = items.filter((i) => !i.isVoided);
  const voided = items.filter((i) => i.isVoided);
  const isOpen = status === "OPEN";

  const handleIncrementQty = (item: POSOrderItem) => {
    addItem({
      orderId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      quantity: 1,
      unitPrice: item.unitPrice,
    });
  };

  const handleDecrementQty = (item: POSOrderItem) => {
    if (item.quantity <= 1) {
      voidItem({ orderId, itemId: item.id });
    } else {
      updateItem({ orderId, itemId: item.id, input: { quantity: item.quantity - 1 } });
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Utensils className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No items yet</p>
        <p className="text-xs text-muted-foreground/60">Add from the menu below</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b">
            <th className="text-left py-2 font-medium">Item</th>
            <th className="text-center py-2 font-medium w-20">Qty</th>
            <th className="text-right py-2 font-medium w-24">Unit Price</th>
            <th className="text-right py-2 font-medium w-24">Total</th>
            {isOpen && canEdit && <th className="w-10" />}
          </tr>
        </thead>
        <tbody>
          {nonVoided.map((item) => (
            <tr key={item.id} className="border-b border-muted/50">
              <td className="py-2.5">
                <span className="font-medium">{item.itemName}</span>
                {item.modifications && (
                  <p className="text-[11px] text-muted-foreground italic">{item.modifications}</p>
                )}
                {item.specialInstructions && (
                  <p className="text-[11px] text-blue-600 italic">{item.specialInstructions}</p>
                )}
              </td>
              <td className="text-center py-2.5">
                {isOpen && canEdit ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => handleDecrementQty(item)}
                      className="h-5 w-5 rounded inline-flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrementQty(item)}
                      className="h-5 w-5 rounded inline-flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span>{item.quantity}</span>
                )}
              </td>
              <td className="text-right py-2.5 text-muted-foreground">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="text-right py-2.5 font-medium">
                {formatCurrency(item.totalPrice)}
              </td>
              {isOpen && canEdit && (
                <td className="py-2.5 text-center">
                  <button
                    onClick={() => voidItem({ orderId, itemId: item.id })}
                    className="h-6 w-6 rounded inline-flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}

          {voided.length > 0 && (
            <>
              <tr>
                <td colSpan={isOpen && canEdit ? 5 : 4} className="pt-3 pb-1">
                  <Separator />
                  <p className="text-[11px] text-muted-foreground mt-1">Voided items</p>
                </td>
              </tr>
              {voided.map((item) => (
                <tr key={item.id} className="opacity-50">
                  <td className="py-1.5">
                    <span className="text-sm line-through">{item.itemName}</span>
                    <Badge variant="outline" className="ml-2 text-[9px] bg-red-50 text-red-700 border-red-200 px-1 py-0">
                      VOID
                    </Badge>
                    {item.voidReason && (
                      <p className="text-[11px] text-muted-foreground">{item.voidReason}</p>
                    )}
                  </td>
                  <td className="text-center py-1.5 text-sm">{item.quantity}</td>
                  <td className="text-right py-1.5 text-sm text-muted-foreground">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right py-1.5 text-sm text-muted-foreground line-through">
                    {formatCurrency(item.totalPrice)}
                  </td>
                  {isOpen && canEdit && <td />}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
