"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ReservationListItem } from "@/lib/api/modules/reservations";
import { ReservationBadge } from "@/components/status/StatusBadge";
import {
  formatDate,
  formatCurrency,
  formatNights,
} from "@/lib/utils/formatters";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const reservationColumns: ColumnDef<ReservationListItem>[] = [
  {
    accessorKey: "confirmationNumber",
    header: "Confirmation",
    size: 130,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-blue-600">
        {row.original.confirmationNumber}
      </span>
    ),
  },
  {
    accessorKey: "guestName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Guest
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.guestName}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 130,
    cell: ({ row }) => <ReservationBadge status={row.original.status} />,
  },
  {
    accessorKey: "checkInDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Check In
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.checkInDate)}</span>
    ),
  },
  {
    accessorKey: "checkOutDate",
    header: "Check Out",
    size: 120,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.checkOutDate)}
      </span>
    ),
  },
  {
    accessorKey: "nights",
    header: "Nights",
    size: 80,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.nights}</span>
    ),
  },
  {
    accessorKey: "roomType",
    header: "Room Type",
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
        {row.original.roomType}
      </span>
    ),
  },
  {
    accessorKey: "roomNumber",
    header: "Room",
    size: 80,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.roomNumber ? (
          `#${row.original.roomNumber}`
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    size: 100,
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatCurrency(row.original.totalAmount)}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    size: 100,
    cell: ({ row }) => {
      const bal = row.original.balance;
      return (
        <span
          className={`text-sm font-medium tabular-nums ${
            bal > 0
              ? "text-red-600"
              : bal < 0
                ? "text-amber-600"
                : "text-emerald-600"
          }`}
        >
          {bal === 0 ? "Paid" : formatCurrency(bal)}
        </span>
      );
    },
  },
];
