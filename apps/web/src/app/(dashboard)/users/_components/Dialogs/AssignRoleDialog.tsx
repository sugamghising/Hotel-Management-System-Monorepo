"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Toggle } from "./Toggle";
import { useAssignUserRole, useRemoveUserRole } from "@/lib/hooks/useUsers";
import { useRoles } from "@/lib/hooks/useRoles";
import { useHotels } from "@/lib/hooks/useHotels";
import type { UserRole } from "@/lib/hooks/useUsers";

interface AssignRoleDialogProps {
  userId: string | null;
  userName: string;
  open: boolean;
  onClose: () => void;
}

export function AssignRoleDialog({
  userId,
  userName,
  open,
  onClose,
}: AssignRoleDialogProps) {
  const { mutate: assignRole, isPending } = useAssignUserRole();
  const { data: rolesData } = useRoles();
  const { data: hotelsData } = useHotels();

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isOrgWide, setIsOrgWide] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const roles = rolesData?.roles ?? [];
  const hotels = hotelsData?.hotels ?? [];

  const handleSave = () => {
    if (!userId || !selectedRoleId) return;
    assignRole(
      {
        id: userId,
        input: {
          roleId: selectedRoleId,
          hotelId: isOrgWide ? null : selectedHotelId || null,
        },
      },
      {
        onSuccess: () => {
          setSelectedRoleId("");
          setIsOrgWide(true);
          setSelectedHotelId("");
          onClose();
        },
      },
    );
  };

  const isValid = selectedRoleId && (isOrgWide || selectedHotelId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Role — {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs font-medium">Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium cursor-pointer">
                Organization-wide
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Applies to all hotels
              </p>
            </div>
            <Toggle
              checked={isOrgWide}
              onCheckedChange={(v) => {
                setIsOrgWide(v);
                if (v) setSelectedHotelId("");
              }}
            />
          </div>

          {!isOrgWide && (
            <div>
              <Label className="text-xs font-medium">Hotel</Label>
              <Select
                value={selectedHotelId}
                onValueChange={setSelectedHotelId}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="Select a hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSave}>
            {isPending ? "Assigning..." : "Assign Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
