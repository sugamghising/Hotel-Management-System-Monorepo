"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  LogIn,
  LogOut,
  XCircle,
  DoorOpen,
  CreditCard,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { ReservationListItem } from "@/lib/api/modules/reservations";

interface ReservationActionsProps {
  reservation: ReservationListItem;
  hotelId: string;
  onNavigate: (url: string) => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onCancel: () => void;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canCancel: boolean;
}

export function ReservationActions({
  reservation,
  hotelId,
  onNavigate,
  onCheckIn,
  onCheckOut,
  onCancel,
  canCheckIn,
  canCheckOut,
  canCancel,
}: ReservationActionsProps) {
  const status = reservation.status;

  const viewDetails = () =>
    onNavigate(`/hotels/${hotelId}/reservations/${reservation.id}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={viewDetails}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>

        {status === "CONFIRMED" && (
          <>
            <DropdownMenuSeparator />
            {canCheckIn && (
              <DropdownMenuItem onClick={onCheckIn}>
                <LogIn className="h-4 w-4 mr-2" />
                Check In
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={viewDetails}>
              <DoorOpen className="h-4 w-4 mr-2" />
              Assign Room
            </DropdownMenuItem>
            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onCancel}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {status === "CHECKED_IN" && (
          <>
            <DropdownMenuSeparator />
            {canCheckOut && (
              <DropdownMenuItem onClick={onCheckOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Check Out
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Post Charge
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                onNavigate(
                  `/hotels/${hotelId}/reservations/${reservation.id}#folio`,
                )
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              View Folio
            </DropdownMenuItem>
          </>
        )}

        {(status === "CHECKED_OUT" ||
          status === "CANCELLED" ||
          status === "NO_SHOW") && null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
