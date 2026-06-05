"use client";

import { useParams } from "next/navigation";
import { ReservationBadge } from "@/components/status/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils/formatters";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  XCircle,
  UserX,
  BedDouble,
  Plus,
  MoreHorizontal,
  ChevronDown,
  FileText,
} from "lucide-react";
import type { Reservation } from "@/lib/api/modules/reservations";

interface ReservationHeaderProps {
  reservation: Reservation;
  onAction: (action: string) => void;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canCancel: boolean;
  canNoShow: boolean;
  canAssignRoom: boolean;
  canPostCharge: boolean;
  canPostPayment: boolean;
  canCreateInvoice: boolean;
}

export function ReservationHeader({
  reservation,
  onAction,
  canCheckIn,
  canCheckOut,
  canCancel,
  canNoShow,
  canAssignRoom,
  canPostCharge,
  canPostPayment,
  canCreateInvoice,
}: ReservationHeaderProps) {
  const params = useParams<{ hotelId: string }>();
  const hotelId = params?.hotelId ?? "";

  const status = reservation.status.reservation;
  const checkInStatus = reservation.status.checkIn;

  const renderActions = () => {
    switch (status) {
      case "CONFIRMED":
        return (
          <>
            {canNoShow && (
              <Button
                variant="ghost"
                onClick={() => onAction("mark-no-show")}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <UserX className="h-4 w-4" />
                No Show
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                onClick={() => onAction("cancel")}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            )}
            {canAssignRoom && (
              <Button
                variant="outline"
                onClick={() => onAction("assign-room")}
              >
                <BedDouble className="h-4 w-4" />
                Assign Room
              </Button>
            )}
            {canCheckIn && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => onAction("checkin")}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Check In
              </Button>
            )}
          </>
        );

      case "CHECKED_IN":
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                  More
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canCreateInvoice && (
                  <DropdownMenuItem onClick={() => onAction("create-invoice")}>
                    <FileText className="h-4 w-4" />
                    Create Invoice
                  </DropdownMenuItem>
                )}
                {canCreateInvoice && canNoShow && (
                  <DropdownMenuSeparator />
                )}
                {canNoShow && (
                  <DropdownMenuItem onClick={() => onAction("mark-no-show")}>
                    <UserX className="h-4 w-4" />
                    Mark No-Show
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {canPostPayment && (
              <Button
                variant="outline"
                onClick={() => onAction("post-payment")}
              >
                <Plus className="h-4 w-4" />
                Post Payment
              </Button>
            )}
            {canPostCharge && (
              <Button
                variant="outline"
                onClick={() => onAction("post-charge")}
              >
                <Plus className="h-4 w-4" />
                Post Charge
              </Button>
            )}
            {canCheckOut && (
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => onAction("checkout")}
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Check Out
              </Button>
            )}
          </>
        );

      case "CHECKED_OUT":
        return (
          <>
            {canPostCharge && (
              <Button
                variant="ghost"
                onClick={() => onAction("post-adjustment")}
              >
                <Plus className="h-4 w-4" />
                Post Adjustment
              </Button>
            )}
            {canCreateInvoice && (
              <Button
                variant="outline"
                onClick={() => onAction("create-invoice")}
              >
                <FileText className="h-4 w-4" />
                Create Invoice
              </Button>
            )}
          </>
        );

      case "CANCELLED":
        return (
          <span className="text-sm text-muted-foreground">
            Cancelled on{" "}
            {formatDate(
              reservation.cancellation?.cancelledAt ??
                reservation.modifiedAt,
            )}
          </span>
        );

      case "NO_SHOW":
        return (
          <span className="text-sm text-muted-foreground">No-show</span>
        );

      default:
        return null;
    }
  };

  return (
    <PageHeader
      breadcrumb={[
        {
          label: "Reservations",
          href: `/hotels/${hotelId}/reservations`,
        },
        { label: reservation.confirmationNumber },
      ]}
      title={reservation.confirmationNumber}
      subtitle={reservation.guests.primaryGuestName}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <ReservationBadge status={status} />
            {(checkInStatus === "EARLY_CHECK_IN" ||
              checkInStatus === "LATE_CHECK_OUT") && (
              <span className="text-xs text-muted-foreground ml-1">
                {checkInStatus === "EARLY_CHECK_IN"
                  ? "Early check-in"
                  : "Late check-out"}
              </span>
            )}
          </div>
          {renderActions()}
        </div>
      }
    />
  );
}
