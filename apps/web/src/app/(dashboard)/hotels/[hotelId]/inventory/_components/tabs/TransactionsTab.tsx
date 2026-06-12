"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Receipt } from "lucide-react";
import { useInventoryTransactions, useInventoryItems } from "@/lib/hooks/useInventory";
import type { TransactionType } from "@/lib/hooks/useInventory";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

const TX_TYPE_STYLES: Record<string, string> = {
  PURCHASE: "bg-green-100 text-green-800",
  CONSUMPTION: "bg-red-100 text-red-800",
  ADJUSTMENT: "bg-blue-100 text-blue-800",
  WASTE: "bg-orange-100 text-orange-800",
  RETURN: "bg-purple-100 text-purple-800",
  TRANSFER: "bg-cyan-100 text-cyan-800",
  OPENING: "bg-gray-100 text-gray-800",
};

const TX_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "CONSUMPTION", label: "Consumption" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "WASTE", label: "Waste" },
  { value: "RETURN", label: "Return" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "OPENING", label: "Opening" },
];

function getDefaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

export function TransactionsTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: itemsData } = useInventoryItems({ pageSize: 500 });
  const allItems = itemsData?.items ?? [];

  const itemId = searchParams.get("txItem") ?? "";
  const type = searchParams.get("txType") ?? "";
  const dateFrom = searchParams.get("txFrom") ?? getDefaultFrom();
  const dateTo = searchParams.get("txTo") ?? new Date().toISOString().split("T")[0];
  const page = Number(searchParams.get("txPage")) || 1;

  const filters = {
    itemId: itemId || undefined,
    type: (type as TransactionType) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: 50,
  };

  const { data, isLoading } = useInventoryTransactions(filters);
  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 50);

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
      <div className="flex items-center gap-2 flex-wrap">
        <div>
          <Label className="text-[10px] text-muted-foreground">From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => navigate({ txFrom: e.target.value || null, txPage: null })}
            className="h-8 w-36 text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => navigate({ txTo: e.target.value || null, txPage: null })}
            className="h-8 w-36 text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Item</Label>
          <Select
            value={itemId}
            onValueChange={(v) => navigate({ txItem: v || null, txPage: null })}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="All items" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Items</SelectItem>
              {allItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => navigate({ txType: v || null, txPage: null })}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              {TX_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No transactions found</h3>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs text-right">Unit Cost</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Reference</TableHead>
                  <TableHead className="text-xs">By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isIn = tx.quantity > 0;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDate(tx.performedAt, "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{tx.itemName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{tx.itemSku}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1 py-0", TX_TYPE_STYLES[tx.type] ?? "")}
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-right">
                        <span className={isIn ? "text-green-600" : "text-red-600"}>
                          {isIn ? "+" : ""}{tx.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-right">
                        {tx.unitCost != null ? formatCurrency(tx.unitCost) : "—"}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-right font-medium">
                        {tx.totalCost != null ? formatCurrency(tx.totalCost) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tx.refType ? (
                          <span className="text-[10px]">{tx.refType}:{tx.refId?.slice(0, 8)}</span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.performedByName}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={page <= 1}
                  onClick={() => navigate({ txPage: String(page - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => navigate({ txPage: String(page + 1) })}
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
