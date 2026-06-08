"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils/formatters";
import { usePOSMenu, useAddPOSItem } from "@/lib/hooks/usePOS";
import { Search, Plus, Coffee } from "lucide-react";
import type { POSMenuItem } from "@/lib/hooks/usePOS";

interface AddItemSectionProps {
  orderId: string;
  orderStatus: string;
  canEdit: boolean;
  currencyCode: string;
  onAddCustomItem: () => void;
}

export function AddItemSection({
  orderId,
  orderStatus,
  canEdit,
  currencyCode,
  onAddCustomItem,
}: AddItemSectionProps) {
  const { data: menuData, isLoading: menuLoading } = usePOSMenu();
  const { mutate: addItem } = useAddPOSItem();
  const [search, setSearch] = useState("");
  const [recentItems, setRecentItems] = useState<Array<{ name: string; price: number }>>([]);

  const menuItems = menuData?.items ?? [];
  const hasMenu = !menuLoading && menuItems.length > 0;

  const filtered = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)),
    );
  }, [menuItems, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, POSMenuItem[]>();
    for (const item of filtered) {
      const cat = item.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handleSelectItem = useCallback(
    (item: POSMenuItem) => {
      if (!item.isAvailable) return;
      addItem(
        {
          orderId,
          itemName: item.name,
          itemCode: item.code,
          quantity: 1,
          unitPrice: item.price,
        },
        {
          onSuccess: () => {
            setRecentItems((prev) => {
              const next = [{ name: item.name, price: item.price }, ...prev.filter((r) => r.name !== item.name)];
              return next.slice(0, 3);
            });
            setSearch("");
          },
        },
      );
    },
    [orderId, addItem],
  );

  const handleReAddRecent = (item: { name: string; price: number }) => {
    addItem({
      orderId,
      itemName: item.name,
      quantity: 1,
      unitPrice: item.price,
    });
  };

  if (!canEdit || orderStatus !== "OPEN") return null;

  return (
    <div className="px-4 py-3 border-t space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Add Items
        </Label>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onAddCustomItem}>
          <Plus className="h-3 w-3 mr-1" />
          Custom Item
        </Button>
      </div>

      {hasMenu ? (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="pl-8 h-8 text-sm"
            />
          </div>

          {search && (
            <div className="max-h-60 overflow-y-auto rounded-lg border bg-popover">
              {grouped.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center">No menu items found</p>
              ) : (
                grouped.map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[11px] font-semibold text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wide">
                      {category}
                    </p>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        disabled={!item.isAvailable}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed text-left"
                      >
                        <span>{item.name}</span>
                        <span className="font-medium text-muted-foreground">
                          {formatCurrency(item.price, currencyCode)}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {recentItems.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Recent:</span>
              {recentItems.map((item, i) => (
                <button
                  key={`${item.name}-${i}`}
                  onClick={() => handleReAddRecent(item)}
                  className="text-[11px] bg-muted px-2 py-0.5 rounded-full hover:bg-muted/80"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </>
      ) : menuLoading ? (
        <p className="text-xs text-muted-foreground italic">Loading menu...</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Menu not configured. Use "Custom Item" to add items.
        </p>
      )}
    </div>
  );
}
