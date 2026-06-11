"use client";

import type { ChannelBooking } from "@/lib/hooks/useChannelManager";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, User, Mail, Hash, Building, DollarSign, Clock } from "lucide-react";

interface BookingDetailSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: ChannelBooking | null;
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  MODIFIED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-200",
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

export function BookingDetailSheet({
  open,
  onOpenChange,
  booking,
}: BookingDetailSheetProps) {
  if (!booking) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>Booking Details</SheetTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-5 px-1.5",
                STATUS_STYLES[booking.status],
              )}
            >
              {booking.status}
            </Badge>
          </div>
          <SheetDescription>
            Channel: {booking.channelName} · Ref: {booking.channelBookingRef}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Guest Information
            </h4>
            <DetailRow icon={User} label="Guest Name" value={booking.guestName} />
            {booking.guestEmail && (
              <DetailRow
                icon={Mail}
                label="Email"
                value={booking.guestEmail}
              />
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reservation
            </h4>
            <DetailRow
              icon={Hash}
              label="Channel Reference"
              value={booking.channelBookingRef}
            />
            <DetailRow
              icon={Building}
              label="Room Type"
              value={booking.roomTypeName}
            />
            <DetailRow
              icon={Calendar}
              label="Check-in"
              value={format(new Date(booking.checkIn), "MMM d, yyyy")}
            />
            <DetailRow
              icon={Calendar}
              label="Check-out"
              value={format(new Date(booking.checkOut), "MMM d, yyyy")}
            />
            <DetailRow
              icon={Clock}
              label="Nights"
              value={String(booking.nights)}
            />
          </div>

          {booking.totalAmount > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Financial
                </h4>
                <DetailRow
                  icon={DollarSign}
                  label="Total Amount"
                  value={`${booking.currencyCode} ${booking.totalAmount.toFixed(2)}`}
                />
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Timeline
            </h4>
            <DetailRow
              icon={Clock}
              label="Received"
              value={format(new Date(booking.receivedAt), "MMM d, yyyy HH:mm")}
            />
            {booking.processedAt && (
              <DetailRow
                icon={Clock}
                label="Processed"
                value={format(new Date(booking.processedAt), "MMM d, yyyy HH:mm")}
              />
            )}
            {booking.reservationId && (
              <DetailRow
                icon={Hash}
                label="Internal Reservation"
                value={booking.reservationId}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
