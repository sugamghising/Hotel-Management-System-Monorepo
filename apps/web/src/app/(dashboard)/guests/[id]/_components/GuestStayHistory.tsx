"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useGuestHistory } from "@/lib/hooks/useGuests";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { CalendarClock, ChevronDown } from "lucide-react";
import type { GuestStayHistory } from "@/lib/hooks/useGuests";

const statusBadge: Record<string, string> = {
  CHECKED_OUT: "bg-green-100 text-green-700 border-green-200",
  CHECKED_IN: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-200",
  CONFIRMED: "bg-purple-100 text-purple-700 border-purple-200",
};

interface GuestStayHistoryProps {
  id: string;
}

export function GuestStayHistoryCard({ id }: GuestStayHistoryProps) {
  const router = useRouter();
  const { activeHotel } = useAuthStore();
  const { data: history, isLoading } = useGuestHistory(id);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    if (!history) return [];
    return [...history].sort(
      (a, b) =>
        new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime(),
    );
  }, [history]);

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Stay History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CalendarClock className="h-8 w-8 opacity-30 mb-2" />
            <p className="text-sm">No stay history yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Hotel</TableHead>
                  <TableHead className="text-xs">Dates</TableHead>
                  <TableHead className="text-xs text-right">Nights</TableHead>
                  <TableHead className="text-xs">Room</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.map((stay: GuestStayHistory) => (
                  <TableRow
                    key={stay.reservationId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(
                        `/hotels/${activeHotel?.id ?? ""}/reservations/${stay.reservationId}`,
                      )
                    }
                  >
                    <TableCell className="py-2.5 text-sm font-medium">
                      {stay.hotelName}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm">
                      {formatDate(stay.checkInDate, "MMM d, yyyy")}
                      {" \u2192 "}
                      {formatDate(stay.checkOutDate, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-right">
                      {stay.nights}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground">
                      {stay.roomType}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-right font-medium">
                      {formatCurrency(stay.totalAmount, activeHotel?.currencyCode ?? "USD")}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium text-[10px] px-1.5 py-0 h-auto border",
                          statusBadge[stay.status] ?? "bg-gray-100 text-gray-600",
                        )}
                      >
                        {stay.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {sorted.length > 10 && !showAll && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => setShowAll(true)}
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Load more ({sorted.length - 10} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
