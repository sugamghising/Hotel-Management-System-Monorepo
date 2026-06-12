"use client";

import { Building2, Edit3, Plus, ShieldCheck, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Vendor } from "@/lib/hooks/useInventory";

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendorId: string) => void;
  onNewPO: (vendorId: string) => void;
  onApprove: (vendorId: string) => void;
  canApprove: boolean;
}

export function VendorCard({
  vendor,
  onEdit,
  onNewPO,
  onApprove,
  canApprove,
}: VendorCardProps) {
  const stars = vendor.rating ?? 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 hover:shadow-md transition-all",
        !vendor.isApproved && "border-l-yellow-400 border-l-4",
        !vendor.isActive && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{vendor.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  vendor.isApproved
                    ? "text-green-700 border-green-200 bg-green-50"
                    : "text-yellow-700 border-yellow-200 bg-yellow-50",
                )}
              >
                {vendor.isApproved ? "Approved" : "Pending"}
              </Badge>
              <Circle
                className={cn(
                  "h-2 w-2",
                  vendor.isActive ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300",
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        {vendor.contactPerson && <p>{vendor.contactPerson}</p>}
        {(vendor.email || vendor.phone) && (
          <p>
            {vendor.email}
            {vendor.email && vendor.phone && " · "}
            {vendor.phone}
          </p>
        )}
        <div className="flex items-center gap-2">
          {vendor.paymentTerms && (
            <span className="inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-mono">
              {vendor.paymentTerms}
            </span>
          )}
          <span className="font-mono">{vendor.currencyCode}</span>
        </div>
      </div>

      <div className="border-t pt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-yellow-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={s <= stars ? "text-yellow-400" : "text-gray-300"}>
                ★
              </span>
            ))}
          </span>
          <span className="text-muted-foreground">{vendor.totalOrders} orders</span>
          <span className="text-muted-foreground font-mono">
            {formatCurrency(vendor.totalSpend, vendor.currencyCode)}
          </span>
        </div>
        <span className="text-muted-foreground">
          {vendor.lastOrderDate ? formatDate(vendor.lastOrderDate) : "Never"}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(vendor.id)} title="Edit">
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNewPO(vendor.id)} title="New PO">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        {canApprove && !vendor.isApproved && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onApprove(vendor.id)} title="Approve">
            <ShieldCheck className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
