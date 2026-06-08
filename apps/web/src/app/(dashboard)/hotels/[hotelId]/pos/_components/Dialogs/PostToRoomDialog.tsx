"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { usePostPOSToRoom, usePOSOrder } from "@/lib/hooks/usePOS";
import { useInHouseGuests } from "@/lib/hooks/useReservations";
import { Search, Check } from "lucide-react";

interface PostToRoomDialogProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  currencyCode: string;
}

export function PostToRoomDialog({ orderId, open, onClose, currencyCode }: PostToRoomDialogProps) {
  const { data: order } = usePOSOrder(orderId);
  const { data: guestsData } = useInHouseGuests();
  const { mutate: postToRoom, isPending } = usePostPOSToRoom();

  const [search, setSearch] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const guests = guestsData ?? [];

  const filtered = useMemo(() => {
    if (!search) return guests.slice(0, 5);
    const q = search.toLowerCase();
    return guests
      .filter(
        (g) =>
          g.roomNumber?.toLowerCase().includes(q) ||
          `${g.firstName} ${g.lastName}`.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [guests, search]);

  const selectedGuest = useMemo(() => {
    return guests.find((g) => g.reservationId === selectedReservationId);
  }, [guests, selectedReservationId]);

  const handleSubmit = () => {
    if (!orderId || !selectedReservationId) return;
    postToRoom(
      { orderId, reservationId: selectedReservationId },
      {
        onSuccess: () => {
          setSearch("");
          setSelectedReservationId("");
          setConfirmed(false);
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setSearch("");
    setSelectedReservationId("");
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Post to Guest Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!selectedGuest ? (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Room number or guest name..."
                  className="pl-8 h-8 text-sm"
                />
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No in-house guests found
                  </p>
                ) : (
                  filtered.map((guest) => (
                    <button
                      key={guest.reservationId}
                      onClick={() => setSelectedReservationId(guest.reservationId)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/50 text-left"
                    >
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        Room {guest.roomNumber}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(guest.checkIn)} - {formatDate(guest.checkOut)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    Room {selectedGuest.roomNumber}
                  </Badge>
                  <span className="text-sm font-medium">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(selectedGuest.checkIn)} - {formatDate(selectedGuest.checkOut)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Confirmation: {selectedGuest.confirmationCode}
                </p>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Amount to post</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(order?.total ?? 0, currencyCode)}
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="text-xs text-muted-foreground">
                  I confirm this is the correct guest
                </span>
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
            {selectedGuest ? "Back" : "Cancel"}
          </Button>
          {selectedGuest && (
            <Button size="sm" disabled={!confirmed || isPending} onClick={handleSubmit}>
              {isPending ? "Posting..." : "Post Charges"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
