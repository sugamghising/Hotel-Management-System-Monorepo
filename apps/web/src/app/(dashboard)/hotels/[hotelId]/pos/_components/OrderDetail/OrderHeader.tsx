"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/formatters";
import { MoreHorizontal, Table2, DoorOpen, User } from "lucide-react";
import { useUpdatePOSOrder } from "@/lib/hooks/usePOS";
import type { POSOrder } from "@/lib/hooks/usePOS";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-blue-50 text-blue-700 border-blue-200" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200" },
  PAID: { label: "Paid", color: "bg-green-50 text-green-700 border-green-200" },
  VOID: { label: "Void", color: "bg-red-50 text-red-700 border-red-200" },
  COMPED: { label: "Comp", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

interface OrderHeaderProps {
  order: POSOrder;
  onVoid: () => void;
  onPostToRoom: () => void;
  canVoid: boolean;
  canPostToRoom: boolean;
}

export function OrderHeader({ order, onVoid, onPostToRoom, canVoid, canPostToRoom }: OrderHeaderProps) {
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.OPEN;
  const [editingTable, setEditingTable] = useState(false);
  const [tableValue, setTableValue] = useState(order.tableNumber ?? "");
  const { mutate: updateOrder } = useUpdatePOSOrder();

  const handleSaveTable = () => {
    updateOrder({ orderId: order.id, tableNumber: tableValue || undefined });
    setEditingTable(false);
  };

  const isReadOnly = order.status !== "OPEN";

  return (
    <div className="sticky top-0 bg-background border-b z-10">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-xl font-bold">#{order.orderNumber}</h2>
            <Badge variant="outline" className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{order.outlet}</span>
          </div>

          {!isReadOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setEditingTable(true)}>
                  Change Table
                </DropdownMenuItem>
                {canPostToRoom && (
                  <DropdownMenuItem onClick={onPostToRoom}>
                    Assign Room
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canVoid && (
                  <DropdownMenuItem onClick={onVoid} className="text-red-600">
                    Void Order
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {editingTable ? (
            <div className="flex items-center gap-1">
              <Table2 className="h-3 w-3" />
              <Input
                value={tableValue}
                onChange={(e) => setTableValue(e.target.value)}
                className="h-6 w-24 text-xs"
                autoFocus
                placeholder="Table #"
              />
              <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleSaveTable}>
                Save
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setEditingTable(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Table2 className="h-3 w-3" />
              {order.tableNumber ? `Table ${order.tableNumber}` : "No table"}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <DoorOpen className="h-3 w-3" />
            {order.roomNumber ? `Room ${order.roomNumber}` : "No room"}
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {order.serverId.slice(0, 8)}...
          </span>
          <span>Opened {formatTime(order.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
