"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Plus } from "lucide-react";
import { useInventoryItems } from "@/lib/hooks/useInventory";
import type { InventoryCategory } from "@/lib/hooks/useInventory";
import { ItemRow } from "../ItemRow";
import { usePermission } from "@/lib/hooks/usePermission";

interface ItemsTabProps {
  onAdjust: (itemId: string) => void;
  onConsume: (itemId: string) => void;
  onView: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  onCreateItem: () => void;
}

const CATEGORY_OPTIONS: { value: InventoryCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "ROOM_SUPPLIES", label: "Room Supplies" },
  { value: "MINIBAR", label: "Minibar" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "FANDB", label: "F&B" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OFFICE", label: "Office" },
  { value: "UNIFORM", label: "Uniform" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OTHER", label: "Other" },
];

const STOCK_OPTIONS = [
  { value: "", label: "All Stock" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
  { value: "over", label: "Overstocked" },
];

export function ItemsTab({ onAdjust, onConsume, onView, onEdit, onCreateItem }: ItemsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canAdjust = usePermission("INVENTORY.ADJUST");
  const canConsume = usePermission("INVENTORY.CONSUME");
  const canUpdate = usePermission("INVENTORY.UPDATE");
  const canCreate = usePermission("INVENTORY.CREATE");

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const stockStatus = searchParams.get("stock") ?? "";
  const activeOnly = searchParams.get("active") !== "false";
  const page = Number(searchParams.get("page")) || 1;

  const filters = {
    search: search || undefined,
    category: (category as InventoryCategory) || undefined,
    lowStock: stockStatus === "low" ? true : undefined,
    isActive: activeOnly ? true : undefined,
    page,
    pageSize: 25,
  };

  const { data, isLoading } = useInventoryItems(filters);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 25);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      return `${pathname}?${params}`;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.replace(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={search}
            onChange={(e) => navigate({ search: e.target.value || null, page: null })}
            placeholder="Search name or SKU..."
            className="h-8 w-60 text-xs"
          />
          <Select
            value={category}
            onValueChange={(v) => navigate({ category: v || null, page: null })}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={stockStatus}
            onValueChange={(v) => navigate({ stock: v || null, page: null })}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              {STOCK_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-1">
          <Switch
            checked={activeOnly}
            onCheckedChange={(v) => navigate({ active: v ? null : "false", page: null })}
          />
          <Label className="text-xs cursor-pointer">Active only</Label>
          </div>
        </div>
        {canCreate && (
          <Button size="sm" onClick={onCreateItem}>
            <Plus className="h-4 w-4 mr-1.5" /> New Item
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-1">No inventory items found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {total === 0
              ? "Add your first item to start tracking stock."
              : "Try adjusting your filters."}
          </p>
          {total === 0 && canCreate && (
            <Button size="sm" className="mt-4" onClick={onCreateItem}>
              <Plus className="h-4 w-4 mr-1.5" /> New Item
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">SKU</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs w-48">Stock</TableHead>
                  <TableHead className="text-xs w-32">Par / Reorder</TableHead>
                  <TableHead className="text-xs w-24">Unit Cost</TableHead>
                  <TableHead className="text-xs w-24">Total Value</TableHead>
                  <TableHead className="text-xs w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onAdjust={onAdjust}
                    onConsume={onConsume}
                    onView={onView}
                    onEdit={onEdit}
                    canAdjust={canAdjust}
                    canConsume={canConsume}
                    canUpdate={canUpdate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={page <= 1}
                  onClick={() => navigate({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => navigate({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
