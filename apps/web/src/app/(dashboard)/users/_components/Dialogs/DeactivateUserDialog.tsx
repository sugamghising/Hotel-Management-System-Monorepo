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
import { Input } from "@/components/ui/input";
import { useDeactivateUser, useActivateUser } from "@/lib/hooks/useUsers";

interface DeactivateUserDialogProps {
  userId: string | null;
  userName: string;
  open: boolean;
  onClose: () => void;
}

export function DeactivateUserDialog({
  userId,
  userName,
  open,
  onClose,
}: DeactivateUserDialogProps) {
  const { mutate: deactivateUser, isPending: isDeactivating } =
    useDeactivateUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (!userId) return;
    deactivateUser(userId, {
      onSuccess: () => {
        setConfirmText("");
        onClose();
      },
    });
  };

  const isConfirmed = confirmText === userName;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setConfirmText("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            This will deactivate <strong>{userName}</strong>'s account. They
            will not be able to log in until reactivated.
          </p>
        </DialogHeader>

        <div className="py-2">
          <p className="text-xs font-medium mb-1">
            Type the user's name to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="h-8 text-sm"
            placeholder={userName}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfirmText("");
              onClose();
            }}
            disabled={isDeactivating}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!isConfirmed || isDeactivating}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeactivating ? "Deactivating..." : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
