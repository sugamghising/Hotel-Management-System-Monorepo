"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VIP_MAP } from "@/lib/constants/statuses";
import { useUpdateGuestVip, type VIPStatus } from "@/lib/hooks/useGuests";
import { cn } from "@/lib/utils";
import { vipOptions } from "@/lib/constants/guests";
import { AlertTriangle } from "lucide-react";

const tierOrder: Record<string, number> = {
  NONE: 0, BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4, BLACK: 5,
};

interface UpdateVipDialogProps {
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    vipStatus: VIPStatus;
    vipReason: string | null;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function UpdateVipDialog({ guest, open, onClose }: UpdateVipDialogProps) {
  const { mutate, isPending } = useUpdateGuestVip();
  const [selectedStatus, setSelectedStatus] = useState<VIPStatus>("NONE");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (guest && open) {
      setSelectedStatus(guest.vipStatus);
      setReason(guest.vipReason ?? "");
    }
  }, [guest, open]);

  if (!guest) return null;

  const isDowngrade = tierOrder[selectedStatus] < tierOrder[guest.vipStatus];
  const needsReason =
    selectedStatus === "GOLD" || selectedStatus === "PLATINUM" || selectedStatus === "BLACK";
  const isValid = !needsReason || reason.trim().length > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    mutate(
      {
        id: guest.id,
        vipStatus: selectedStatus,
        vipReason: reason.trim() || undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Update VIP Status — {guest.firstName} {guest.lastName}
          </DialogTitle>
          <DialogDescription>
            Change the VIP tier for this guest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <Badge
              className={cn(
                "font-medium text-xs px-2 py-0.5 border",
                VIP_MAP[guest.vipStatus].color,
              )}
            >
              {VIP_MAP[guest.vipStatus].label}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>New VIP Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as VIPStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vipOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(needsReason || reason) && (
            <div className="space-y-2">
              <Label>
                Reason {needsReason && "*"}
              </Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for VIP status (e.g. loyal guest, CEO)"
                rows={3}
              />
            </div>
          )}

          {isDowngrade && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 text-sm">
                This will downgrade the guest's VIP status.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isPending}>
            {isPending ? "Updating..." : "Update VIP Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
