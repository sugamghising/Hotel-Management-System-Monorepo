"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useReservation,
  useCheckIn,
  useCheckOut,
  useCancelReservation,
  useMarkNoShow,
} from "@/lib/hooks/useReservations";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReservationBadge } from "@/components/status/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatGuests,
  formatNights,
} from "@/lib/utils/formatters";
import { usePermission } from "@/lib/hooks/usePermission";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  XCircle,
  UserX,
  BedDouble,
  CreditCard,
  FileText,
  Calendar,
  User,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReservationDetailPage() {
  const { hotelId, reservationId } = useParams<{
    hotelId: string;
    reservationId: string;
  }>();
  const router = useRouter();

  const { data: reservation, isLoading } = useReservation(reservationId);
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancel = useCancelReservation();
  const noShow = useMarkNoShow();

  // Permission checks
  const canCheckIn = usePermission("RESERVATION.CHECK_IN");
  const canCheckOut = usePermission("RESERVATION.CHECK_OUT");
  const canCancel = usePermission("RESERVATION.CANCEL");
  const canNoShow = usePermission("RESERVATION.NO_SHOW");

  // Dialog state
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (isLoading) return <ReservationDetailSkeleton />;
  if (!reservation)
    return (
      <div className="text-center py-20 text-muted-foreground">
        Reservation not found
      </div>
    );

  const status = reservation.status.reservation;
  const isConfirmed = status === "CONFIRMED";
  const isCheckedIn = status === "CHECKED_IN";
  const isClosed = ["CHECKED_OUT", "CANCELLED", "NO_SHOW"].includes(status);

  const room = reservation.rooms?.[0];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={reservation.guests.primaryGuestName}
        subtitle={`Confirmation: ${reservation.confirmationNumber}`}
        breadcrumb={[
          { label: "Reservations", href: `/hotels/${hotelId}/reservations` },
          { label: reservation.confirmationNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <ReservationBadge status={status} size="lg" />
          </div>
        }
      />

      {/* Action buttons */}
      {!isClosed && (
        <div className="flex flex-wrap gap-2">
          {canCheckIn && isConfirmed && (
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() =>
                checkIn.mutate({
                  id: reservationId,
                  payload: { earlyCheckIn: false },
                })
              }
              disabled={checkIn.isPending}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Check In
            </Button>
          )}

          {canCheckOut && isCheckedIn && (
            <Button
              variant="outline"
              className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() =>
                checkOut.mutate({
                  id: reservationId,
                  payload: { lateCheckOut: false },
                })
              }
              disabled={checkOut.isPending}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Check Out
            </Button>
          )}

          {canCancel && !isCheckedIn && (
            <Button
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setCancelDialog(true)}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          )}

          {canNoShow && isConfirmed && (
            <Button
              variant="ghost"
              className="gap-2 text-orange-600 hover:bg-orange-50"
              onClick={() =>
                noShow.mutate({
                  id: reservationId,
                  payload: { chargeNoShowFee: false },
                })
              }
              disabled={noShow.isPending}
            >
              <UserX className="h-4 w-4" />
              No Show
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2 ml-auto"
            onClick={() =>
              router.push(
                `/hotels/${hotelId}/reservations/${reservationId}/folio`,
              )
            }
          >
            <FileText className="h-4 w-4" />
            View Folio
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stay details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Check In
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {formatDate(reservation.dates.checkIn)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Check Out
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {formatDate(reservation.dates.checkOut)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Duration
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {formatNights(reservation.dates.nights)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Guests
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {formatGuests(
                      reservation.guests.adultCount,
                      reservation.guests.childCount,
                      reservation.guests.infantCount,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Source
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {reservation.source.bookingSource.replace(/_/g, " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Booked
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {formatDate(reservation.source.bookedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Room */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                Room Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{room.roomTypeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {room.roomNumber
                        ? `Room ${room.roomNumber}`
                        : "No room assigned yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(
                        room.roomRate,
                        reservation.financial.currencyCode,
                      )}{" "}
                      / night
                    </p>
                  </div>
                  <ReservationBadge status={room.status as any} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No room details available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(reservation.notes.specialRequests ||
            reservation.notes.guestNotes ||
            reservation.notes.internalNotes) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Notes & Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {reservation.notes.specialRequests && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Special Requests
                    </p>
                    <p className="text-foreground">
                      {reservation.notes.specialRequests}
                    </p>
                  </div>
                )}
                {reservation.notes.guestNotes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Guest Notes
                    </p>
                    <p className="text-foreground">
                      {reservation.notes.guestNotes}
                    </p>
                  </div>
                )}
                {reservation.notes.internalNotes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Internal Notes
                    </p>
                    <p className="text-foreground bg-amber-50 border border-amber-100 rounded p-2">
                      {reservation.notes.internalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — financial */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Room charges</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(
                      reservation.financial.subtotal,
                      reservation.financial.currencyCode,
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Taxes</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(
                      reservation.financial.taxAmount,
                      reservation.financial.currencyCode,
                    )}
                  </dd>
                </div>
                {reservation.financial.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <dt>Discount</dt>
                    <dd className="tabular-nums">
                      -
                      {formatCurrency(
                        reservation.financial.discountAmount,
                        reservation.financial.currencyCode,
                      )}
                    </dd>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(
                      reservation.financial.totalAmount,
                      reservation.financial.currencyCode,
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-emerald-600">
                  <dt>Paid</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(
                      reservation.financial.paidAmount,
                      reservation.financial.currencyCode,
                    )}
                  </dd>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between font-semibold",
                    reservation.financial.balance > 0
                      ? "text-red-600"
                      : "text-emerald-600",
                  )}
                >
                  <dt>Balance</dt>
                  <dd className="tabular-nums">
                    {reservation.financial.balance === 0
                      ? "Settled"
                      : formatCurrency(
                          reservation.financial.balance,
                          reservation.financial.currencyCode,
                        )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancellation</span>
                <span className="font-medium">
                  {reservation.policies.cancellationPolicy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guarantee</span>
                <span className="font-medium">
                  {reservation.policies.guaranteeType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Rate</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(
                    reservation.financial.averageRate,
                    reservation.financial.currencyCode,
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              This will cancel reservation{" "}
              <strong>{reservation.confirmationNumber}</strong>.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="cancelReason">Reason</Label>
              <Input
                id="cancelReason"
                placeholder="Guest request, duplicate booking..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Keep Reservation
            </Button>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim() || cancel.isPending}
              onClick={() => {
                cancel.mutate(
                  {
                    id: reservationId,
                    payload: { reason: cancelReason, waiveFee: false },
                  },
                  { onSuccess: () => setCancelDialog(false) },
                );
              }}
            >
              Cancel Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReservationDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
