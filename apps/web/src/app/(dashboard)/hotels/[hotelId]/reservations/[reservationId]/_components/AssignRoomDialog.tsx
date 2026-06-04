"use client";

import { useState } from "react";
import type { Reservation } from "@/lib/api/modules/reservations";
import { useAssignRoom } from "@/lib/hooks/useReservations";
import { useRooms } from "@/lib/hooks/useRooms";
import { usePermission } from "@/lib/hooks/usePermission";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AssignRoomDialogProps {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
}

export function AssignRoomDialog({ reservation, open, onClose }: AssignRoomDialogProps) {
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [forceAssign, setForceAssign] = useState(false);
  const assignRoom = useAssignRoom();
  const canOverride = usePermission("RESERVATION.OVERRIDE_BALANCE");
  const rooms = useRooms({
    roomTypeId: reservation?.rooms[0]?.roomTypeId,
    status: "VACANT_CLEAN",
  });

  if (!reservation) return null;

  const availableRooms = rooms.data?.rooms ?? [];

  const handleConfirm = () => {
    if (!selectedRoomId) return;
    assignRoom.mutate(
      { id: reservation.id, payload: { roomId: selectedRoomId, force: forceAssign } },
      {
        onSuccess: () => {
          setSelectedRoomId("");
          setForceAssign(false);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setSelectedRoomId("");
          setForceAssign(false);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Guest</p>
            <p className="font-medium">{reservation.guests.primaryGuestName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Room Type</p>
            <p className="font-medium">
              {reservation.rooms[0]?.roomTypeName ?? "Not specified"}
            </p>
          </div>
          {rooms.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading rooms...</p>
          ) : availableRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available rooms found</p>
          ) : (
            <div>
              <Label>Select Room</Label>
              <RadioGroup value={selectedRoomId} onValueChange={setSelectedRoomId} className="mt-2 space-y-2">
                {availableRooms.map((room) => {
                  const isAssigned = room.id === reservation.rooms[0]?.roomId;
                  return (
                    <div
                      key={room.id}
                      className={`flex items-center gap-3 rounded-md border p-3 ${
                        isAssigned ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={room.id} id={room.id} />
                      <Label htmlFor={room.id} className="flex flex-1 items-center justify-between">
                        <span>
                          {room.identification.roomNumber}
                          {room.identification.floor ? ` - Floor ${room.identification.floor}` : ""}
                        </span>
                        <Badge variant={isAssigned ? "default" : "outline"}>
                          {room.status.current}
                        </Badge>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}
          {canOverride && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={forceAssign}
                onChange={(e) => setForceAssign(e.target.checked)}
              />
              <span className="text-sm">Force assign</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRoomId || assignRoom.isPending}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
