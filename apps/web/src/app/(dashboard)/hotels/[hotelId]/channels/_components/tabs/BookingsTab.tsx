"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  useChannelBookings,
  useChannels,
  type ChannelBooking,
} from "@/lib/hooks/useChannelManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { BookingDetailSheet } from "../BookingDetailSheet";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";

import { Search, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  MODIFIED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-200",
};

export function BookingsTab() {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";

  const { data: channels } = useChannels(hotelId);

  const [channelFilter, setChannelFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<ChannelBooking | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = useChannelBookings(hotelId, {
    channelId: channelFilter || undefined,
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: 20,
  });

  const bookings = data?.bookings ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const openDetail = (booking: ChannelBooking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Search by guest name..."
            className="border rounded h-8 w-full pl-7 pr-2 text-xs"
          />
        </div>
        <Select value={channelFilter} onValueChange={(v) => { setChannelFilter(v); setPage(1); }}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All channels</SelectItem>
            {channels?.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.channelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-8 text-xs w-32">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="MODIFIED">Modified</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="h-8 text-xs w-36"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="h-8 text-xs w-36"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <CalendarDays className="h-8 w-8" />
          <p className="text-sm">No bookings found</p>
          <p className="text-xs">
            {channelFilter || statusFilter || dateFrom
              ? "Try adjusting your filters."
              : "Bookings from connected channels will appear here."}
          </p>
        </div>
      )}

      {!isLoading && bookings.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow
                  key={b.id}
                  className="cursor-pointer"
                  onClick={() => openDetail(b)}
                >
                  <TableCell>
                    <div>
                      <p className="text-xs font-medium">{b.guestName}</p>
                      {b.channelBookingRef && (
                        <p className="text-[10px] text-muted-foreground">
                          #{b.channelBookingRef}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{b.channelName}</TableCell>
                  <TableCell className="text-xs">{b.roomTypeName}</TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(b.checkIn), "MMM d")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(b.checkOut), "MMM d")}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {formatCurrency(b.totalAmount, b.currencyCode)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] h-4 px-1",
                        STATUS_STYLES[b.status],
                      )}
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(b.receivedAt), "MMM d, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <BookingDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        booking={selectedBooking}
      />
    </div>
  );
}
