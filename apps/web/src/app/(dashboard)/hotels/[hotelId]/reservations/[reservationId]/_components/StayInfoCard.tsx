"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatDate, formatCurrency, formatNights } from "@/lib/utils/formatters";
import { Calendar, BedDouble, ChevronDown, ChevronUp } from "lucide-react";
import type { Reservation } from "@/lib/api/modules/reservations";

interface StayInfoCardProps {
  reservation: Reservation;
  onAssignRoom: () => void;
}

export function StayInfoCard({ reservation, onAssignRoom }: StayInfoCardProps) {
  const [showRates, setShowRates] = useState(false);

  const room = reservation.rooms[0];
  const hasRoom = !!room?.roomId;
  const isCheckedIn = reservation.status.reservation === "CHECKED_IN";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stay Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Check In</p>
            <p className="text-sm font-medium">
              {formatDate(reservation.dates.checkIn)}
              {reservation.dates.arrivalTime && (
                <span className="text-muted-foreground"> · {reservation.dates.arrivalTime}</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Check Out</p>
            <p className="text-sm font-medium">
              {formatDate(reservation.dates.checkOut)}
              {reservation.dates.departureTime && (
                <span className="text-muted-foreground"> · {reservation.dates.departureTime}</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
            <p className="text-sm font-medium">{formatNights(reservation.dates.nights)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Room</p>
            {room?.roomNumber ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-bold">{room.roomNumber}</Badge>
                {room.assignedAt && (
                  <span className="text-xs text-muted-foreground">Assigned {formatDate(room.assignedAt)}</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{room?.roomTypeName ?? "N/A"}</p>
            )}
          </div>
        </div>

        {!hasRoom ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-center justify-between">
            <span>No room assigned yet</span>
            <Button variant="outline" size="sm" onClick={onAssignRoom}>
              <BedDouble className="h-3.5 w-3.5 mr-1" />
              Assign Room
            </Button>
          </div>
        ) : !isCheckedIn ? (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            Room {room!.roomNumber ?? "assigned"} reserved
          </div>
        ) : (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            Checked in to Room {room!.roomNumber ?? room!.roomTypeName}
            {room!.checkInAt && <> · {formatDate(room!.checkInAt, "MMM d, yyyy h:mm a")}</>}
          </div>
        )}

        <Separator />

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRates(!showRates)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span>{showRates ? "Hide rate details" : "Show rate details"}</span>
            {showRates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showRates && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{room?.roomTypeName}</span>
                <Badge variant="secondary">{reservation.policies.cancellationPolicy}</Badge>
              </div>

              <p className="text-sm">
                Average nightly rate:{" "}
                <span className="font-medium">
                  {formatCurrency(reservation.financial.averageRate, reservation.financial.currencyCode)}
                </span>
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservation.financial.nightlyRates.map((nr) => (
                    <TableRow key={nr.date}>
                      <TableCell>{formatDate(nr.date)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(nr.total, reservation.financial.currencyCode)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(reservation.financial.subtotal, reservation.financial.currencyCode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(reservation.financial.taxAmount, reservation.financial.currencyCode)}</span>
                </div>
                {reservation.financial.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(reservation.financial.discountAmount, reservation.financial.currencyCode)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(reservation.financial.totalAmount, reservation.financial.currencyCode)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
