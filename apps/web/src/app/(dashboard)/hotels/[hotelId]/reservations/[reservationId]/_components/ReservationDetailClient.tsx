"use client";

import { useState } from "react";
import { useReservation, useMarkNoShow } from "@/lib/hooks/useReservations";
import { useFolio, type FolioItemType, type FolioItem, type FolioPayment } from "@/lib/hooks/useFolio";
import { useGuest } from "@/lib/hooks/useGuests";
import { usePermission } from "@/lib/hooks/usePermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/formatters";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";

import { ReservationHeader } from "./ReservationHeader";
import { StayInfoCard } from "./StayInfoCard";
import { GuestInfoCard } from "./GuestInfoCard";
import { FolioTab } from "./FolioTab";
import { NotesCard } from "./NotesCard";
import { TimelineCard } from "./TimelineCard";
import { CheckInDialog } from "./CheckInDialog";
import { CheckOutDialog } from "./CheckOutDialog";
import { CancelDialog } from "./CancelDialog";
import { AssignRoomDialog } from "./AssignRoomDialog";
import { PostChargeDialog } from "./PostChargeDialog";
import { PostPaymentDialog } from "./PostPaymentDialog";
import { VoidItemDialog } from "./VoidItemDialog";
import { RefundDialog } from "./RefundDialog";

interface ReservationDetailClientProps {
  id: string;
}

export function ReservationDetailClient({ id }: ReservationDetailClientProps) {
  const reservationId = id;

  const { data: reservation, isLoading, isError, refetch } = useReservation(reservationId);
  const { data: folio, isLoading: folioLoading } = useFolio(reservationId);
  const { data: guest, isLoading: guestLoading } = useGuest(
    reservation?.guests.primaryGuestId ?? "",
  );

  const canCheckIn = usePermission("RESERVATION.CHECK_IN");
  const canCheckOut = usePermission("RESERVATION.CHECK_OUT");
  const canCancel = usePermission("RESERVATION.CANCEL");
  const canNoShow = usePermission("RESERVATION.NO_SHOW");
  const canAssignRoom = usePermission("RESERVATION.ASSIGN_ROOM");
  const canPostCharge = usePermission("FOLIO.POST_CHARGE");
  const canPostPayment = usePermission("FOLIO.POST_PAYMENT");
  const canVoidItem = usePermission("FOLIO.VOID_ITEM");
  const canRefund = usePermission("FOLIO.REFUND");
  const canCreateInvoice = usePermission("FOLIO.INVOICE_CREATE");

  const [dialogState, setDialogState] = useState<{
    type: string | null;
    data?: any;
  }>({ type: null });

  const openDialog = (type: string, data?: any) => setDialogState({ type, data });
  const closeDialog = () => setDialogState({ type: null });

  const [activeTab, setActiveTab] = useState("folio");

  const noShow = useMarkNoShow();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !reservation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Failed to load reservation</p>
        <p className="text-sm text-muted-foreground mb-4">The reservation could not be found or an error occurred.</p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const status = reservation.status.reservation;
  const room = reservation.rooms?.[0];
  const currencyCode = folio?.summary.currencyCode || reservation.financial.currencyCode;

  return (
    <div className="space-y-6">
      {status === "CANCELLED" && reservation.cancellation && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cancelled</strong> &mdash; {reservation.cancellation.reason}
            {reservation.cancellation.fee > 0 && (
              <> &middot; Fee: {formatCurrency(reservation.cancellation.fee, currencyCode)}</>
            )}
            <br />
            <span className="text-xs">
              {formatDateTime(reservation.cancellation.cancelledAt)} by {reservation.cancellation.cancelledBy}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {guest?.alertNotes && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {guest.alertNotes}
          </AlertDescription>
        </Alert>
      )}

      <ReservationHeader
        reservation={reservation}
        onAction={(action) => {
          if (action === "mark-no-show") {
            noShow.mutate({ id: reservationId, payload: { chargeNoShowFee: false } });
          } else if (action === "post-adjustment") {
            openDialog("post-charge", { defaultItemType: "ADJUSTMENT" });
          } else {
            openDialog(action);
          }
        }}
        canCheckIn={canCheckIn}
        canCheckOut={canCheckOut}
        canCancel={canCancel}
        canNoShow={canNoShow}
        canAssignRoom={canAssignRoom}
        canPostCharge={canPostCharge}
        canPostPayment={canPostPayment}
        canCreateInvoice={canCreateInvoice}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StayInfoCard
            reservation={reservation}
            onAssignRoom={() => openDialog("assign-room")}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="folio">Folio</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="folio" className="mt-4">
              <FolioTab
                reservationId={reservationId}
                folio={folio}
                folioLoading={folioLoading}
                reservationStatus={status}
                canPostCharge={canPostCharge}
                canPostPayment={canPostPayment}
                canVoidItem={canVoidItem}
                canRefund={canRefund}
                canCreateInvoice={canCreateInvoice}
                onOpenPostCharge={(type) => openDialog("post-charge", { defaultItemType: type })}
                onOpenPostPayment={() => openDialog("post-payment")}
                onOpenVoidItem={(item) => openDialog("void-item", { item })}
                onOpenRefund={(payment) => openDialog("refund", { payment })}
              />
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <NotesCard notes={reservation.notes} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <TimelineCard reservation={reservation} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <GuestInfoCard
            guest={guest}
            reservation={reservation}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Policies &amp; Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cancellation</span>
                <Badge variant="outline">{reservation.policies.cancellationPolicy}</Badge>
              </div>
              <p className="text-xs text-muted-foreground -mt-1">
                {reservation.policies.cancellationPolicy === "FLEXIBLE" && "Free cancellation until 24h before check-in"}
                {reservation.policies.cancellationPolicy === "MODERATE" && "Free cancellation until 48h before check-in"}
                {reservation.policies.cancellationPolicy === "STRICT" && "Free cancellation until 72h before check-in"}
                {reservation.policies.cancellationPolicy === "NON_REFUNDABLE" && "Non-refundable"}
                {!["FLEXIBLE", "MODERATE", "STRICT", "NON_REFUNDABLE"].includes(reservation.policies.cancellationPolicy) && reservation.policies.cancellationPolicy}
              </p>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Guarantee</span>
                <span>
                  {reservation.policies.guaranteeType === "CREDIT_CARD" && "\uD83D\uDCB3 Card"}
                  {reservation.policies.guaranteeType === "DEPOSIT" && "\uD83D\uDCB0 Deposit"}
                  {reservation.policies.guaranteeType === "COMPANY_BILL" && "\uD83C\uDFE2 Company bill"}
                  {reservation.policies.guaranteeType === "NONE" && (
                    <span className="text-amber-600">\u26A0\uFE0F No guarantee</span>
                  )}
                </span>
              </div>
              {reservation.policies.guaranteeAmount != null && reservation.policies.guaranteeAmount > 0 && (
                <p className="text-xs text-muted-foreground text-right -mt-1">
                  {formatCurrency(reservation.policies.guaranteeAmount, currencyCode)}
                </p>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{reservation.source.bookingSource.replace(/_/g, " ")}</span>
              </div>
              {reservation.source.channelCode && (
                <p className="text-xs text-muted-foreground text-right -mt-1">
                  Channel: {reservation.source.channelCode}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Booked {formatDate(reservation.source.bookedAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CheckInDialog
        reservation={reservation}
        open={dialogState.type === "checkin"}
        onClose={closeDialog}
      />
      <CheckOutDialog
        reservation={reservation}
        open={dialogState.type === "checkout"}
        onClose={closeDialog}
      />
      <CancelDialog
        reservation={reservation}
        open={dialogState.type === "cancel"}
        onClose={closeDialog}
      />
      <AssignRoomDialog
        reservation={reservation}
        open={dialogState.type === "assign-room"}
        onClose={closeDialog}
      />
      <PostChargeDialog
        reservationId={reservationId}
        open={dialogState.type === "post-charge"}
        onClose={closeDialog}
        defaultItemType={dialogState.data?.defaultItemType}
      />
      <PostPaymentDialog
        reservationId={reservationId}
        currentBalance={reservation.financial.balance}
        open={dialogState.type === "post-payment"}
        onClose={closeDialog}
      />
      <VoidItemDialog
        reservationId={reservationId}
        item={dialogState.data?.item ?? null}
        open={dialogState.type === "void-item"}
        onClose={closeDialog}
      />
      <RefundDialog
        reservationId={reservationId}
        payment={dialogState.data?.payment ?? null}
        open={dialogState.type === "refund"}
        onClose={closeDialog}
      />
    </div>
  );
}
