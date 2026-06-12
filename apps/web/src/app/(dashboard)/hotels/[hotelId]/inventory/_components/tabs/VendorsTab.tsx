"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVendors, useApproveVendor } from "@/lib/hooks/useInventory";
import { VendorCard } from "../VendorCard";
import { VendorFormDialog } from "../VendorFormDialog";
import { usePermission } from "@/lib/hooks/usePermission";
import { Building2, Grid3X3, List, Plus } from "lucide-react";

interface VendorsTabProps {
  onNewPO: (vendorId: string) => void;
}

export function VendorsTab({ onNewPO }: VendorsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = useVendors();
  const { mutate: approveVendor } = useApproveVendor();

  const canManage = usePermission("INVENTORY.VENDOR.CREATE");
  const canApprove = usePermission("INVENTORY.VENDOR.APPROVE");

  const viewMode = searchParams.get("vendorView") ?? "grid";
  const vendors = data?.vendors ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<string | null>(null);

  const editVendorData = editVendor ? vendors.find((v) => v.id === editVendor) ?? null : null;

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      router.replace(`${pathname}?${params}`);
    },
    [pathname, searchParams, router],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => navigate({ vendorView: "grid" })}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => navigate({ vendorView: "list" })}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => { setEditVendor(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" /> New Vendor
          </Button>
        )}
      </div>

      {vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Building2 className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No vendors found</h3>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={(id) => { setEditVendor(id); setFormOpen(true); }}
              onNewPO={onNewPO}
              onApprove={(id) => approveVendor(id)}
              canApprove={canApprove}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-2 px-3 font-medium">Name</th>
                <th className="text-left py-2 px-3 font-medium">Code</th>
                <th className="text-left py-2 px-3 font-medium">Contact</th>
                <th className="text-left py-2 px-3 font-medium">Terms</th>
                <th className="text-right py-2 px-3 font-medium">Orders</th>
                <th className="text-right py-2 px-3 font-medium">Spend</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
                <th className="text-left py-2 px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{vendor.name}</td>
                  <td className="py-2 px-3 font-mono text-muted-foreground">{vendor.code}</td>
                  <td className="py-2 px-3 text-muted-foreground">{vendor.contactPerson ?? "—"}</td>
                  <td className="py-2 px-3">{vendor.paymentTerms ?? "—"}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{vendor.totalOrders}</td>
                  <td className="py-2 px-3 text-right tabular-nums">${vendor.totalSpend.toFixed(2)}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${vendor.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {vendor.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1" onClick={() => { setEditVendor(vendor.id); setFormOpen(true); }}>
                      Edit
                    </Button>
                    {canApprove && !vendor.isApproved && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1" onClick={() => approveVendor(vendor.id)}>
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VendorFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditVendor(null); }}
        vendor={editVendorData}
      />
    </div>
  );
}
